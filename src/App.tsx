import { useMemo, useState } from 'react'
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

function App() {
  const [unit, setUnit] = useState<Unit>('m')
  const [length, setLength] = useState(5.2)
  const [width, setWidth] = useState(3.8)
  const [height, setHeight] = useState(2.7)
  const [wastePercent, setWastePercent] = useState(8)
  const [paintCoverage, setPaintCoverage] = useState(10)
  const [copied, setCopied] = useState(false)

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

        <div className="panel result-panel">
          <div className="panel-header">
            <h2>Results</h2>
            <p>Core room numbers plus finishing estimates.</p>
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
      </section>
    </main>
  )
}

export default App
