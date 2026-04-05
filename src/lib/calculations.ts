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

export type RoomShape = 'rect' | 'lshape' | 'circular'

export interface RectResults {
  areaSqM: number
  areaSqFt: number
  perimeterM: number
  perimeterFt: number
  wallAreaSqM: number
  wallAreaSqFt: number
  flooringSqM: number
  flooringSqFt: number
  paintLiters: number
  paintGallons: number
}

function computeRect(
  lengthM: number,
  widthM: number,
  heightM: number,
  wastePercent: number,
  paintCoverage: number,
): RectResults {
  const safeLength = Math.max(lengthM, 0)
  const safeWidth = Math.max(widthM, 0)
  const safeHeight = Math.max(heightM, 0)
  const safeWastePercent = Math.max(wastePercent, 0)
  const safeCoverage = Math.max(paintCoverage, 0.01)

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

function computeLShape(
  aLengthM: number,
  aWidthM: number,
  bLengthM: number,
  bWidthM: number,
  heightM: number,
  wastePercent: number,
  paintCoverage: number,
): RectResults {
  const aL = Math.max(aLengthM, 0)
  const aW = Math.max(aWidthM, 0)
  const bL = Math.max(bLengthM, 0)
  const bW = Math.max(bWidthM, 0)
  const safeH = Math.max(heightM, 0)
  const safeWaste = Math.max(wastePercent, 0)
  const safeCov = Math.max(paintCoverage, 0.01)

  const aArea = aL * aW
  const bArea = bL * bW
  const areaSqM = aArea + bArea

  // L-shape outer perimeter (6 straight segments, using clamped dimensions)
  const perimeterM = aL + aW + Math.abs(aL - bL) + bW + bL + Math.abs(aW - bW)

  const wallAreaSqM = perimeterM * safeH
  const flooringSqM = areaSqM * (1 + safeWaste / 100)
  const paintLiters = wallAreaSqM / safeCov

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

function computeCircular(
  radiusM: number,
  heightM: number,
  wastePercent: number,
  paintCoverage: number,
): RectResults {
  const r = Math.max(radiusM, 0)
  const h = Math.max(heightM, 0)
  const safeWaste = Math.max(wastePercent, 0)
  const safeCov = Math.max(paintCoverage, 0.01)

  const areaSqM = Math.PI * r * r
  const circumferenceM = 2 * Math.PI * r
  const wallAreaSqM = circumferenceM * h
  const flooringSqM = areaSqM * (1 + safeWaste / 100)
  const paintLiters = wallAreaSqM / safeCov

  return {
    areaSqM,
    areaSqFt: areaMetersToFeet(areaSqM),
    perimeterM: circumferenceM,
    perimeterFt: metersToFeet(circumferenceM),
    wallAreaSqM,
    wallAreaSqFt: areaMetersToFeet(wallAreaSqM),
    flooringSqM,
    flooringSqFt: areaMetersToFeet(flooringSqM),
    paintLiters,
    paintGallons: paintLiters / LITERS_PER_GALLON,
  }
}

export function calculateResults(input: {
  unit: Unit
  length: number
  width: number
  height: number
  wastePercent: number
  paintCoverage: number
}): RectResults {
  const valuesInMeters = normalizeDimensions(input.unit, {
    length: input.length,
    width: input.width,
    height: input.height,
  })
  return computeRect(valuesInMeters.length, valuesInMeters.width, valuesInMeters.height, input.wastePercent, normalizePaintCoverage(input.unit, input.paintCoverage))
}

export function calculateLShapeResults(input: {
  unit: Unit
  aLength: number
  aWidth: number
  bLength: number
  bWidth: number
  height: number
  wastePercent: number
  paintCoverage: number
}): RectResults {
  const inM = (v: number) => input.unit === 'm' ? v : feetToMeters(v)
  return computeLShape(
    inM(input.aLength), inM(input.aWidth),
    inM(input.bLength), inM(input.bWidth),
    inM(input.height),
    input.wastePercent,
    normalizePaintCoverage(input.unit, input.paintCoverage),
  )
}

export function calculateCircularResults(input: {
  unit: Unit
  radius: number
  height: number
  wastePercent: number
  paintCoverage: number
}): RectResults {
  const r = input.unit === 'm' ? input.radius : feetToMeters(input.radius)
  return computeCircular(r, input.unit === 'm' ? input.height : feetToMeters(input.height), input.wastePercent, normalizePaintCoverage(input.unit, input.paintCoverage))
}
