import React, { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import Sparks from './Sparks'

const SPARK_COLORS = ['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', '#ffc8e8', '#b8e8ff', '#ffffff']

export default function VoiceSparkField({ mouse, visualRef }) {
  const groupRef = useRef()
  const fieldOffset = [-9, -6.5, -6]
  const rimRef = useRef(visualRef?.current?.rim ?? '#e8fcff')

  useFrame(() => {
    if (visualRef?.current?.rim) rimRef.current = visualRef.current.rim

    const weight = visualRef?.current?.sparkWeight ?? 0
    if (groupRef.current) {
      const eased = weight * weight * (3 - 2 * weight)
      const scale = 0.52 * Math.max(0.0001, eased)
      groupRef.current.scale.setScalar(scale)
      groupRef.current.visible = weight > 0.02
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      <Sparks
        count={18}
        mouse={mouse}
        colors={SPARK_COLORS}
        radius={10}
        lineWidth={0.1}
        dustyRatio={0.7}
        specRatio={0.4}
        fieldOffset={fieldOffset}
        proximityCenter={[-fieldOffset[0], -fieldOffset[1] + 0.39, -fieldOffset[2]]}
        rimColorRef={rimRef}
        strengthRef={visualRef}
      />
    </group>
  )
}
