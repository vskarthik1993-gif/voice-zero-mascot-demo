import React, { useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import lerp from 'lerp'

/** User-driven orbit around mascot centre — full 360° yaw, clamped pitch */
export default function MascotInspect({ inspectRef, children }) {
  const groupRef = useRef()
  const smooth = useRef({ rotX: 0, rotY: 0 })

  useFrame(() => {
    if (!groupRef.current || !inspectRef?.current) return
    const t = inspectRef.current
    if (!t.enabled) {
      smooth.current.rotX = lerp(smooth.current.rotX, 0, 0.12)
      smooth.current.rotY = lerp(smooth.current.rotY, 0, 0.12)
    } else {
      smooth.current.rotX = lerp(smooth.current.rotX, t.rotX, 0.18)
      smooth.current.rotY = lerp(smooth.current.rotY, t.rotY, 0.18)
    }
    groupRef.current.rotation.x = smooth.current.rotX
    groupRef.current.rotation.y = smooth.current.rotY
  })

  return <group ref={groupRef}>{children}</group>
}
