import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useClassFilter } from '../context/ClassFilter'

type Fellow = {
  trainee: string
  class: string | number
  gaps_count: number
  status: string
}

function initials(name: string) {
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function friendlyName(name: string) {
  const parts = name.replace(', ', ',').split(' ')
  const last = parts[parts.length - 1]
  const first = parts[0]
  return [first, last].join(' ')
}

export default function Layout() {
  const [fellows, setFellows] = useState<Fellow[]>([])
  const [loading, setLoading] = useState(true)

  const location = useLocation()
  const { selectedClass, setSelectedClass } = useClassFilter()

  useEffect(() => {
    fetch('/api/master')
      .then(r => r.json())
      .then(data => {
        setFellows(data)
        setLoading(false)
      })
  }, [])

  const classes = useMemo(() => {
    const set = new Set(fellows.map(f => String(f.class)))
    return Array.from(set).sort((a, b) => Number(b) - Number(a))
  }, [fellows])

  const filtered = useMemo(() => {
    if (!selectedClass) return fellows
    return fellows.filter(f => String(f.class) === selectedClass)
  }, [fellows, selectedClass])

  const total = filtered.length
  const onTrack = filtered.filter(f => f.status === 'On Track').length
  const atRisk = total - onTrack

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-title">ACGME</div>
          <div className="sidebar-brand-sub">PGY-5 Anesthesiology</div>
        </div>

        {/* Class Filter */}
        <div className="sidebar-class-filter">
          <label className="sidebar-class-label">Class</label>
          <select
            className="sidebar-class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Fellows */}
        <div className="sidebar-fellows">
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            filtered.map(f => {
              const name = friendlyName(f.trainee)
              const active = location.pathname === `/fellow/${encodeURIComponent(f.trainee)}`

              return (
                <Link
                  key={f.trainee}
                  to={`/fellow/${encodeURIComponent(f.trainee)}`}
                  className={`fellow-item ${active ? 'active' : ''}`}
                >
                  <div className="fellow-avatar">{initials(name)}</div>
                  <div className="fellow-name">{name}</div>
                  <div
                    className="fellow-status-indicator"
                    style={{ background: f.gaps_count > 0 ? 'var(--red)' : 'var(--green)' }}
                  />
                </Link>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-stat">
            <span>Total</span> <b>{total}</b>
          </div>
          <div className="sidebar-stat">
            <span>On Track</span> <b>{onTrack}</b>
          </div>
          <div className="sidebar-stat">
            <span>Attention</span> <b>{atRisk}</b>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}