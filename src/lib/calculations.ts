export type Unit = 'm' | 'ft'

export type Preset = {
  label: string
  note: string
  length: number
  width: number
  height: number
}

export const FEET_TO_METERS = 0.3048
export const SQUARE_FEET_PER_SQUARE_METER = 10.7639104167
export const LITERS_PER_GALLON = 3.78541
export const SQUARE_FEET_PER_SQUARE_METER_PER_GALLON = SQUARE_FEET_PER_SQUARE_METER * LITERS_PER_GALLON

export function metersToFeet(value: number) {
  return value / FEET_TO_METERS
}

export function feetToMeters(value: number) {
  return value * FEET_TO_METERS
}

export function areaMetersToFeet(value: number) {
  return value * SQUARE_FEET_PER_SQUARE_METER
}

export function normalizeDimensions(unit: Unit, values: { length: number; width: number; height: number }) {
  if (unit === 'm') {
    return values
  }

  return {
    length: feetToMeters(values.length),
    width: feetToMeters(values.width),
    height: feetToMeters(values.height),
  }
}

export function normalizePaintCoverage(unit: Unit, paintCoverage: number) {
  if (unit === 'm') {
    return paintCoverage
  }

  return paintCoverage / SQUARE_FEET_PER_SQUARE_METER_PER_GALLON
}

export function calculateResults(input: {
  unit: Unit
  length: number
  width: number
  height: number
  wastePercent: number
  paintCoverage: number
}) {
  const valuesInMeters = normalizeDimensions(input.unit, {
    length: input.length,
    width: input.width,
    height: input.height,
  })

  const safeLength = Math.max(valuesInMeters.length, 0)
  const safeWidth = Math.max(valuesInMeters.width, 0)
  const safeHeight = Math.max(valuesInMeters.height, 0)
  const safeWastePercent = Math.max(input.wastePercent, 0)
  const safeCoverage = Math.max(normalizePaintCoverage(input.unit, input.paintCoverage), 0.01)

  const areaSqM = safeLength * safeWidth
  const perimeterM = 2 * (safeLength + safeWidth)
  const wallAreaSqM = perimeterM * safeHeight
  const flooringSqM = areaSqM * (1 + safeWastePercent / 100)
  const paintLiters = wallAreaSqM / safeCoverage

  return {
    areaSqM,
    areaSqFt: areaMetersToFeet(areaSqM),
    perimeterM,
    perimeterFt: metersToFeet(perimeterM),
    wallAreaSqM,
    wallAreaSqFt: areaMetersToFeet(wallAreaSqM),
    flooringSqM,
    flooringSqFt: areaMetersToFeet(flooringSqM),
    paintLiters,
    paintGallons: paintLiters / LITERS_PER_GALLON,
  }
}
