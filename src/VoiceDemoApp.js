import * as THREE from 'three'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas } from 'react-three-fiber'
import VoiceScene from './VoiceScene'
import { VOICE_STATES, STATE_ORDER } from './voiceStates'
import { MASCOT_ANIMATIONS, ANIMATION_ORDER, ANIMATION_REPEAT_COUNT } from './mascotAnimations'
import { TEXTURE_PRESETS, TEXTURE_ORDER } from './mascotMaterials'
import { KELVIN_PRESETS, kelvinToHex, kelvinToRgb, keylightDirFromAzimuth } from './kelvinColor'
import DockPanel, { DockTab } from './DockPanel'
import './voice-demo.css'

const DEFAULT_POOL = 52
const DEFAULT_POOL_INTENSITY = 62
const DEFAULT_KEY_AZIMUTH = 0
const DEFAULT_KEY_KELVIN = 4500
const DEFAULT_KEY_INTENSITY = 28
const DEFAULT_VIEW_YAW = 1
const DEFAULT_VIEW_PITCH = -4
const DEFAULT_CAMERA_Z = 36
const SPEAKING_POOL = 88
const POOL_TRANSITION_MS = 125
const DRAG_SENSITIVITY = 0.009
const PITCH_LIMIT = Math.PI / 2 - 0.12

const radToDeg = r => Math.round((r * 180) / Math.PI)
const degToRad = d => (d * Math.PI) / 180
const normYaw = d => ((d % 360) + 360) % 360

function readCollapsed(key, fallback = false) {
  const saved = localStorage.getItem(`voice-demo-panel-${key}`)
  return saved !== null ? saved === '1' : fallback
}

