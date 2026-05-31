import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useClassFilter } from '../context/ClassFilter'

type RequirementConfig = {
  label: string
  threshold: number
}

type RequirementGroup = {
  label: string
  subcategories?: Record<string, RequirementConfig>
}

const REQUIREMENTS: Record<string, RequirementGroup> = {
  age: {
    label: 'Age Groups',
    subcategories: {
      'Neonate': { label: 'Neonate', threshold: 5 },
      '45-week PMA to 6-month PMA': { label: '45-week PMA to 6-month PMA', threshold: 5 },
      '7 mo - 2 years': { label: '7mo – 2 years', threshold: 20 },
      '3 - 6 years': { label: '3 – 6 years', threshold: 20 },
      '7 - 12 years': { label: '7 – 12 years', threshold: 20 },
      '13 - 17 years': { label: '13 – 17 years', threshold: 20 },
    },
  },
  asa: {
    label: 'ASA Classifications',
    subcategories: {
      'ASA_I': { label: 'ASA I', threshold: 25 },
      'ASA_II': { label: 'ASA II', threshold: 50 },
      'ASA_III': { label: 'ASA III', threshold: 60 },
      'ASA_IV': { label: 'ASA IV', threshold: 30 },
    },
  },
  surgical: {
    label: 'Surgical Procedures',
    subcategories: {
      'airway_surgery': { label: 'Airway Surgery', threshold: 10 },
      'cardiac_with_bypass': { label: 'Cardiac with Bypass', threshold: 10 },
      'cardiac_without_bypass': { label: 'Cardiac without Bypass', threshold: 10 },
      'craniofacial_reconstruction': { label: 'Craniofacial Reconstruction', threshold: 5 },
      'neurosurgery': { label: 'Neurosurgery', threshold: 10 },
      'spinal_fusion': { label: 'Spinal Fusion', threshold: 5 },
    },
  },
  neonatal: {
    label: 'Neonatal Procedures',
    subcategories: {
      'neonatal_intestinal_surgery': { label: 'Neonatal Intestinal Surgery', threshold: 5 },
      'neonatal_surgical_cases': { label: 'Neonatal Surgical Cases', threshold: 5 },
    },
  },
    airway: {
    label: 'Anesthesiology Procedures – Airways',
    subcategories: {
        'direct_laryngoscopy': { label: 'Direct Laryngoscopy', threshold: 200 },
        'flexible_bronchoscopy': { label: 'Flexible Bronchoscopy', threshold: 5 },
        'natural_airway': { label: 'Natural Airway', threshold: 25 },
        'supraglottic_airway': { label: 'Supraglottic Airway', threshold: 50 },
        'video_laryngoscopy': { label: 'Video Laryngoscopy', threshold: 10 },
    },
  },
  line_block: {
    label: 'Anesthesiology Procedures – Lines and Blocks',
    subcategories: {
      'arterial_line_placement': {
        label: 'Arterial Line',
        threshold: 25,
      },
      'central_venous_line_placement': {
        label: 'Central Venous Line',
        threshold: 20,
      },
      'neuraxial_block_including_intrathecal_epidural_and_caudal': {
        label: 'Neuraxial Block',
        threshold: 25,
      },
      'regional_anesthesia_peripheral_nerve_block': {
        label: 'Peripheral Nerve Block',
        threshold: 40,
      },
    },
  },

}

interface FellowDataRow {
  trainee: string
  class: string | number
  gaps_count: number
  status: string
  [key: string]: any
}

function friendlyName(name: string): string {
  const parts = name.replace(', ', ',').split(' ')
  const last = parts[parts.length - 1]
  const first = parts[0].replace(/\([^)]*\)/, '').trim()
  return [first, last].filter(Boolean).join(' ')
}

function getColor(actual: number, threshold: number): 'red' | 'yellow' | 'green' {
  const pct = actual / threshold
  if (pct < 0.5) return 'red'
  if (pct < 1) return 'yellow'
  return 'green'
}

function CategoryAccordion({
  catVal,
  data,
}: {
  catVal: RequirementGroup
  data: FellowDataRow
}) {
  const subcats = catVal.subcategories ?? {}
  const entries = Object.entries(subcats)

  const metCount = entries.filter(([k]) => {
    const actual = Number(data[`${k}_count`] ?? 0)
    return getColor(actual, subcats[k].threshold) === 'green'
  }).length

  const totalCount = entries.length
  const pct = totalCount > 0 ? metCount / totalCount : 0

  let dotColor = 'var(--red)'
  if (pct >= 1) dotColor = 'var(--green)'
  else if (pct >= 0.5) dotColor = '#F59E0B'

  return (
    <div className="category-accordion">
      <div className="category-accordion-header">
        <div className="category-status-dot" style={{ background: dotColor }} />

        <div
          className="category-accordion-title"
          style={{
            color:
              dotColor === 'var(--green)'
                ? 'var(--green)'
                : dotColor === '#F59E0B'
                  ? '#B45309'
                  : 'var(--red)',
          }}
        >
          {catVal.label}
        </div>

        <div className="category-accordion-meta">
          {metCount}/{totalCount} met
        </div>
      </div>

      <div className="category-accordion-body">
        <table className="req-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Actual</th>
              <th>Required</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {entries.map(([key, sub]) => {
              const actual = Number(data[`${key}_count`] ?? 0)
              const threshold = sub.threshold
              const pctVal = Math.min(100, Math.round((actual / threshold) * 100))
              const color = getColor(actual, threshold)

              return (
                <tr key={key}>
                  <td className="req-label">{sub.label}</td>

                  <td className={`req-actual ${color === 'green' ? 'met' : color === 'yellow' ? 'yellow' : 'unmet'}`}>
                    {actual}
                  </td>

                  <td className="req-required">{threshold}</td>

                  <td>
                    <div className="progress-bar">
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${color}`}
                          style={{ width: `${pctVal}%` }}
                        />
                      </div>
                      <span className="progress-pct">{pctVal}%</span>
                    </div>
                  </td>

                  <td>
                    {color === 'green' ? (
                      <span className="status-pill met">Met</span>
                    ) : color === 'yellow' ? (
                      <span className="status-pill yellow">In Progress</span>
                    ) : (
                      <span className="status-pill unmet">
                        -{Math.max(0, threshold - actual)}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function FellowDetail() {
  const { name } = useParams<{ name: string }>()
  const { selectedClass } = useClassFilter()

  const [data, setData] = useState<FellowDataRow | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const qs = selectedClass ? `?class=${selectedClass}` : ''

    fetch(`/api/fellow/${encodeURIComponent(name || '')}${qs}`)
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [name, selectedClass])

  if (loading || !data) return <div>Loading…</div>

  const fullName = friendlyName(data.trainee)
  const parts = data.trainee.split(' ')
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase()

  return (
    <div>
      <Link to="/" className="back-button">
        ← Back
      </Link>

      <div className="fellow-hero">
        <div className="fellow-hero-avatar">{initials}</div>

        <div className="fellow-hero-info">
          <div className="fellow-hero-name">{fullName}</div>
          <div className="fellow-hero-sub">
            Class of {data.class}
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Requirements by Category</div>
      </div>

      {Object.values(REQUIREMENTS).map((cat, i) => (
        <CategoryAccordion key={i} catVal={cat} data={data} />
      ))}
    </div>
  )
}
