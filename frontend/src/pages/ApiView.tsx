import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useClassFilter } from '../context/ClassFilter'

type MasterRow = {
  trainee: string
  class: string | number
  gaps_count: number
  status: string
  [key: string]: any
}

export const SECTION_CONFIGS: Record<
  string,
  {
    label: string
    description: string
    icon?: string
    columns: { key: string; label: string; minReq?: number }[]
  }
> = {
  age: {
    label: 'Age Groups',
    description: 'Case counts by patient age category',
    icon: '',
    columns: [
      { key: 'Neonate_count', label: 'Neonate', minReq: 5 },
      { key: '45-week PMA to 6-month PMA_count', label: '45wk – 6mo', minReq: 5 },
      { key: '7 mo - 2 years_count', label: '7mo – 2yr', minReq: 20 },
      { key: '3 - 6 years_count', label: '3 – 6yr', minReq: 20 },
      { key: '7 - 12 years_count', label: '7 – 12yr', minReq: 20 },
      { key: '13 - 17 years_count', label: '13 – 17yr', minReq: 20 },
    ],
  },
  asa: {
    label: 'ASA Classification',
    description: 'Case counts by ASA physical status',
    icon: '',
    columns: [
      { key: 'ASA_I_count', label: 'ASA I', minReq: 25 },
      { key: 'ASA_II_count', label: 'ASA II', minReq: 50 },
      { key: 'ASA_III_count', label: 'ASA III', minReq: 60 },
      { key: 'ASA_IV_count', label: 'ASA IV', minReq: 30 },
    ],
  },
  surgical: {
    label: 'Surgical Procedures',
    description: 'Case counts by surgical specialty',
    icon: '',
    columns: [
      { key: 'airway_surgery_count', label: 'Airway', minReq: 10 },
      { key: 'cardiac_with_bypass_count', label: 'Cardiac w/ Bypass', minReq: 10 },
      { key: 'cardiac_without_bypass_count', label: 'Cardiac w/o Bypass', minReq: 10 },
      { key: 'craniofacial_reconstruction_count', label: 'Craniofacial', minReq: 5 },
      { key: 'neurosurgery_count', label: 'Neurosurgery', minReq: 10 },
      { key: 'spinal_fusion_count', label: 'Spinal Fusion', minReq: 5 },
    ],
  },
  neonatal: {
    label: 'Neonatal Procedures',
    description: 'Case counts for neonatal surgical cases',
    icon: '',
    columns: [
      { key: 'neonatal_intestinal_surgery_count', label: 'Intestinal Surgery', minReq: 5 },
      { key: 'neonatal_surgical_cases_count', label: 'Surgical Cases', minReq: 5 },
    ],
  },
  airway: {
    label: 'Anesthesiology Procedures – Airways',
    description: 'Airway management and anesthetic airway techniques',
    icon: '',
    columns: [
      { key: 'direct_laryngoscopy_count', label: 'Direct Laryngoscopy', minReq: 200 },
      { key: 'flexible_bronchoscopy_count', label: 'Flexible Bronchoscopy', minReq: 5 },
      { key: 'natural_airway_count', label: 'Natural Airway', minReq: 25 },
      { key: 'supraglottic_airway_count', label: 'Supraglottic Airway', minReq: 50 },
      { key: 'video_laryngoscopy_count', label: 'Video Laryngoscopy', minReq: 10 },
    ],
  },
  line_block: {
    label: 'Anesthesiology Procedures – Lines and Blocks',
    description: 'Vascular access and regional anesthesia procedures',
    icon: '',
    columns: [
      {
        key: 'arterial_line_placement_count',
        label: 'Arterial Line',
        minReq: 25,
      },
      {
        key: 'central_venous_line_placement_count',
        label: 'Central Venous Line',
        minReq: 20,
      },
      {
        key: 'neuraxial_block_including_intrathecal_epidural_and_caudal_count',
        label: 'Neuraxial Block',
        minReq: 25,
      },
      {
        key: 'regional_anesthesia_peripheral_nerve_block_count',
        label: 'Peripheral Nerve Block',
        minReq: 40,
      },
    ],
  },
}

function friendlyName(name: string): string {
  const parts = name.replace(', ', ',').split(' ')
  const last = parts[parts.length - 1]
  const first = parts[0].replace(/\([^)]*\)/, '').trim()
  return [first, last].filter(Boolean).join(' ')
}

function initials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getValue(row: MasterRow, key: string) {
  const value = Number(row[key] ?? 0)
  return Number.isFinite(value) ? value : 0
}

function getStatusColor(value: number, minReq?: number): 'red' | 'yellow' | 'green' | 'gray' {
  if (minReq == null || minReq <= 0) return 'gray'
  const pct = value / minReq
  if (pct < 0.5) return 'red'
  if (pct < 1) return 'yellow'
  return 'green'
}

function StatusPill({ value, minReq }: { value: number; minReq?: number }) {
  const color = getStatusColor(value, minReq)

  if (color === 'gray') {
    return <span className="api-cell-value">{value}</span>
  }

  return (
    <span
      className={`api-cell-pill ${
        color === 'green' ? 'met' : color === 'yellow' ? 'yellow' : 'unmet'
      }`}
    >
      {value}
    </span>
  )
}

