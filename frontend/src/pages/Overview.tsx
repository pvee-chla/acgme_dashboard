import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useClassFilter } from '../context/ClassFilter'

type Row = {
  trainee: string
  class: string | number
  [key: string]: any
}

const SECTION_CONFIGS = {
  age: {
    label: 'Age Groups',
    columns: [
      { key: 'Neonate_count', min: 5 },
      { key: '45-week PMA to 6-month PMA_count', min: 5 },
      { key: '7 mo - 2 years_count', min: 20 },
      { key: '3 - 6 years_count', min: 20 },
      { key: '7 - 12 years_count', min: 20 },
      { key: '13 - 17 years_count', min: 20 },
    ],
  },
  asa: {
    label: 'ASA Classifications',
    columns: [
      { key: 'ASA_I_count', min: 25 },
      { key: 'ASA_II_count', min: 50 },
      { key: 'ASA_III_count', min: 60 },
      { key: 'ASA_IV_count', min: 30 },
    ],
  },
  surgical: {
    label: 'Surgical Procedures',
    columns: [
      { key: 'airway_surgery_count', min: 10 },
      { key: 'cardiac_with_bypass_count', min: 10 },
      { key: 'cardiac_without_bypass_count', min: 10 },
      { key: 'craniofacial_reconstruction_count', min: 5 },
      { key: 'neurosurgery_count', min: 10 },
      { key: 'spinal_fusion_count', min: 5 },
    ],
  },
  neonatal: {
    label: 'Neonatal Procedures',
    columns: [
      { key: 'neonatal_intestinal_surgery_count', min: 5 },
      { key: 'neonatal_surgical_cases_count', min: 5 },
    ],
  },
  airway: {
    label: 'Anesthesiology Procedures – Airways',
    columns: [
      { key: 'direct_laryngoscopy_count', min: 200 },
      { key: 'flexible_bronchoscopy_count', min: 5 },
      { key: 'natural_airway_count', min: 25 },
      { key: 'supraglottic_airway_count', min: 50 },
      { key: 'video_laryngoscopy_count', min: 10 },
    ],
  },
  line_block: {
    label: 'Anesthesiology Procedures – Lines and Blocks',
    columns: [
      { key: 'arterial_line_placement_count', min: 25 },
      { key: 'central_venous_line_placement_count', min: 20 },
      { key: 'neuraxial_block_including_intrathecal_epidural_and_caudal_count', min: 25 },
      { key: 'regional_anesthesia_peripheral_nerve_block_count', min: 40 },
    ],
  },
}

function getColor(actual: number, min: number): 'red' | 'yellow' | 'green' {
  const pct = actual / min
  if (pct < 0.5) return 'red'
  if (pct < 1) return 'yellow'
  return 'green'
}

export default function Overview() {
  const { selectedClass } = useClassFilter()

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const qs = selectedClass ? `?class=${selectedClass}` : ''
    fetch(`/api/master${qs}`)
      .then(r => r.json())
      .then(d => {
        setRows(d)
        setLoading(false)
      })
  }, [selectedClass])

  const cards = useMemo(() => {
    return Object.entries(SECTION_CONFIGS).map(([key, config]) => {
      let totalChecks = 0
      let metChecks = 0

      let traineesComplete = 0

      rows.forEach(row => {
        let traineeComplete = true

        config.columns.forEach(col => {
          const actual = Number(row[col.key] ?? 0)
          const color = getColor(actual, col.min)

          totalChecks++
          if (color === 'green') metChecks++

          if (color !== 'green') traineeComplete = false
        })

        if (traineeComplete) traineesComplete++
      })

      const pct = totalChecks > 0 ? Math.round((metChecks / totalChecks) * 100) : 0

      const totalCategories = config.columns.length
      const categoriesComplete = config.columns.filter(col =>
        rows.every(r => getColor(Number(r[col.key] ?? 0), col.min) === 'green')
      ).length

      let colorClass = 'green'
      if (pct < 50) colorClass = 'red'
      else if (pct < 100) colorClass = 'yellow'

      return {
        key,
        label: config.label,
        pct,
        colorClass,
        traineesComplete,
        totalTrainees: rows.length,
        categoriesComplete,
        totalCategories,
      }
    })
  }, [rows])

  if (loading) return <div>Loading…</div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Cohort Overview</div>
        <div className="page-subtitle">
          {selectedClass ? `Class of ${selectedClass}` : 'All Classes'}
        </div>
      </div>

      <div className="api-cards-grid">
        {cards.map(card => (
          <Link
            key={card.key}
            to={`/api-view/${card.key}`}
            className="api-nav-card"
          >
            <div className="api-nav-card-body">
              <div className="api-nav-card-title">
                {card.label}
              </div>

              <div className="api-nav-card-desc" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* % MET */}
                <span
                  className={`status-pill ${
                    card.colorClass === 'green'
                      ? 'met'
                      : card.colorClass === 'yellow'
                        ? 'yellow'
                        : 'unmet'
                  }`}
                >
                  {card.pct}% met
                </span>

                {/* CATEGORY COMPLETION */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {card.categoriesComplete}/{card.totalCategories} categories complete
                </div>

                {/* TRAINEE COMPLETION */}
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {card.traineesComplete}/{card.totalTrainees} trainees on track
                </div>
              </div>
            </div>

            <div className="api-nav-card-arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
``