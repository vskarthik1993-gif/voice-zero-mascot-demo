import React, { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import lerp from 'lerp'
import Mascot from './Mascot'
import MascotInspect from './MascotInspect'
import Effects from './Effects'
import SceneBackdrop from './SceneBackdrop'
import SceneEnvironment from './SceneEnvironment'
import VoiceSparkField from './VoiceSparkField'
import { VOICE_STATES } from './voiceStates'
import { lerpToward } from './smoothLerp'

const SCENE_SHIFT_X = -3
const TRANSITION_LERP = 0.1

export default function VoiceScene({
  stateKey,
  mouse,
  poolSpreadRef,
  poolIntensityRef,
  animationRef,
  inspectRef,
  textureKey,
  keylightRef
}) {
  const visual = useRef({
    ...VOICE_STATES.idle,
    wobble: 0,
    bodyDim: VOICE_STATES.idle.bodyDim,
    bloomThreshold: VOICE_STATES.idle.bloomThreshold,
    sparkWeight: 0,
    flashAmount: 0,
    poolScale: 0.62
  })

  const envRef = useRef(null)
  const keyLightRef = useRef()
  const rimLightRef = useRef()

  useFrame(() => {
    const target = VOICE_STATES[stateKey]
    lerpToward(visual.current, target, TRANSITION_LERP)
    visual.current.poolScale = poolIntensityRef?.current ?? 0.62

    const poolScale = poolIntensityRef?.current ?? 0.62
    const intensity = visual.current.lightIntensity * poolScale
    if (keyLightRef.current) {
      keyLightRef.current.color.set(visual.current.light)
      keyLightRef.current.intensity = lerp(keyLightRef.current.intensity, intensity * 2.2, 0.1)
    }
    if (rimLightRef.current) {
      rimLightRef.current.color.set(visual.current.colorB)
      rimLightRef.current.intensity = lerp(rimLightRef.current.intensity, intensity * 0.45, 0.1)
    }
  })

  return (
    <group position={[SCENE_SHIFT_X, 0, 0]}>
      <SceneEnvironment envRef={envRef} />
      <ambientLight intensity={0.42} />
      <directionalLight ref={keyLightRef} position={[0, 24, 8]} intensity={2.2} />
      <directionalLight ref={rimLightRef} position={[-10, 6, 14]} intensity={0.4} />
      <SceneBackdrop
        visualRef={visual}
        poolSpreadRef={poolSpreadRef}
        poolIntensityRef={poolIntensityRef}
      />
      <MascotInspect inspectRef={inspectRef}>
        <Mascot
          visualRef={visual}
          poolIntensityRef={poolIntensityRef}
          animationRef={animationRef}
          textureKey={textureKey}
          envMapRef={envRef}
          keylightRef={keylightRef}
        />
      </MascotInspect>
      <VoiceSparkField mouse={mouse} visualRef={visual} />
      <Effects visualRef={visual} />
    </group>
  )
}
