import * as THREE from 'three'
import React, { useRef, useMemo, useEffect } from 'react'
import { extend, useThree, useFrame } from 'react-three-fiber'
import lerp from 'lerp'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

extend({ EffectComposer, ShaderPass, RenderPass, UnrealBloomPass })

export default function Effects({ visualRef }) {
  const composer = useRef()
  const bloomPass = useRef()
  const { scene, gl, size, camera } = useThree()
  const aspect = useMemo(() => new THREE.Vector2(size.width, size.height), [size])

  useEffect(() => {
    gl.setClearColor(0x000000, 0)
    if (composer.current) composer.current.setSize(size.width, size.height)
  }, [gl, size])

  useFrame(() => {
    if (!composer.current || !visualRef || !visualRef.current) return

    if (!bloomPass.current && composer.current.passes) {
      bloomPass.current = composer.current.passes[1]
    }

    const v = visualRef.current
    const poolScale = v.poolScale ?? 0.62
    const bloomMix = Math.min(1, poolScale * v.lightIntensity / 1.8)

    if (bloomPass.current) {
      const targetStrength = Math.min(2.2, (v.bloom ?? 0.14) * poolScale * 1.4)
      const targetThreshold = lerp(v.bloomThreshold ?? 0.72, 0.24, bloomMix * 0.55)
      const bloomLerp = 0.11
      bloomPass.current.strength = lerp(bloomPass.current.strength, targetStrength, bloomLerp)
      bloomPass.current.threshold = lerp(bloomPass.current.threshold, targetThreshold, bloomLerp)
      bloomPass.current.radius = lerp(bloomPass.current.radius, 0.55 + poolScale * 0.45, bloomLerp)
    }

    composer.current.render()
  }, 1)

  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray="passes" scene={scene} camera={camera} />
      <unrealBloomPass attachArray="passes" args={[aspect, 0.2, 1.0, 0.72]} />
    </effectComposer>
  )
}
