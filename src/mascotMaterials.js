import * as THREE from 'three'

// Five PBR finishes + Kelvin voice-state shader

export const TEXTURE_PRESETS = {
  polishedAluminium: {
    label: 'Polished Aluminium',
    hint: 'Mirror metal — crisp specular, strong env reflections',
    type: 'standard',
    color: '#e6eaef',
    metalness: 1,
    roughness: 0.06,
    envMapIntensity: 1.35,
    stateTint: 0.18
  },
  brushedSteel: {
    label: 'Brushed Steel',
    hint: 'Directional micro-scratches — broad soft highlights',
    type: 'standard',
    color: '#b8bec8',
    metalness: 0.94,
    roughness: 0.38,
    envMapIntensity: 0.72,
    stateTint: 0.12
  },
  matteCeramic: {
    label: 'Matte Ceramic',
    hint: 'Diffuse dielectric — almost no reflection',
    type: 'standard',
    color: '#ddd8d0',
    metalness: 0,
    roughness: 0.94,
    envMapIntensity: 0.15,
    stateTint: 0.35
  },
  obsidianClearcoat: {
    label: 'Obsidian Clearcoat',
    hint: 'Dark glass shell — deep clearcoat reflections',
    type: 'physical',
    color: '#14141a',
    metalness: 0.15,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.65,
    stateTint: 0.22
  },
  mirrorChrome: {
    label: 'Mirror Chrome',
    hint: 'Maximum reflectivity — liquid chrome',
    type: 'standard',
    color: '#f4f6fa',
    metalness: 1,
    roughness: 0.015,
    envMapIntensity: 2.1,
    stateTint: 0.1
  },
  kelvinGradient: {
    label: 'Kelvin Gradient',
    hint: 'Original voice-state gradient + pool light shader',
    type: 'shader',
    stateTint: 1
  }
}

export const TEXTURE_ORDER = [
  'polishedAluminium',
  'brushedSteel',
  'matteCeramic',
  'obsidianClearcoat',
  'mirrorChrome',
  'kelvinGradient'
]

export function applyStateTint(baseHex, lightHex, amount) {
  const base = new THREE.Color(baseHex)
  const light = new THREE.Color(lightHex)
  base.lerp(light, amount)
  return base
}