export default function ApiView() {
  const { api } = useParams<{ api: string }>()
  const { selectedClass } = useClassFilter()

  const config = api ? SECTION_CONFIGS[api] : null

  const [allRows, setAllRows] = useState<MasterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    if (!config) return

    const qs = selectedClass ? `?class=${encodeURIComponent(selectedClass)}` : ''

    setLoading(true)
    setError('')

    fetch(`/api/master${qs}`)
      .then(r => r.json())
      .then(data => {
        if (data?.error) throw new Error(data.error)
        setAllRows(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch((e: Error) => {
        setError(e.message || 'Failed to load data')
        setLoading(false)
      })
  }, [config, selectedClass])

  const rows = useMemo(() => allRows, [allRows])

  const sortedRows = useMemo(() => {
    const copy = [...rows]

    copy.sort((a, b) => {
      if (!sortCol) {
        const aGapCount = config
          ? config.columns.filter(col => getStatusColor(getValue(a, col.key), col.minReq) !== 'green').length
          : 0
        const bGapCount = config
          ? config.columns.filter(col => getStatusColor(getValue(b, col.key), col.minReq) !== 'green').length
          : 0

        if (aGapCount !== bGapCount) return bGapCount - aGapCount

        return friendlyName(a.trainee).localeCompare(friendlyName(b.trainee))
      }

      const av = getValue(a, sortCol)
      const bv = getValue(b, sortCol)

      return sortDir === 'asc' ? av - bv : bv - av
    })

    return copy
  }, [rows, sortCol, sortDir, config])

  if (!config) {
    return <div style={{ color: 'var(--red)', padding: 20 }}>Unknown section: {api}</div>
  }

  if (error) {
    return <div style={{ color: 'var(--red)', padding: 20 }}>Error loading data: {error}</div>
  }

  const traineesWithGaps = rows.filter(row =>
    config.columns.some(col => getStatusColor(getValue(row, col.key), col.minReq) !== 'green')
  ).length

  const handleSort = (key: string) => {
    if (sortCol === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(key)
      setSortDir('desc')
    }
  }

  return (
    <div>
      <Link to="/" className="back-button">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M12 4l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Overview
      </Link>

      <div className="api-view-hero">
        <div className="api-view-hero-info">
          <div className="api-view-hero-title">{config.label}</div>
          <div className="api-view-hero-sub">{config.description}</div>
        </div>

        <div className="api-view-hero-stats">
          <div className="api-view-stat">
            <div className="api-view-stat-value">{rows.length}</div>
            <div className="api-view-stat-label">Trainees</div>
          </div>

          <div className="api-view-stat">
            <div
              className="api-view-stat-value"
              style={{ color: traineesWithGaps > 0 ? '#FFD2CC' : '#D7F5E2' }}
            >
              {traineesWithGaps}
            </div>
            <div className="api-view-stat-label">With Gaps</div>
          </div>

          <div className="api-view-stat">
            <div className="api-view-stat-value">{config.columns.length}</div>
            <div className="api-view-stat-label">Categories</div>
          </div>
        </div>
      </div>

      <div className="api-table-wrap">
        {loading ? (
          <div className="api-table-loading">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 48, marginBottom: 4, borderRadius: 8 }}
              />
            ))}
          </div>
        ) : (
          <table className="api-matrix-table">
            <thead>
              <tr>
                <th className="api-th api-th-name">Trainee</th>
                <th className="api-th api-th-class">Class</th>

                {config.columns.map(col => (
                  <th
                    key={col.key}
                    className={`api-th api-th-data ${sortCol === col.key ? 'active' : ''}`}
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="api-th-inner">
                      {col.label}
                      <span className="api-sort-icon">
                        {sortCol === col.key ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
                      </span>
                    </span>
                  </th>
                ))}
              </tr>

              <tr className="api-th-minreq-row">
                <td className="api-th-minreq-cell api-th-minreq-label">Min. Required</td>
                <td className="api-th-minreq-cell" />
                {config.columns.map(col => (
                  <td key={col.key} className="api-th-minreq-cell">
                    {col.minReq != null ? (
                      <span className="api-minreq-badge">{col.minReq}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                ))}
              </tr>
            </thead>

            <tbody>
              {sortedRows.map((row, idx) => {
                const displayName = friendlyName(row.trainee)
                const rowGapCount = config.columns.filter(
                  col => getStatusColor(getValue(row, col.key), col.minReq) !== 'green'
                ).length

                return (
                  <tr
                    key={`${row.class}-${row.trainee}`}
                    className={`api-row ${rowGapCount > 0 ? 'has-gaps' : ''}`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                    onClick={() =>
                      (window.location.href = `/fellow/${encodeURIComponent(row.trainee)}`)
                    }
                  >
                    <td className="api-td api-td-name">
                      <div className="api-trainee-cell">
                        <div className="api-trainee-avatar">{initials(displayName)}</div>
                        <div>
                          <div className="api-trainee-name">{displayName}</div>
                          {rowGapCount > 0 && (
                            <div className="api-trainee-gaps">
                              {rowGapCount} gap{rowGapCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="api-td api-td-class">
                      <span className="api-class-badge">{row.class}</span>
                    </td>

                    {config.columns.map(col => {
                      const value = getValue(row, col.key)
                      return (
                        <td key={col.key} className="api-td api-td-data">
                          <StatusPill value={value} minReq={col.minReq} />
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}