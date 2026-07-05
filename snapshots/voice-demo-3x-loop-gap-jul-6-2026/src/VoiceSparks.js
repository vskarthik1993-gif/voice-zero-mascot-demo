import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { extend, useFrame, useThree } from 'react-three-fiber'
import lerp from 'lerp'
import * as meshline from './MeshLine'

extend(meshline)

const r = () => 0.45 + Math.random() * 0.55

function SoftSpark({ curve, width, color, speed, opacity }) {
  const material = useRef()
  useFrame(() => {
    if (material.current) material.current.uniforms.dashOffset.value -= speed
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
        color={color}
        opacity={opacity}
        dashArray={2.4}
        dashRatio={0.97}
      />
    </mesh>
  )
}

export default function VoiceSparks({ mouse, count = 18, colors, radius = 5.5 }) {
  const lines = useMemo(
    () =>
      new Array(count).fill().map((_, index) => {
        let pos = new THREE.Vector3(
          (Math.random() - 0.5) * radius * 0.35,
          -radius * 0.15 + Math.random() * radius * 0.2,
          (Math.random() - 0.5) * 0.8
        )
        const points = new Array(32).fill().map((__, j) => {
          const angle = (j / 18) * Math.PI * 2 + index * 0.4
          pos = pos.add(
            new THREE.Vector3(
              Math.sin(angle) * radius * 0.045 * r(),
              Math.cos(angle) * radius * 0.035 * r() + 0.06,
              (Math.random() - 0.5) * 0.06
            )
          )
          return pos.clone()
        })
        const curve = new THREE.CatmullRomCurve3(points).getPoints(800)
        return {
          color: colors[Math.floor(Math.random() * colors.length)],
          width: 0.018 + (index / count) * 0.028,
          speed: 0.0008 + Math.random() * 0.0018,
          opacity: 0.28 + Math.random() * 0.28,
          curve
        }
      }),
    [count, colors, radius]
  )

  const ref = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x = lerp(ref.current.rotation.x, mouse.current[1] / aspect / 300, 0.06)
      ref.current.rotation.y = lerp(ref.current.rotation.y, mouse.current[0] / aspect / 550, 0.06)
    }
  })

  return (
    <group ref={ref} position={[0, -0.5, 0]} scale={[1, 1.2, 1]}>
      {lines.map((props, index) => (
        <SoftSpark key={index} {...props} />
      ))}
    </group>
  )
}
