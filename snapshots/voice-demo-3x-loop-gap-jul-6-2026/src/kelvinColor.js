import * as THREE from 'three'

/** Blackbody-style RGB from colour temperature (Kelvin). */
export function kelvinToRgb(kelvin, target) {
  const t = Math.max(1000, Math.min(40000, kelvin)) / 100
  let r, g, b

  if (t <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(t) - 161.1195681661
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
  }

  if (t >= 66) {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307
  } else if (t <= 19) {
    b = 0
  } else {
    b = 138.5177312231 * Math.log(t - 10) - 305.0447927307
  }

  const color = target || new THREE.Color()
  color.setRGB(
    Math.min(1, Math.max(0, r / 255)),
    Math.min(1, Math.max(0, g / 255)),
    Math.min(1, Math.max(0, b / 255))
  )
  return color
}

export function kelvinToHex(kelvin) {
  const c = kelvinToRgb(kelvin)
  return `#${c.getHexString()}`
}

export const KELVIN_PRESETS = [
  { k: 2700, label: '2700K', hint: 'Candle' },
  { k: 3200, label: '3200K', hint: 'Tungsten' },
  { k: 4000, label: '4000K', hint: 'Warm white' },
  { k: 5000, label: '5000K', hint: 'Daylight' },
  { k: 6500, label: '6500K', hint: 'Overcast' }
]

/** Front-hemisphere equator: azimuth −90° (left) … 0° (centre) … +90° (right). */
export function keylightDirFromAzimuth(azimuthDeg, target) {
  const a = (azimuthDeg * Math.PI) / 180
  const dir = target || new THREE.Vector3()
  return dir.set(-Math.sin(a), 0, -Math.cos(a)).normalize()
}
