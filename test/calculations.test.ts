import { describe, expect, it } from 'vitest'
import {
  calculateResults,
  FEET_TO_METERS,
  LITERS_PER_GALLON,
  SQUARE_FEET_PER_SQUARE_METER,
  SQUARE_FEET_PER_SQUARE_METER_PER_GALLON,
} from '../src/lib/calculations'

describe('calculateResults', () => {
  it('returns expected metric calculations', () => {
    const results = calculateResults({
      unit: 'm',
      length: 5,
      width: 4,
      height: 2.5,
      wastePercent: 10,
      paintCoverage: 10,
    })

    expect(results.areaSqM).toBeCloseTo(20)
    expect(results.perimeterM).toBeCloseTo(18)
    expect(results.wallAreaSqM).toBeCloseTo(45)
    expect(results.flooringSqM).toBeCloseTo(22)
    expect(results.paintLiters).toBeCloseTo(4.5)
    expect(results.areaSqFt).toBeCloseTo(20 * SQUARE_FEET_PER_SQUARE_METER)
  })

  it('keeps imperial input equivalent to metric math', () => {
    const metricLength = 5
    const metricWidth = 4
    const metricHeight = 2.5
    const imperialCoverage = 10 * SQUARE_FEET_PER_SQUARE_METER_PER_GALLON

    const results = calculateResults({
      unit: 'ft',
      length: metricLength / FEET_TO_METERS,
      width: metricWidth / FEET_TO_METERS,
      height: metricHeight / FEET_TO_METERS,
      wastePercent: 10,
      paintCoverage: imperialCoverage,
    })

    expect(results.areaSqM).toBeCloseTo(20, 4)
    expect(results.wallAreaSqM).toBeCloseTo(45, 4)
    expect(results.flooringSqM).toBeCloseTo(22, 4)
    expect(results.paintLiters).toBeCloseTo(4.5, 4)
    expect(results.paintGallons).toBeCloseTo(4.5 / LITERS_PER_GALLON, 4)
  })

  it('clamps negative values and tiny coverage safely', () => {
    const results = calculateResults({
      unit: 'm',
      length: -5,
      width: 4,
      height: -2,
      wastePercent: -8,
      paintCoverage: 0,
    })

    expect(results.areaSqM).toBe(0)
    expect(results.perimeterM).toBe(8)
    expect(results.wallAreaSqM).toBe(0)
    expect(results.flooringSqM).toBe(0)
    expect(results.paintLiters).toBe(0)
  })
})
