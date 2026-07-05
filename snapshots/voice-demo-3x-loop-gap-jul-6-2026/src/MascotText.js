import * as THREE from 'three'
import React, { forwardRef, useMemo, useRef } from 'react'
import { useLoader, useUpdate, useFrame } from 'react-three-fiber'
import { TEXTURE_PRESETS, applyStateTint } from './mascotMaterials'
import { kelvinGradientShader, pbrSurfaceShader } from './mascotShaders'

const MascotText = forwardRef(
  ({ children, size = 5, visualRef, poolIntensityRef, textureKey = 'polishedAluminium', envMapRef, keylightRef }, ref) => {
    const font = useLoader(THREE.FontLoader, '/bold.blob')
    const shaderRef = useRef()
    const preset = TEXTURE_PRESETS[textureKey] || TEXTURE_PRESETS.polishedAluminium
    const midColor = useRef(new THREE.Color())

    const shaderDef = useMemo(
      () => (preset.type === 'shader' ? kelvinGradientShader : pbrSurfaceShader),
      [textureKey, preset.type]
    )

    const uniforms = useMemo(() => THREE.UniformsUtils.clone(shaderDef.uniforms), [shaderDef])

    const config = useMemo(
      () => ({
        font,
        size: 40,
        height: 42,
        curveSegments: 64,
        bevelEnabled: true,
        bevelThickness: 1.0,
        bevelSize: 0.55,
        bevelSegments: 24
      }),
      [font]
    )

    const mesh = useUpdate(
      self => {
        self.geometry.computeBoundingBox()
        const center = new THREE.Vector3()
        self.geometry.boundingBox.getCenter(center)
        self.geometry.translate(-center.x, -center.y, -center.z)
      },
      [children]
    )

    useFrame(() => {
      if (!shaderRef.current || !visualRef?.current) return
      const v = visualRef.current
      const poolScale = poolIntensityRef?.current ?? 0.62
      const u = shaderRef.current.uniforms

      if (preset.type === 'shader') {
        const hot = new THREE.Color(v.colorA)
        const cool = new THREE.Color(v.colorB)
        midColor.current.copy(hot).lerp(cool, 0.52)
        u.colorHot.value.copy(hot)
        u.colorMid.value.copy(midColor.current)
        u.colorCool.value.copy(cool)
        u.lightColor.value.set(v.light)
        u.lightIntensity.value = poolScale * v.lightIntensity * 0.85
        u.bodyDim.value = v.bodyDim ?? 0.68
        return
      }

      const tint = applyStateTint(preset.color || '#ffffff', v.light, preset.stateTint ?? 0.2)
      u.baseColor.value.copy(tint)
      u.lightColor.value.set(v.light)
      u.lightIntensity.value = poolScale * v.lightIntensity * 0.85
      u.metalness.value = preset.metalness ?? 0.5
      u.roughness.value = preset.roughness ?? 0.5
      u.clearcoat.value = preset.clearcoat ?? 0
      u.clearcoatRoughness.value = preset.clearcoatRoughness ?? 0.1
      u.envMap.value = envMapRef?.current || null
      u.envMapIntensity.value = preset.envMapIntensity ?? 1
      if (keylightRef?.current) {
        u.keyLightDir.value.copy(keylightRef.current.dir)
        u.keyLightColor.value.copy(keylightRef.current.color)
        u.keyLightIntensity.value = keylightRef.current.intensity
      }
    })

    return (
      <group ref={ref} scale={[0.1 * size, 0.1 * size, 0.1]}>
        <mesh ref={mesh}>
          <textGeometry attach="geometry" args={[children, config]} />
          <shaderMaterial
            key={textureKey}
            ref={shaderRef}
            attach="material"
            args={[{ ...shaderDef, uniforms }]}
          />
        </mesh>
      </group>
    )
  }
)

export default MascotText
