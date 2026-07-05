import React, { Suspense, useRef } from 'react'
import { useFrame } from 'react-three-fiber'
import lerp from 'lerp'
import MascotText from './MascotText'
import {
  sampleAnimation,
  isAnimationComplete,
  ANIMATION_REPEAT_COUNT,
  ANIMATION_LOOP_GAP
} from './mascotAnimations'

const POSE_LERP = 0.22

export default function Mascot({ visualRef, poolIntensityRef, animationRef, textureKey, envMapRef, keylightRef }) {
  const outerRef = useRef()
  const pivotRef = useRef()
  const poseRef = useRef({
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1
  })
  const baseRotY = useRef(0)

  useFrame(({ clock }) => {
    const visual = visualRef.current
    if (!outerRef.current || !pivotRef.current || !visual) return

    const anim = animationRef?.current
    const now = clock.getElapsedTime()
    let key = anim?.key ?? 'breathe'
    let displayKey = key
    let moveElapsed = anim?.startTime != null ? now - anim.startTime : 0

    if (anim?.triggerId != null && anim._lastTrigger !== anim.triggerId) {
      anim._lastTrigger = anim.triggerId
      anim.startTime = now
      anim.pauseUntil = null
      moveElapsed = 0
    }

    if (anim?.pauseUntil != null) {
      if (now < anim.pauseUntil) {
        displayKey = 'breathe'
      } else {
        anim.pauseUntil = null
        anim.startTime = now
        moveElapsed = 0
        displayKey = key
      }
    } else if (!anim?.loop && key !== 'breathe' && isAnimationComplete(key, moveElapsed)) {
      const loopsLeft = (anim.loopsLeft ?? ANIMATION_REPEAT_COUNT) - 1
      if (loopsLeft > 0) {
        anim.loopsLeft = loopsLeft
        anim.pauseUntil = now + ANIMATION_LOOP_GAP
        displayKey = 'breathe'
      } else {
        key = 'breathe'
        anim.key = 'breathe'
        anim.loop = true
        anim.loopsLeft = undefined
        anim.pauseUntil = null
        anim.startTime = now
        anim.triggerId = (anim.triggerId ?? 0) + 1
        displayKey = 'breathe'
        if (animationRef.onComplete) animationRef.onComplete('breathe')
      }
    }

    const target = sampleAnimation(
      displayKey,
      displayKey === 'breathe' ? now * visual.speed : moveElapsed
    )
    const p = poseRef.current
    const snap = displayKey === 'breathe' ? POSE_LERP * 0.6 : POSE_LERP
    p.rotX = lerp(p.rotX, target.rotX, snap)
    p.rotY = lerp(p.rotY, target.rotY, snap)
    p.rotZ = lerp(p.rotZ, target.rotZ, snap)
    p.posX = lerp(p.posX, target.posX, snap)
    p.posY = lerp(p.posY, target.posY, snap)
    p.scaleX = lerp(p.scaleX, target.scaleX, snap)
    p.scaleY = lerp(p.scaleY, target.scaleY, snap)
    p.scaleZ = lerp(p.scaleZ, target.scaleZ, snap)

    const t = now * visual.speed
    let breathe = 1
    if (displayKey === 'breathe') {
      breathe = 1 + Math.sin(t * 2.2) * visual.breathe * 1.4
    }

    let s = breathe
    if (visual.flashAmount > 0.02) {
      s *= 1 - (1 - (0.94 + Math.abs(Math.sin(t * 4.8)) * 0.06)) * visual.flashAmount
    }

    const wobble = visual.wobble && displayKey === 'breathe' ? Math.sin(t * 2.8) * visual.wobble : 0
    baseRotY.current = lerp(baseRotY.current, visual.rotY + Math.sin(t * 0.5) * 0.04, 0.05)

    // Outer: translation + squash/stretch — pivot stays at visual centre
    outerRef.current.position.set(p.posX, p.posY, 0)
    outerRef.current.scale.set(s * p.scaleX, s * p.scaleY, s * p.scaleZ)

    // Inner pivot: all rotations around geometry centre (Y = vertical axis)
    pivotRef.current.rotation.set(p.rotX + wobble, baseRotY.current + p.rotY, p.rotZ)
  })

  return (
    <Suspense fallback={null}>
      <group ref={outerRef} renderOrder={1}>
        <group ref={pivotRef}>
          <MascotText
            visualRef={visualRef}
            poolIntensityRef={poolIntensityRef}
            textureKey={textureKey}
            envMapRef={envMapRef}
            keylightRef={keylightRef}
            size={5}>
            0
          </MascotText>
        </group>
      </group>
    </Suspense>
  )
}
