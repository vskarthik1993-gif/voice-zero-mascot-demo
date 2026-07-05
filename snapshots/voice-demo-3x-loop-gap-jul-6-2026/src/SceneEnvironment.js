import * as THREE from 'three'
import { useMemo } from 'react'

/** Procedural studio cube map — warm pool overhead, dark floor */
function buildStudioFaces() {
  const faces = []

  for (let i = 0; i < 6; i++) {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    const isTop = i === 2
    const isBottom = i === 3
    const grad = ctx.createLinearGradient(0, 0, 0, 128)

    if (isTop) {
      grad.addColorStop(0, '#fff8f0')
      grad.addColorStop(1, '#c8ccd4')
    } else if (isBottom) {
      grad.addColorStop(0, '#3a3a42')
      grad.addColorStop(1, '#0e1014')
    } else {
      grad.addColorStop(0, '#f5e8d8')
      grad.addColorStop(0.35, '#a0a4ae')
      grad.addColorStop(1, '#1a1a20')
    }

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 128, 128)

    if (!isTop && !isBottom) {
      ctx.fillStyle = 'rgba(255, 240, 220, 0.35)'
      ctx.fillRect(48, 0, 32, 48)
    }

    faces.push(canvas)
  }

  return faces
}

export function createStudioEnvMap() {
  const cube = new THREE.CubeTexture(buildStudioFaces())
  cube.needsUpdate = true
  return cube
}

export default function SceneEnvironment({ envRef }) {
  const envMap = useMemo(() => createStudioEnvMap(), [])

  if (envRef) envRef.current = envMap

  return null
}
