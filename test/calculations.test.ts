import { describe, expect, it } from 'vitest'
import {
  calculateResults,
  calculateLShapeResults,
  calculateCircularResults,
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

describe('calculateLShapeResults', () => {
  it('sums two rectangle areas and computes correct perimeter', () => {
    // Rect A: 5m × 4m = 20 m²
    // Rect B: 3m × 3m = 9 m²
    // Total floor: 29 m²
    // Outer perimeter (clockwise): 5 + 4 + 2 + 3 + 3 + 1 = 18 m
    const r = calculateLShapeResults({
      unit: 'm',
      aLength: 5,
      aWidth: 4,
      bLength: 3,
      bWidth: 3,
      height: 2.5,
      wastePercent: 0,
      paintCoverage: 10,
    })
    expect(r.areaSqM).toBeCloseTo(29)
    expect(r.perimeterM).toBeCloseTo(18)
    expect(r.wallAreaSqM).toBeCloseTo(45)
    expect(r.flooringSqM).toBeCloseTo(29)
    expect(r.paintLiters).toBeCloseTo(4.5)
  })

  it('handles imperial input equivalently', () => {
    const ft = (m: number) => m / FEET_TO_METERS
    // Use paintCoverage=10*m²/L equivalent in ft²/gal to get effective 10 m²/L after normalization
    const r = calculateLShapeResults({
      unit: 'ft',
      aLength: ft(5),
      aWidth: ft(4),
      bLength: ft(3),
      bWidth: ft(3),
      height: ft(2.5),
      wastePercent: 10,
      paintCoverage: 10 * SQUARE_FEET_PER_SQUARE_METER_PER_GALLON,
    })
    expect(r.areaSqM).toBeCloseTo(29)
    expect(r.paintLiters).toBeCloseTo(4.5, 4)
  })

  it('clamps negative and zero values safely', () => {
    // aL=-5→0, aW=4, bL=3, bW=-2→0, h=0→0
    // area = 0*4 + 3*0 = 0
    // perimeter = 0+4+|0-3|+0+3+|4-0| = 4+3+3+4 = 14
    // wallArea = 14*0 = 0, flooring = 0, paint = 0/0.01 = 0
    const r = calculateLShapeResults({
      unit: 'm',
      aLength: -5,
      aWidth: 4,
      bLength: 3,
      bWidth: -2,
      height: 0,
      wastePercent: -5,
      paintCoverage: 0,
    })
    expect(r.areaSqM).toBe(0)
    expect(r.perimeterM).toBe(14)
    expect(r.wallAreaSqM).toBe(0)
    expect(r.flooringSqM).toBe(0)
    expect(r.paintLiters).toBe(0)
  })
})

describe('calculateCircularResults', () => {
  it('computes area = πr² and circumference = 2πr', () => {
    // r = 3m → area = 28.27 m², circumference = 18.85 m
    const r = calculateCircularResults({
      unit: 'm',
      radius: 3,
      height: 2.5,
      wastePercent: 0,
      paintCoverage: 10,
    })
    expect(r.areaSqM).toBeCloseTo(Math.PI * 9)
    expect(r.perimeterM).toBeCloseTo(2 * Math.PI * 3)
    expect(r.wallAreaSqM).toBeCloseTo(2 * Math.PI * 3 * 2.5)
    expect(r.flooringSqM).toBeCloseTo(Math.PI * 9)
    expect(r.paintLiters).toBeCloseTo((2 * Math.PI * 3 * 2.5) / 10)
  })

  it('handles imperial input equivalently', () => {
    const ft = (m: number) => m / FEET_TO_METERS
    const r = calculateCircularResults({
      unit: 'ft',
      radius: ft(3),
      height: ft(2.5),
      wastePercent: 10,
      paintCoverage: 10 * SQUARE_FEET_PER_SQUARE_METER_PER_GALLON,
    })
    expect(r.areaSqM).toBeCloseTo(Math.PI * 9)
    expect(r.paintLiters).toBeCloseTo((2 * Math.PI * 3 * 2.5) / 10, 4)
  })

  it('clamps negative and zero values safely', () => {
    // r=-3→0, h=-2→0, waste=-5→0, cov=0→0.01 (min clamp)
    // area=0, circumference=0, wallArea=0, flooring=0, paint=0/0.01=0
    const r = calculateCircularResults({
      unit: 'm',
      radius: -3,
      height: -2,
      wastePercent: -5,
      paintCoverage: 0,
    })
    expect(r.areaSqM).toBe(0)
    expect(r.perimeterM).toBe(0)
    expect(r.wallAreaSqM).toBe(0)
    expect(r.flooringSqM).toBe(0)
    expect(r.paintLiters).toBe(0)
  })
})
