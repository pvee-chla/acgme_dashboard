import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serve } from 'bun'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

const app = new Hono()

const DATA_DIR = resolve(import.meta.dir, '../../data')

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  allowMethods: ['GET'],
  allowHeaders: ['Content-Type'],
}))

function loadJson(filename: string) {
  const file = join(DATA_DIR, filename)
  return JSON.parse(readFileSync(file, 'utf-8'))
}

const datasets = {
  age: 'trainee_age_matrix.json',
  asa: 'trainee_asa_matrix.json',
  surgical: 'trainee_surgical_matrix.json',
  neonatal: 'trainee_neonatal_matrix.json',
  airway: 'trainee_airway_matrix.json',
  line_block: 'trainee_line_block_matrix.json',
}

function buildMaster() {
  const maps = Object.entries(datasets).map(([k, file]) => {
    const rows = loadJson(file)
    const map = new Map(rows.map((r: any) => [`${r.class}|${r.trainee}`, r]))
    return map
  })

  const keys = new Set(maps.flatMap(m => [...m.keys()]))

  const master: any[] = []

  for (const key of keys) {
    const [classVal, trainee] = key.split('|')

    const row: any = {
      class: classVal,
      trainee
    }

    for (const m of maps) {
      const src = m.get(key)
      if (!src) continue

      Object.entries(src).forEach(([k, v]) => {
        if (k !== 'class' && k !== 'trainee') row[k] = v
      })
    }

    master.push(row)
  }

  return master
}

function getStatus(count: number, min: number) {
  return count >= min ? 'complete' : 'requirements not met'
}

const THRESHOLDS: Record<string, number> = {
  Neonate: 5,
  '45-week PMA to 6-month PMA': 5,
  '7 mo - 2 years': 20,
  '3 - 6 years': 20,
  '7 - 12 years': 20,
  '13 - 17 years': 20,
  ASA_I: 25,
  ASA_II: 50,
  ASA_III: 60,
  ASA_IV: 30,
  airway_surgery: 10,
  cardiac_with_bypass: 10,
  cardiac_without_bypass: 10,
  craniofacial_reconstruction: 5,
  neurosurgery: 10,
  spinal_fusion: 5,
  neonatal_intestinal_surgery: 5,
  neonatal_surgical_cases: 5,
}

function addDerived(master: any[]) {
  return master.map(row => {
    let gaps = 0

    Object.keys(THRESHOLDS).forEach(key => {
      const count = row[`${key}_count`] ?? 0
      if (count < THRESHOLDS[key]) gaps++
    })

    return {
      ...row,
      gaps_count: gaps,
      status: gaps === 0 ? 'On Track' : 'Not Meeting'
    }
  })
}

function filterClass(rows: any[], cls: string | null) {
  if (!cls) return rows
  return rows.filter(r => String(r.class) === cls)
}

app.get('/api/master', (c) => {
  const cls = c.req.query('class')
  return c.json(filterClass(addDerived(buildMaster()), cls))
})

app.get('/api/sections', (c) => {
  const cls = c.req.query('class')
  const rows = filterClass(addDerived(buildMaster()), cls)

  return c.json(Object.keys(datasets).map(section => ({
    section,
    label: section,
    trainees_total: rows.length,
    trainees_on_track: rows.filter(r => r.gaps_count === 0).length
  })))
})

app.get('/api/section/:section', (c) => {
  const section = c.req.param('section')
  const cls = c.req.query('class')

  const rows = filterClass(addDerived(buildMaster()), cls)

  return c.json({
    section,
    trainees: rows.map(r => ({
      trainee: r.trainee,
      class: r.class,
      gaps_count: r.gaps_count
    }))
  })
})

app.get('/api/fellow/:name', (c) => {
  const name = decodeURIComponent(c.req.param('name'))
  const cls = c.req.query('class')

  const rows = filterClass(addDerived(buildMaster()), cls)

  const row = rows.find(r => r.trainee === name)

  if (!row) return c.json({ error: 'not found' }, 404)

  return c.json(row)
})

serve({
  fetch: app.fetch,
  port: 3003,
  localAddress: '0.0.0.0'
})