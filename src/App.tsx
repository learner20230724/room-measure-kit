import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import './App.css'
import {
  calculateResults,
  FEET_TO_METERS,
  metersToFeet,
  type Preset,
  SQUARE_FEET_PER_SQUARE_METER_PER_GALLON,
  type Unit,
} from './lib/calculations'

type NumericField = 'length' | 'width' | 'height' | 'wastePercent' | 'paintCoverage'

// ── Theme ──────────────────────────────────────────────────────────────────────

const THEME_KEY = 'room-measure-kit-theme'

function getStoredTheme(): 'dark' | 'light' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') ?? 'light'
  } catch {
    return 'light'
  }
}

function applyThemeClass(theme: 'dark' | 'light') {
  if (theme === 'dark') {
    document.documentElement.classList.add('theme-dark')
  } else {
    document.documentElement.classList.remove('theme-dark')
  }
}

// ── Calculation history ────────────────────────────────────────────────────────

const HISTORY_KEY = 'room-measure-kit-history'
const MAX_HISTORY = 20

export interface HistoryEntry {
  id: string
  ts: number
  unit: Unit
  length: number
  width: number
  height: number
  wastePercent: number
  paintCoverage: number
  // snapshot of computed values
  areaSqM: number
  areaSqFt: number
  flooringSqM: number
  flooringSqFt: number
  paintLiters: number
  paintGallons: number
  wallAreaSqM: number
  wallAreaSqFt: number
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function saveHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // storage full or unavailable — silently skip
  }
}

function fmtTime(ts: number) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

const presets: Preset[] = [
  { label: 'Small bedroom', note: 'Quick flooring check for a compact room', length: 3.2, width: 3, height: 2.6 },
  { label: 'Living room', note: 'Useful when paint and flooring both matter', length: 5.8, width: 4.2, height: 2.7 },
  { label: 'Studio office', note: 'Balanced example for desks, shelves, and repainting', length: 4.5, width: 3.6, height: 2.7 },
]

function feetToMeters(value: number) {
  return value * FEET_TO_METERS
}

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value)
}

// ── PNG / PDF export ───────────────────────────────────────────────────────────

async function exportResultsPng(element: HTMLElement, filename = 'room-measure.png') {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f172a',
      scale: 2,
      useCORS: true,
      logging: false,
    })
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.error('PNG export failed:', err)
  }
}

function exportResultsPdf(element: HTMLElement, filename = 'room-measure.pdf') {
  try {
    html2canvas(element, { backgroundColor: '#0f172a', scale: 2, useCORS: true, logging: false }).then(
      (canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const isLandscape = canvas.width > canvas.height
        const pdf = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'px' })
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
        pdf.save(filename)
      },
    )
  } catch (err) {
    console.error('PDF export failed:', err)
  }
}

// URL state — encode/decode room inputs as query string params
function encodeRoomState(params: {
  unit: Unit
  length: number
  width: number
  height: number
  wastePercent: number
  paintCoverage: number
}): string {
  const sp = new URLSearchParams()
  sp.set('u', params.unit)
  sp.set('l', String(Math.round(params.length * 100) / 100))
  sp.set('w', String(Math.round(params.width * 100) / 100))
  sp.set('h', String(Math.round(params.height * 100) / 100))
  sp.set('wp', String(Math.round(params.wastePercent * 10) / 10))
  sp.set('pc', String(Math.round(params.paintCoverage * 10) / 10))
  return sp.toString()
}

function decodeRoomState(search: string): {
  unit: Unit
  length: number
  width: number
  height: number
  wastePercent: number
  paintCoverage: number
} | null {
  try {
    const sp = new URLSearchParams(search)
    const u = sp.get('u')
    const l = parseFloat(sp.get('l') ?? '')
    const w = parseFloat(sp.get('w') ?? '')
    const h = parseFloat(sp.get('h') ?? '')
    const wp = parseFloat(sp.get('wp') ?? '')
    const pc = parseFloat(sp.get('pc') ?? '')
    if (u !== 'm' && u !== 'ft') return null
    if (!Number.isFinite(l) || l <= 0) return null
    if (!Number.isFinite(w) || w <= 0) return null
    if (!Number.isFinite(h) || h <= 0) return null
    if (!Number.isFinite(wp) || wp < 0) return null
    if (!Number.isFinite(pc) || pc <= 0) return null
    return { unit: u, length: l, width: w, height: h, wastePercent: wp, paintCoverage: pc }
  } catch {
    return null
  }
}

function getInitialRoomState() {
  if (typeof window === 'undefined') return null
  return decodeRoomState(window.location.search)
}

const _initial = getInitialRoomState()

