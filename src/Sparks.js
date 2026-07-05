import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { extend, useFrame, useThree } from 'react-three-fiber'
import lerp from 'lerp'
import * as meshline from './MeshLine'

extend(meshline)

const r = () => Math.max(0.2, Math.random())

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function proximityAt(point, center, radius) {
  const d = point.distanceTo(center)
  const raw = 1 - smoothstep(radius * 0.13, radius * 0.58, d)
  return Math.pow(raw, 1.45)
}

function Fatline({ curve, width, baseColor, speed, baseOpacity, dashArray, dashRatio, mascotCenter, proximityRadius, rimColorRef, strengthRef }) {
  const material = useRef()
  const colorScratch = useRef(new THREE.Color())
  const rimScratch = useRef(new THREE.Color('#e8fcff'))

  useFrame(() => {
    if (!material.current) return
    const mat = material.current
    mat.uniforms.dashOffset.value -= speed

    if (rimColorRef?.current) rimScratch.current.set(rimColorRef.current)

    const offset = mat.uniforms.dashOffset.value
    const threshold = dashArray * dashRatio
    let maxProx = 0

    for (let i = 0; i < 40; i++) {
      const counter = i / 39
      const mod = ((counter + offset) % dashArray + dashArray) % dashArray
      if (mod > threshold) {
        const idx = Math.min(curve.length - 1, Math.floor(counter * (curve.length - 1)))
        maxProx = Math.max(maxProx, proximityAt(curve[idx], mascotCenter, proximityRadius))
      }
    }

    const touch = Math.pow(maxProx, 0.3)
    const weight = strengthRef?.current?.sparkWeight ?? 1

    if (touch > 0.52) {
      mat.uniforms.color.value.copy(rimScratch.current).multiplyScalar(4.2 + (touch - 0.52) * 7.5)
      mat.uniforms.opacity.value = weight
      mat.uniforms.lineWidth.value = width * (1.6 + (touch - 0.52) * 2.8)
    } else {
      colorScratch.current.copy(baseColor).lerp(rimScratch.current, touch * 1.05)
      mat.uniforms.color.value.copy(colorScratch.current).multiplyScalar(1 + touch * touch * 4.2)
      mat.uniforms.opacity.value = Math.min(1, baseOpacity * (0.28 + touch * 1.55)) * weight
      mat.uniforms.lineWidth.value = width * (1 + touch * 0.5)
    }
  })

  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        depthTest={false}
        blending={THREE.AdditiveBlending}
        lineWidth={width}
        color={baseColor}
        opacity={baseOpacity}
        dashArray={dashArray}
        dashRatio={dashRatio}
      />
    </mesh>
  )
}

export default function Sparks({ mouse, count, colors, radius = 10, lineWidth, fieldOffset, dustyRatio, specRatio, proximityCenter, rimColorRef, strengthRef }) {
  const mascotCenter = useMemo(() => {
    if (proximityCenter) return new THREE.Vector3(...proximityCenter)
    if (fieldOffset) return new THREE.Vector3(-fieldOffset[0], -fieldOffset[1] + 0.39, -fieldOffset[2])
    return new THREE.Vector3()
  }, [fieldOffset, proximityCenter])

  const lines = useMemo(() => {
    const dustCount = dustyRatio ? Math.floor(count * dustyRatio) : 0
    const specCount = specRatio ? Math.floor(count * specRatio) : 0
    const baseWidth = lineWidth ?? null

    return new Array(count).fill().map((_, index) => {
      const pos = new THREE.Vector3(Math.sin(0) * radius * r(), Math.cos(0) * radius * r(), 0)
      const points = new Array(30).fill().map((__, pointIndex) => {
        const angle = (pointIndex / 20) * Math.PI * 2
        return pos.add(new THREE.Vector3(Math.sin(angle) * radius * r(), Math.cos(angle) * radius * r(), 0)).clone()
      })
      const curve = new THREE.CatmullRomCurve3(points).getPoints(1000)

      let width = baseWidth ?? Math.max(0.1, (0.2 * index) / 10)
      if (baseWidth && index < dustCount) width = baseWidth * 0.3

      const isSpec = index < specCount
      const dashArray = isSpec ? 0.014 + Math.random() * 0.006 : 0.1
      const dashRatio = isSpec ? 0.91 + Math.random() * 0.05 : 0.95

      return {
        baseColor: new THREE.Color(colors[parseInt(colors.length * Math.random())]),
        width,
        baseOpacity: index < dustCount ? 0.55 : 0.88,
        dashArray,
        dashRatio,
        speed: Math.max(0.001, 0.004 * Math.random()),
        curve
      }
    })
  }, [count, colors, radius, lineWidth, dustyRatio, specRatio])

  const offset = fieldOffset || [-radius * 2, -radius, -10]

  const ref = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x = lerp(ref.current.rotation.x, 0 + mouse.current[1] / aspect / 200, 0.1)
      ref.current.rotation.y = lerp(ref.current.rotation.y, 0 + mouse.current[0] / aspect / 400, 0.1)
    }
  })

  return (
    <group ref={ref}>
      <group position={offset} scale={[1, 1.3, 1]}>
        {lines.map((props, index) => (
          <Fatline
            key={index}
            {...props}
            mascotCenter={mascotCenter}
            proximityRadius={radius}
            rimColorRef={rimColorRef}
            strengthRef={strengthRef}
          />
        ))}
      </group>
    </group>
  )
}
