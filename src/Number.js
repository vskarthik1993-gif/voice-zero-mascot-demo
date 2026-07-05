import React, { Suspense, useRef } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import lerp from 'lerp'
import Text from './Text'

export default function Number({ mouse, hover }) {
  const ref = useRef()
  const { size, viewport } = useThree()
  const aspect = size.width / viewport.width
  useFrame(state => {
    if (ref.current) {
      ref.current.position.x = lerp(ref.current.position.x, mouse.current[0] / aspect / 10, 0.1)
      ref.current.rotation.x = lerp(ref.current.rotation.x, 0 + mouse.current[1] / aspect / 50, 0.1)
      ref.current.rotation.y = 0.8
    }
  })
  return (
    <Suspense fallback={null}>
      <group ref={ref}>
        <Text
          size={10}
          onClick={e => window.open('https://github.com/react-spring/react-three-fiber/blob/master/whatsnew.md', '_blank')}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}>
          0
        </Text>
      </group>
    </Suspense>
  )
}