function App() {
  const [unit, setUnit] = useState<Unit>(_initial?.unit ?? 'm')
  const [length, setLength] = useState(_initial?.length ?? 5.2)
  const [width, setWidth] = useState(_initial?.width ?? 3.8)
  const [height, setHeight] = useState(_initial?.height ?? 2.7)
  const [wastePercent, setWastePercent] = useState(_initial?.wastePercent ?? 8)
  const [paintCoverage, setPaintCoverage] = useState(_initial?.paintCoverage ?? 10)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(getStoredTheme)
  const [showHistory, setShowHistory] = useState(false)
  const [calcHistory, setCalcHistory] = useState<HistoryEntry[]>(() => loadHistory())
  // Track last saved sig to avoid duplicate saves on re-render
  const lastSavedRef = useRef<string>('')
  // Ref for the results panel (used by PNG/PDF export)
  const resultPanelRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    return calculateResults({
      unit,
      length,
      width,
      height,
      wastePercent,
      paintCoverage,
    })
  }, [height, length, paintCoverage, unit, wastePercent, width])

  // Keep URL in sync with state (no history entry, just replace).
  // Skip first mount — only write URL when user changes an input.

  // Apply theme on mount and whenever it changes.
  useEffect(() => {
    applyThemeClass(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])
  const isFirstRenderRef = useRef(true)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    const qs = encodeRoomState({ unit, length, width, height, wastePercent, paintCoverage })
    window.history.replaceState(null, '', '?' + qs)
  }, [unit, length, width, height, wastePercent, paintCoverage])

  // Save to localStorage and update calcHistory state.
  // We track the previous history array in a ref so we can call setCalcHistory
  // only when the new array reference differs (avoids cascading renders / lint error).
  const prevHistoryRef = useRef<HistoryEntry[]>([])
  useEffect(() => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ts: Date.now(),
      unit,
      length,
      width,
      height,
      wastePercent,
      paintCoverage,
      areaSqM: results.areaSqM,
      areaSqFt: results.areaSqFt,
      flooringSqM: results.flooringSqM,
      flooringSqFt: results.flooringSqFt,
      paintLiters: results.paintLiters,
      paintGallons: results.paintGallons,
      wallAreaSqM: results.wallAreaSqM,
      wallAreaSqFt: results.wallAreaSqFt,
    }
    const sig = `${unit}|${length}|${width}|${height}|${wastePercent}|${paintCoverage}`
    if (sig === lastSavedRef.current) return
    lastSavedRef.current = sig

    const next = [entry, ...prevHistoryRef.current].slice(0, MAX_HISTORY)
    saveHistory(next)
    prevHistoryRef.current = next
    setCalcHistory(next)
  }, [unit, length, width, height, wastePercent, paintCoverage, results])

  const clearHistory = useCallback(() => {
    prevHistoryRef.current = []
    saveHistory([])
    setCalcHistory([])
  }, [])

  function restoreEntry(entry: HistoryEntry) {
    lastSavedRef.current = `${entry.unit}|${entry.length}|${entry.width}|${entry.height}|${entry.wastePercent}|${entry.paintCoverage}`
    setUnit(entry.unit)
    setLength(entry.length)
    setWidth(entry.width)
    setHeight(entry.height)
    setWastePercent(entry.wastePercent)
    setPaintCoverage(entry.paintCoverage)
    setShowHistory(false)
  }

  const summary = useMemo(() => {
    return [
      `Room: ${formatNumber(results.areaSqM)} m² (${formatNumber(results.areaSqFt)} ft²)`,
      `Perimeter: ${formatNumber(results.perimeterM)} m (${formatNumber(results.perimeterFt)} ft)`,
      `Wall area: ${formatNumber(results.wallAreaSqM)} m²`,
      `Flooring with ${formatNumber(wastePercent, 1)}% waste: ${formatNumber(results.flooringSqM)} m²`,
      `Paint needed at ${formatNumber(paintCoverage, 1)} ${unit === 'm' ? 'm²/L' : 'ft²/gal'}: ${formatNumber(unit === 'm' ? results.paintLiters : results.paintGallons)} ${unit === 'm' ? 'L' : 'gal'}`,
    ].join('\n')
  }, [paintCoverage, results.areaSqFt, results.areaSqM, results.flooringSqM, results.paintGallons, results.paintLiters, results.perimeterFt, results.perimeterM, results.wallAreaSqM, unit, wastePercent])

  function handleUnitChange(nextUnit: Unit) {
    if (nextUnit === unit) return

    const convertDimension = nextUnit === 'm' ? feetToMeters : metersToFeet
    const convertCoverage =
      nextUnit === 'm'
        ? (value: number) => value / SQUARE_FEET_PER_SQUARE_METER_PER_GALLON
        : (value: number) => value * SQUARE_FEET_PER_SQUARE_METER_PER_GALLON

    setLength((value) => Number(convertDimension(value).toFixed(2)))
    setWidth((value) => Number(convertDimension(value).toFixed(2)))
    setHeight((value) => Number(convertDimension(value).toFixed(2)))
    setPaintCoverage((value) => Number(convertCoverage(value).toFixed(2)))
    setUnit(nextUnit)
  }

  function handleNumberChange(field: NumericField, value: string) {
    const next = Number(value)
    const safeValue = Number.isFinite(next) ? next : 0

    if (field === 'length') setLength(safeValue)
    if (field === 'width') setWidth(safeValue)
    if (field === 'height') setHeight(safeValue)
    if (field === 'wastePercent') setWastePercent(safeValue)
    if (field === 'paintCoverage') setPaintCoverage(safeValue)
  }

  function applyPreset(preset: Preset) {
    if (unit === 'm') {
      setLength(preset.length)
      setWidth(preset.width)
      setHeight(preset.height)
      return
    }

    setLength(Number(metersToFeet(preset.length).toFixed(2)))
    setWidth(Number(metersToFeet(preset.width).toFixed(2)))
    setHeight(Number(metersToFeet(preset.height).toFixed(2)))
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 1500)
    } catch {
      setLinkCopied(false)
    }
  }

  const dimensionUnit = unit
  const areaUnit = unit === 'm' ? 'm²' : 'ft²'

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <span className="eyebrow">Room Measure Kit</span>
          <h1>Measure a room, then get flooring and paint estimates in one pass.</h1>
          <p className="hero-copy">
            Lightweight room math for quick renovation planning. Built for rectangular rooms,
            with unit switching, waste allowance, and a shareable summary.
          </p>
        </div>
        <div className="hero-actions">
          <div className="unit-toggle" role="tablist" aria-label="Choose unit">
            <button
              className={unit === 'm' ? 'active' : ''}
              onClick={() => handleUnitChange('m')}
              type="button"
            >
              Metric
            </button>
            <button
              className={unit === 'ft' ? 'active' : ''}
              onClick={() => handleUnitChange('ft')}
              type="button"
            >
              Imperial
            </button>
          </div>
          <button className="copy-button" onClick={copyLink} type="button" title="Copy a shareable link with current room inputs">
            {linkCopied ? 'Link copied' : 'Share link'}
          </button>
          <button
            className="ghost-button theme-toggle"
            type="button"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <div className="preset-row" aria-label="Try a preset room">
            {presets.map((preset) => (
              <button key={preset.label} className="preset-chip" onClick={() => applyPreset(preset)} type="button">
                <strong>{preset.label}</strong>
                <span>{preset.note}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel input-panel">
          <div className="panel-header">
            <h2>Room inputs</h2>
            <p>Enter the room size and coverage assumptions.</p>
          </div>

          <div className="field-grid">
            <label>
              <span>Length ({dimensionUnit})</span>
              <input min="0" step="0.1" type="number" value={length} onChange={(event) => handleNumberChange('length', event.target.value)} />
            </label>
            <label>
              <span>Width ({dimensionUnit})</span>
              <input min="0" step="0.1" type="number" value={width} onChange={(event) => handleNumberChange('width', event.target.value)} />
            </label>
            <label>
              <span>Wall height ({dimensionUnit})</span>
              <input min="0" step="0.1" type="number" value={height} onChange={(event) => handleNumberChange('height', event.target.value)} />
            </label>
            <label>
              <span>Flooring waste (%)</span>
              <input min="0" step="0.5" type="number" value={wastePercent} onChange={(event) => handleNumberChange('wastePercent', event.target.value)} />
            </label>
            <label className="field-span-2">
              <span>Paint coverage ({unit === 'm' ? 'm² per liter' : 'ft² per gallon'})</span>
              <input
                min="0.1"
                step="0.1"
                type="number"
                value={paintCoverage}
                onChange={(event) => handleNumberChange('paintCoverage', event.target.value)}
              />
            </label>
          </div>

          <div className="metric-hint">
            <strong>Positioning note:</strong> similar tools already exist for flooring-only or paint-only cases.
            The useful gap is a cleaner all-in-one room planning page with better presentation and unit handling.
          </div>
        </div>

        <div className="panel result-panel" ref={resultPanelRef}>
          <div className="panel-header inline-header">
            <div>
              <h2>Results</h2>
              <p>Core room numbers plus finishing estimates.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="ghost-button"
                type="button"
                onClick={() => resultPanelRef.current && exportResultsPng(resultPanelRef.current)}
              >
                PNG
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => resultPanelRef.current && exportResultsPdf(resultPanelRef.current)}
              >
                PDF
              </button>
            </div>
          </div>

          <div className="result-grid">
            <article>
              <span>Floor area</span>
              <strong>{formatNumber(unit === 'm' ? results.areaSqM : results.areaSqFt)} {areaUnit}</strong>
              <small>
                {formatNumber(results.areaSqM)} m² / {formatNumber(results.areaSqFt)} ft²
              </small>
            </article>
            <article>
              <span>Perimeter</span>
              <strong>{formatNumber(unit === 'm' ? results.perimeterM : results.perimeterFt)} {dimensionUnit}</strong>
              <small>
                {formatNumber(results.perimeterM)} m / {formatNumber(results.perimeterFt)} ft
              </small>
            </article>
            <article>
              <span>Wall area</span>
              <strong>{formatNumber(unit === 'm' ? results.wallAreaSqM : results.wallAreaSqFt)} {areaUnit}</strong>
              <small>
                Assumes four full walls, no door/window deduction.
              </small>
            </article>
            <article>
              <span>Flooring needed</span>
              <strong>{formatNumber(unit === 'm' ? results.flooringSqM : results.flooringSqFt)} {areaUnit}</strong>
              <small>Includes {formatNumber(wastePercent, 1)}% installation waste.</small>
            </article>
            <article>
              <span>Paint estimate</span>
              <strong>
                {formatNumber(unit === 'm' ? results.paintLiters : results.paintGallons)} {unit === 'm' ? 'L' : 'gal'}
              </strong>
              <small>
                {formatNumber(results.paintLiters)} L / {formatNumber(results.paintGallons)} gal
              </small>
            </article>
            <article>
              <span>Quick ratio</span>
              <strong>{formatNumber(results.wallAreaSqM / Math.max(results.areaSqM, 0.01), 2)}×</strong>
              <small>Wall area compared with floor area.</small>
            </article>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel summary-panel">
          <div className="panel-header inline-header">
            <div>
              <h2>Shareable summary</h2>
              <p>Copy the result block into chat, docs, or issue comments.</p>
            </div>
            <button className="copy-button" onClick={copySummary} type="button">
              {copied ? 'Copied' : 'Copy summary'}
            </button>
          </div>
          <pre>{summary}</pre>
        </div>

        <div className="panel notes-panel">
          <div className="panel-header">
            <h2>What this is good for</h2>
            <p>A small, public-facing estimation tool with a clean enough UI for screenshots and quick demos.</p>
          </div>
          <ul>
            <li>Fast checks before buying flooring or paint.</li>
            <li>Comparing metric and imperial measurements without a separate converter.</li>
            <li>Dropping a lightweight calculator into a static hosting setup.</li>
          </ul>
        </div>

        <div className="panel history-panel">
          <div className="panel-header inline-header">
            <div>
              <h2>History</h2>
              <p>Saved automatically — persists across page reloads.</p>
            </div>
            <div className="history-header-actions">
              <button className="ghost-button" onClick={() => setShowHistory((v) => !v)} type="button">
                {showHistory ? 'Hide' : `Show`} ({calcHistory.length})
              </button>
              {calcHistory.length > 0 && (
                <button className="ghost-button ghost-danger" onClick={clearHistory} type="button">
                  Clear
                </button>
              )}
            </div>
          </div>

          {showHistory && (
            calcHistory.length === 0 ? (
              <p className="history-empty">No calculations saved yet. Enter room values to start a history.</p>
            ) : (
              <ul className="history-list">
                {calcHistory.map((entry) => (
                  <li key={entry.id} className="history-item">
                    <button
                      className="history-restore"
                      onClick={() => restoreEntry(entry)}
                      type="button"
                      title={`Restore: ${entry.length}×${entry.width}×${entry.height} ${entry.unit}`}
                    >
                      <span className="history-meta">
                        {fmtTime(entry.ts)}
                        <span className="history-badge">{entry.unit}</span>
                      </span>
                      <span className="history-values">
                        {formatNumber(entry.unit === 'm' ? entry.areaSqM : entry.areaSqFt)} {entry.unit === 'm' ? 'm²' : 'ft²'}
                        {' · '}
                        {formatNumber(entry.unit === 'm' ? entry.flooringSqM : entry.flooringSqFt)} {entry.unit === 'm' ? 'm²' : 'ft²'} flooring
                        {' · '}
                        {formatNumber(entry.unit === 'm' ? entry.paintLiters : entry.paintGallons)} {entry.unit === 'm' ? 'L' : 'gal'} paint
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </section>
    </main>
  )
}

export default App
