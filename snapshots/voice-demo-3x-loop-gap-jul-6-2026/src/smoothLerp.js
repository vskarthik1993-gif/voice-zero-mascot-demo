import * as THREE from 'three'

export function lerpHex(current, target, t) {
  const a = new THREE.Color(current)
  const b = new THREE.Color(target)
  a.lerp(b, t)
  return `#${a.getHexString()}`
}

export function lerpNum(current, target, t) {
  return current + (target - current) * t
}

export function lerpToward(current, target, t = 0.06) {
  current.glow = lerpHex(current.glow, target.glow, t)
  current.colorA = lerpHex(current.colorA, target.colorA, t)
  current.colorB = lerpHex(current.colorB, target.colorB, t)
  current.rim = lerpHex(current.rim || current.colorA, target.rim || target.colorA, t)
  current.light = lerpHex(current.light, target.light, t)
  current.glowOpacity = lerpNum(current.glowOpacity, target.glowOpacity, t)
  current.lightIntensity = lerpNum(current.lightIntensity, target.lightIntensity, t)
  current.bloom = lerpNum(current.bloom, target.bloom, t)
  current.bloomThreshold = lerpNum(current.bloomThreshold ?? 0.72, target.bloomThreshold ?? 0.72, t)
  current.edgeGlow = lerpNum(current.edgeGlow ?? 0.3, target.edgeGlow ?? 0.3, t)
  current.bodyDim = lerpNum(current.bodyDim ?? 0.68, target.bodyDim ?? 0.68, t)
  current.breathe = lerpNum(current.breathe, target.breathe, t)
  current.speed = lerpNum(current.speed, target.speed, t)
  current.rotY = lerpNum(current.rotY, target.rotY, t)
  current.sparkWeight = lerpNum(current.sparkWeight ?? 0, target.sparks ? 1 : 0, t)
  current.flashAmount = lerpNum(current.flashAmount ?? 0, target.flash ? 1 : 0, t)
  current.wobble = lerpNum(current.wobble ?? 0, target.wobble ?? 0, t)
  current.sparks = target.sparks
  current.glitch = target.glitch
  current.flash = target.flash
  return current
}
