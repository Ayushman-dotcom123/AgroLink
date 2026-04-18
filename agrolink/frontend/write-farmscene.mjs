  <TractorMesh mouse={mouse} />
        <Environment preset="dawn" />
      </Suspense>
    </Canvas>
  )
}
`

writeFileSync('components/3d/FarmScene.jsx', code, 'utf8')
const lines = code.split('\n')
console.log('Line 39:', lines[38])
console.log('Line 40:', lines[39])
 onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  return (
    <Canvas
      camera={{ position: [0, 0.8, 14], fov: 25 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={2} />
      <directionalLight position={[5, 8, 5]} intensity={3} color="#fff8f0" />
      <directionalLight position={[-4, 2, -3]} intensity={1} color="#d4e8c2" />
      <Suspense fallback={null}>
      eturn (
    <primitive
      ref={ref}
      object={scene}
      scale={[START_SCALE, START_SCALE, START_SCALE]}
      position={[REST_X, REST_Y, REST_Z]}
      rotation={[0, REST_ROT_Y, 0]}
    />
  )
}

export default function FarmScene() {
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      }
    }
    window.addEventListener('mousemove', }
      ref.current.rotation.x = MathUtils.lerp(ref.current.rotation.x, mouse.current.y * 0.15, 0.05)
      ref.current.rotation.z = MathUtils.lerp(ref.current.rotation.z, -mouse.current.x * 0.08, 0.05)
      ref.current.position.x = MathUtils.lerp(ref.current.position.x, REST_X + mouse.current.x * 0.5, 0.05)
      ref.current.position.y = MathUtils.lerp(ref.current.position.y, REST_Y + mouse.current.y * 0.3, 0.05)
      ref.current.position.y += Math.sin(state.clock.elapsedTime * 0.9) * 0.006
    }
  })

  rSTART_SCALE, FINAL_SCALE, scaleEase))
      ref.current.position.x = REST_X
      ref.current.position.y = REST_Y + bounce
      ref.current.position.z = REST_Z
      ref.current.rotation.y = REST_ROT_Y
      ref.current.rotation.x = pitch
      ref.current.rotation.z = roll
    } else {
      if (!settled.current) {
        settled.current = true
        ref.current.scale.setScalar(FINAL_SCALE)
        ref.current.position.set(REST_X, REST_Y, REST_Z)
        ref.current.rotation.set(0, REST_ROT_Y, 0)
        const t = Math.min(elapsed.current / DRIVE_DURATION, 1)
    const speed = Math.sin(t * Math.PI)
    const bounce = Math.sin(elapsed.current * 16) * 0.055 * speed
    const pitch = Math.sin(elapsed.current * 8) * 0.05 * speed
    const roll = Math.sin(elapsed.current * 10.4 + 1.2) * 0.03 * speed
    wheelsRef.current.forEach(w => { w.rotation.x -= delta * 10 * speed })
    if (t < 1) {
      settled.current = false
      const scaleEase = 1 - Math.pow(1 - t, 2.5)
      ref.current.scale.setScalar(MathUtils.lerp(Ref([])
  const { scene } = useGLTF('/Tractor.glb')
  const elapsed = useRef(0)
  const settled = useRef(false)

  useEffect(() => {
    wheelsRef.current = []
    scene.traverse((child) => {
      if (!child.isMesh) return
      const n = child.name.toLowerCase()
      if (n.includes('wheel') || n.includes('tyre') || n.includes('tire') || n.includes('rim')) {
        wheelsRef.current.push(child)
      }
    })
  }, [scene])

  useFrame((state, delta) => {
    if (!ref.current) return
    elapsed.current += delta
 rom 'fs'

const code = `'use client'
import { useRef, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'
import { MathUtils } from 'three'

useGLTF.preload('/Tractor.glb')

const DRIVE_DURATION = 5.5
const START_SCALE = 0.10
const FINAL_SCALE = 0.32
const REST_X = 0
const REST_Y = -0.5
const REST_Z = 0
const REST_ROT_Y = Math.PI * 0.08

function TractorMesh({ mouse }) {
  const ref = useRef()
  const wheelsRef = useimport { writeFileSync } f