import * as THREE from 'three'
import React, { useRef, useMemo } from 'react'
import { useFrame } from 'react-three-fiber'

// Grey wall lit by a single top-down Kelvin pool — centered on mascot
const backdropShader = {
  uniforms: {
    poolColor: { value: new THREE.Color('#f5e6d4') },
    poolStrength: { value: 0.55 },
    poolSpread: { value: 0.52 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 poolColor;
    uniform float poolStrength;
    uniform float poolSpread;
    varying vec2 vUv;

    float dither(vec2 px) {
      return (fract(sin(dot(px, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.0035;
    }

    void main() {
      vec2 mascot = vec2(0.47, 0.42);
      vec2 p = vUv - mascot;
      vec2 ovalP = vec2(p.x * 1.58, p.y * 0.94);
      float ovalDist = length(ovalP);

      float t = 1.0 - exp(-ovalDist * ovalDist * 5.8);
      vec3 edge = vec3(0.052, 0.054, 0.058);
      vec3 mid = vec3(0.128, 0.132, 0.138);
      vec3 lit = vec3(0.198, 0.202, 0.208);
      vec3 grey = mix(lit, mid, smoothstep(0.0, 0.55, t));
      grey = mix(grey, edge, smoothstep(0.35, 1.0, t));

      float pit = exp(-ovalDist * ovalDist * 30.0);
      grey *= mix(1.0, 0.34, pit);

      // Pendant lamp directly above mascot — vertical pool widens as it falls
      vec2 lamp = vec2(mascot.x, 0.98);
      float down = max(lamp.y - vUv.y, 0.0);
      float halfW = 0.012 + down * poolSpread * 0.72;
      float poolDist = length(vec2((vUv.x - lamp.x) / halfW, down * 0.82));
      float pool = exp(-poolDist * poolDist * 2.1);

      vec3 col = grey + poolColor * pool * poolStrength;
      col += dither(gl_FragCoord.xy);
      gl_FragColor = vec4(col, 1.0);
    }
  `
}

export default function SceneBackdrop({ visualRef, poolSpreadRef, poolIntensityRef }) {
  const materialRef = useRef()
  const uniforms = useMemo(() => THREE.UniformsUtils.clone(backdropShader.uniforms), [])

  useFrame(() => {
    if (!materialRef.current || !visualRef?.current) return
    const v = visualRef.current
    const poolScale = poolIntensityRef?.current ?? 0.62
    materialRef.current.uniforms.poolColor.value.set(v.light)
    materialRef.current.uniforms.poolStrength.value = poolScale * v.lightIntensity * 0.38
    materialRef.current.uniforms.poolSpread.value = poolSpreadRef?.current ?? 0.52
  })

  return (
    <mesh position={[0, 0, -40]} renderOrder={-1}>
      <planeBufferGeometry attach="geometry" args={[200, 200]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        args={[{ ...backdropShader, uniforms }]}
        depthWrite={false}
      />
    </mesh>
  )
}