export default function VoiceDemoApp() {
  const [stateKey, setStateKey] = useState('idle')
  const [inspectEnabled, setInspectEnabled] = useState(true)
  const [inspectView, setInspectView] = useState({
    yaw: DEFAULT_VIEW_YAW,
    pitch: DEFAULT_VIEW_PITCH
  })
  const [panels, setPanels] = useState({
    texture: readCollapsed('texture'),
    keylight: readCollapsed('keylight'),
    inspect: readCollapsed('inspect'),
    anim: readCollapsed('anim')
  })
  const [textureKey, setTextureKey] = useState(() => {
    const saved = localStorage.getItem('voice-demo-texture')
    return saved && TEXTURE_PRESETS[saved] ? saved : 'polishedAluminium'
  })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    localStorage.setItem('voice-demo-texture', textureKey)
  }, [textureKey])

  const [poolSpread, setPoolSpread] = useState(() => {
    const saved = localStorage.getItem('voice-demo-pool')
    return saved !== null ? Number(saved) : DEFAULT_POOL
  })
  const [poolIntensity, setPoolIntensity] = useState(() => {
    const saved = localStorage.getItem('voice-demo-pool-intensity')
    return saved !== null ? Number(saved) : DEFAULT_POOL_INTENSITY
  })
  const [keyAzimuth, setKeyAzimuth] = useState(() => {
    const saved = localStorage.getItem('voice-demo-key-azimuth')
    return saved !== null ? Number(saved) : DEFAULT_KEY_AZIMUTH
  })
  const [keyKelvin, setKeyKelvin] = useState(() => {
    const saved = localStorage.getItem('voice-demo-key-kelvin')
    return saved !== null ? Number(saved) : DEFAULT_KEY_KELVIN
  })
  const [keyIntensity, setKeyIntensity] = useState(() => {
    const saved = localStorage.getItem('voice-demo-key-intensity')
    return saved !== null ? Number(saved) : DEFAULT_KEY_INTENSITY
  })

  const mouse = useRef([0, 0])
  const poolSpreadRef = useRef(DEFAULT_POOL / 100)
  const poolIntensityRef = useRef(DEFAULT_POOL_INTENSITY / 100)
  const keylightRef = useRef({
    azimuth: DEFAULT_KEY_AZIMUTH,
    kelvin: DEFAULT_KEY_KELVIN,
    intensity: DEFAULT_KEY_INTENSITY / 100,
    dir: keylightDirFromAzimuth(DEFAULT_KEY_AZIMUTH),
    color: kelvinToRgb(DEFAULT_KEY_KELVIN)
  })
  const cfg = VOICE_STATES[stateKey]

  const poolAnimFrame = useRef(0)
  const isPoolAnimating = useRef(false)
  const animationRef = useRef({ key: 'breathe', loop: true, startTime: 0, triggerId: 0 })
  const [animKey, setAnimKey] = useState('breathe')
  const triggerIdRef = useRef(0)
  const inspectRef = useRef({
    enabled: true,
    rotX: degToRad(DEFAULT_VIEW_PITCH),
    rotY: degToRad(DEFAULT_VIEW_YAW)
  })
  const dragRef = useRef(null)

  const togglePanel = useCallback(key => {
    setPanels(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(`voice-demo-panel-${key}`, next[key] ? '1' : '0')
      return next
    })
  }, [])

  const syncInspectView = useCallback(() => {
    setInspectView({
      yaw: normYaw(radToDeg(inspectRef.current.rotY)),
      pitch: radToDeg(inspectRef.current.rotX)
    })
  }, [])

  const setInspectAngles = useCallback((yawDeg, pitchDeg) => {
    const pitch = Math.max(-75, Math.min(75, pitchDeg))
    inspectRef.current.rotY = degToRad(yawDeg)
    inspectRef.current.rotX = degToRad(pitch)
    setInspectView({ yaw: normYaw(yawDeg), pitch })
  }, [])

  const resetInspect = useCallback(() => {
    inspectRef.current.rotX = degToRad(DEFAULT_VIEW_PITCH)
    inspectRef.current.rotY = degToRad(DEFAULT_VIEW_YAW)
    setInspectView({ yaw: DEFAULT_VIEW_YAW, pitch: DEFAULT_VIEW_PITCH })
  }, [])

  inspectRef.current.enabled = inspectEnabled

  const playAnimation = useCallback(key => {
    const def = MASCOT_ANIMATIONS[key]
    if (!def) return
    triggerIdRef.current += 1
    animationRef.current = {
      key,
      loop: def.loop,
      loopsLeft: def.loop ? undefined : ANIMATION_REPEAT_COUNT,
      pauseUntil: null,
      startTime: null,
      triggerId: triggerIdRef.current,
      _lastTrigger: null,
      onComplete: k => setAnimKey(k)
    }
    setAnimKey(key)
  }, [])

  poolSpreadRef.current = poolSpread / 100
  poolIntensityRef.current = poolIntensity / 100
  keylightRef.current.azimuth = keyAzimuth
  keylightRef.current.kelvin = keyKelvin
  keylightRef.current.intensity = keyIntensity / 100
  keylightDirFromAzimuth(keyAzimuth, keylightRef.current.dir)
  kelvinToRgb(keyKelvin, keylightRef.current.color)

  useEffect(() => {
    localStorage.setItem('voice-demo-pool', String(poolSpread))
  }, [poolSpread])

  useEffect(() => {
    if (!isPoolAnimating.current) poolIntensityRef.current = poolIntensity / 100
  }, [poolIntensity])

  useEffect(() => {
    localStorage.setItem('voice-demo-pool-intensity', String(poolIntensity))
  }, [poolIntensity])

  useEffect(() => {
    localStorage.setItem('voice-demo-key-azimuth', String(keyAzimuth))
  }, [keyAzimuth])

  useEffect(() => {
    localStorage.setItem('voice-demo-key-kelvin', String(keyKelvin))
  }, [keyKelvin])

  useEffect(() => {
    localStorage.setItem('voice-demo-key-intensity', String(keyIntensity))
  }, [keyIntensity])

  useEffect(() => {
    cancelAnimationFrame(poolAnimFrame.current)
    isPoolAnimating.current = false

    if (stateKey !== 'speaking') return

    const startScale = poolIntensityRef.current
    const targetScale = SPEAKING_POOL / 100
    if (Math.abs(startScale - targetScale) < 0.002) return

    isPoolAnimating.current = true
    const startTime = performance.now()

    const tick = now => {
      const u = Math.min(1, (now - startTime) / POOL_TRANSITION_MS)
      const eased = u * u * (3 - 2 * u)
      poolIntensityRef.current = startScale + (targetScale - startScale) * eased
      if (u < 1) {
        poolAnimFrame.current = requestAnimationFrame(tick)
      } else {
        isPoolAnimating.current = false
        setPoolIntensity(SPEAKING_POOL)
      }
    }

    poolAnimFrame.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(poolAnimFrame.current)
      isPoolAnimating.current = false
    }
  }, [stateKey])

  const onPointerDown = useCallback(
    e => {
      if (!inspectEnabled || e.button !== 0) return
      e.target.setPointerCapture(e.pointerId)
      dragRef.current = {
        x: e.clientX,
        y: e.clientY,
        rotX: inspectRef.current.rotX,
        rotY: inspectRef.current.rotY
      }
      setIsDragging(true)
    },
    [inspectEnabled]
  )

  const onPointerMove = useCallback(
    e => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.x
      const dy = e.clientY - dragRef.current.y
      inspectRef.current.rotY = dragRef.current.rotY + dx * DRAG_SENSITIVITY
      inspectRef.current.rotX = Math.max(
        -PITCH_LIMIT,
        Math.min(PITCH_LIMIT, dragRef.current.rotX + dy * DRAG_SENSITIVITY)
      )
      syncInspectView()
    },
    [syncInspectView]
  )

  const onPointerUp = useCallback(e => {
    if (!dragRef.current) return
    dragRef.current = null
    setIsDragging(false)
    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch (_) {
      /* already released */
    }
  }, [])

  return (
    <div className="voice-demo">
      <div className="voice-demo__base" />
      <div className="voice-demo__footer-shield" />

      <Canvas
        className={`voice-demo__canvas${inspectEnabled ? ' is-inspect' : ''}${isDragging ? ' is-dragging' : ''}`}
        pixelRatio={Math.min(3, window.devicePixelRatio || 1)}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 82, position: [0, 0, DEFAULT_CAMERA_Z] }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping
          gl.toneMappingExposure = 1.0
          gl.setClearColor(0x000000, 0)
        }}>
        <VoiceScene
          stateKey={stateKey}
          mouse={mouse}
          poolSpreadRef={poolSpreadRef}
          poolIntensityRef={poolIntensityRef}
          animationRef={animationRef}
          inspectRef={inspectRef}
          textureKey={textureKey}
          keylightRef={keylightRef}
        />
      </Canvas>

      <header className="voice-demo__header">
        <div className="voice-demo__brand">Voice Concierge</div>
        <div className="voice-demo__meta">Mascot state preview</div>
      </header>

      <div className="voice-demo__center-copy">
        <h1 className="voice-demo__status">{cfg.status}</h1>
        <p className="voice-demo__hint">{cfg.hint}</p>
      </div>

      <nav className="voice-demo__nav" aria-label="Voice states">
        {STATE_ORDER.map(key => (
          <button
            key={key}
            type="button"
            className={`voice-demo__nav-btn${stateKey === key ? ' is-active' : ''}`}
            onClick={() => setStateKey(key)}>
            {VOICE_STATES[key].label}
          </button>
        ))}
      </nav>

      <div className="voice-demo__dock-tabs voice-demo__dock-tabs--left">
        {panels.texture ? (
          <DockTab title="Surface" side="left" onClick={() => togglePanel('texture')} />
        ) : null}
        {panels.keylight ? (
          <DockTab title="Key Light" side="left" onClick={() => togglePanel('keylight')} />
        ) : null}
        {panels.inspect ? (
          <DockTab title="Orbit" side="left" onClick={() => togglePanel('inspect')} />
        ) : null}
      </div>

      <div className="voice-demo__dock-tabs voice-demo__dock-tabs--right">
        {panels.anim ? (
          <DockTab title="Moves" side="right" onClick={() => togglePanel('anim')} />
        ) : null}
      </div>

      <div className="voice-demo__left-rail">
        <div className="voice-demo__left-stack">
          {!panels.texture ? (
            <DockPanel
              title="Surface Finish"
              subtitle={TEXTURE_PRESETS[textureKey]?.hint}
              onMinimize={() => togglePanel('texture')}>
              <div className="voice-demo__texture-grid">
                {TEXTURE_ORDER.map(key => (
                  <button
                    key={key}
                    type="button"
                    className={`voice-demo__texture-btn${textureKey === key ? ' is-active' : ''}`}
                    onClick={() => setTextureKey(key)}>
                    {TEXTURE_PRESETS[key].label}
                  </button>
                ))}
              </div>
            </DockPanel>
          ) : null}

          {!panels.keylight ? (
            <DockPanel
              title="Front Key Light"
              subtitle="PBR finishes only — sweeps the front equator"
              onMinimize={() => togglePanel('keylight')}
              className="voice-demo__dock-panel--keylight">
            <label className="voice-demo__glow-control voice-demo__glow-control--panel">
              <span className="voice-demo__glow-label">Sweep</span>
              <input
                type="range"
                className="voice-demo__glow-slider voice-demo__glow-slider--wide"
                min={-90}
                max={90}
                value={keyAzimuth}
                onChange={e => setKeyAzimuth(Number(e.target.value))}
                aria-valuenow={keyAzimuth}
              />
              <span className="voice-demo__glow-value">{keyAzimuth}°</span>
            </label>
            <div className="voice-demo__keylight-axis">
              <span>Left</span>
              <span>Centre</span>
              <span>Right</span>
            </div>

            <div className="voice-demo__keylight-kelvin">
              <div className="voice-demo__keylight-kelvin-head">
                <span className="voice-demo__keylight-kelvin-label">Colour temp</span>
                <span
                  className="voice-demo__keylight-swatch"
                  style={{ background: kelvinToHex(keyKelvin) }}
                  aria-hidden
                />
                <span className="voice-demo__keylight-kelvin-value">{keyKelvin}K</span>
              </div>
              <div className="voice-demo__keylight-presets">
                {KELVIN_PRESETS.map(p => (
                  <button
                    key={p.k}
                    type="button"
                    className={`voice-demo__keylight-preset${keyKelvin === p.k ? ' is-active' : ''}`}
                    title={p.hint}
                    onClick={() => setKeyKelvin(p.k)}>
                    {p.label}
                  </button>
                ))}
              </div>
              <label className="voice-demo__glow-control voice-demo__glow-control--panel">
                <span className="voice-demo__glow-label">Fine</span>
                <input
                  type="range"
                  className="voice-demo__glow-slider voice-demo__glow-slider--wide"
                  min={2700}
                  max={7000}
                  step={50}
                  value={keyKelvin}
                  onChange={e => setKeyKelvin(Number(e.target.value))}
                  aria-valuenow={keyKelvin}
                />
              </label>
            </div>

            <label className="voice-demo__glow-control voice-demo__glow-control--panel">
              <span className="voice-demo__glow-label">Intensity</span>
              <input
                type="range"
                className="voice-demo__glow-slider voice-demo__glow-slider--wide"
                min={0}
                max={100}
                value={keyIntensity}
                onChange={e => setKeyIntensity(Number(e.target.value))}
                aria-valuenow={keyIntensity}
              />
              <span className="voice-demo__glow-value">{keyIntensity}%</span>
            </label>
            </DockPanel>
          ) : null}
        </div>

        <div className="voice-demo__controls">
          {!panels.inspect ? (
            <DockPanel
              title="Orbit Inspect"
              subtitle={inspectEnabled ? 'Drag the mascot to rotate 360°' : 'Enable to orbit the object'}
              onMinimize={() => togglePanel('inspect')}
              className="voice-demo__dock-panel--inspect"
              actions={
                <button
                  type="button"
                  className={`voice-demo__inspect-toggle${inspectEnabled ? ' is-on' : ''}`}
                  onClick={() => setInspectEnabled(v => !v)}
                  aria-pressed={inspectEnabled}>
                  {inspectEnabled ? 'On' : 'Off'}
                </button>
              }>
              <label className="voice-demo__glow-control voice-demo__glow-control--compact">
                <span className="voice-demo__glow-label">Yaw</span>
                <input
                  type="range"
                  className="voice-demo__glow-slider voice-demo__glow-slider--wide"
                  min={0}
                  max={360}
                  value={inspectView.yaw}
                  disabled={!inspectEnabled}
                  onChange={e => setInspectAngles(Number(e.target.value), inspectView.pitch)}
                  aria-valuenow={inspectView.yaw}
                />
                <span className="voice-demo__glow-value">{inspectView.yaw}°</span>
              </label>
              <label className="voice-demo__glow-control voice-demo__glow-control--compact">
                <span className="voice-demo__glow-label">Pitch</span>
                <input
                  type="range"
                  className="voice-demo__glow-slider voice-demo__glow-slider--wide"
                  min={-75}
                  max={75}
                  value={inspectView.pitch}
                  disabled={!inspectEnabled}
                  onChange={e => setInspectAngles(inspectView.yaw, Number(e.target.value))}
                  aria-valuenow={inspectView.pitch}
                />
                <span className="voice-demo__glow-value">{inspectView.pitch}°</span>
              </label>
              <button
                type="button"
                className="voice-demo__inspect-reset"
                disabled={!inspectEnabled}
                onClick={resetInspect}>
                Reset view
              </button>
            </DockPanel>
          ) : null}

          <label className="voice-demo__glow-control">
            <span className="voice-demo__glow-label">Pool width</span>
            <input
              type="range"
              className="voice-demo__glow-slider voice-demo__glow-slider--wide"
              min={20}
              max={100}
              value={poolSpread}
              onChange={e => setPoolSpread(Number(e.target.value))}
              aria-valuenow={poolSpread}
            />
            <span className="voice-demo__glow-value">{poolSpread}%</span>
          </label>

          <label className="voice-demo__glow-control">
            <span className="voice-demo__glow-label">Pool light</span>
            <input
              type="range"
              className="voice-demo__glow-slider voice-demo__glow-slider--wide"
              min={0}
              max={100}
              value={poolIntensity}
              onChange={e => {
                isPoolAnimating.current = false
                poolIntensityRef.current = Number(e.target.value) / 100
                setPoolIntensity(Number(e.target.value))
              }}
              aria-valuenow={poolIntensity}
            />
            <span className="voice-demo__glow-value">{poolIntensity}%</span>
          </label>
        </div>
      </div>

      <div className="voice-demo__right-rail">
        {!panels.anim ? (
          <DockPanel
            title="Character Moves"
            subtitle={MASCOT_ANIMATIONS[animKey]?.hint}
            onMinimize={() => togglePanel('anim')}
            className="voice-demo__dock-panel--anim">
            <div className="voice-demo__anim-grid">
              {ANIMATION_ORDER.map(key => (
                <button
                  key={key}
                  type="button"
                  className={`voice-demo__anim-btn${animKey === key ? ' is-active' : ''}`}
                  onClick={() => playAnimation(key)}>
                  {MASCOT_ANIMATIONS[key].label}
                </button>
              ))}
            </div>
          </DockPanel>
        ) : null}
      </div>

      <div className="voice-demo__debug">
        <span>STATE: {stateKey}</span>
        <span>MOVE: {MASCOT_ANIMATIONS[animKey]?.label}</span>
        <span>SURF: {TEXTURE_PRESETS[textureKey]?.label}</span>
        <span>YAW: {inspectView.yaw}°</span>
        <span>PITCH: {inspectView.pitch}°</span>
        <span>POOL: {(poolIntensity / 100).toFixed(2)}</span>
        <span>KEY: {keyAzimuth}° / {keyKelvin}K / {(keyIntensity / 100).toFixed(2)}</span>
      </div>
    </div>
  )
}
