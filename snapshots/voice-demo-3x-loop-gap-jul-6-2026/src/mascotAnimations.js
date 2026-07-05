// Pixar-style pose sampling — exaggerated squash, stretch & reform
// t = elapsed seconds since animation start

const TAU = Math.PI * 2

export const MASCOT_ANIMATIONS = {
  breathe: {
    label: 'Breathe',
    hint: 'Living idle pulse — chest in, chest out',
    loop: true,
    duration: 0
  },
  nod: {
    label: 'Nod',
    hint: 'BIG yes! Chin to chest, spring back',
    loop: false,
    duration: 1.1
  },
  shake: {
    label: 'Shake',
    hint: 'Rapid head-shake — absolutely not',
    loop: false,
    duration: 1.0
  },
  leanBack: {
    label: 'Lean Back',
    hint: 'WHOA — full recoil of surprise',
    loop: false,
    duration: 1.45
  },
  bow: {
    label: 'Bow',
    hint: 'Deep courteous fold — pancake squash',
    loop: false,
    duration: 1.4
  },
  spin: {
    label: 'Spin',
    hint: 'Show-off pirouette with jelly wobble',
    loop: false,
    duration: 1.65
  },
  wiggle: {
    label: 'Wiggle',
    hint: 'Full-body shimmy — cannot hold still',
    loop: false,
    duration: 1.3
  },
  bounce: {
    label: 'Bounce',
    hint: 'Rubber-ball hops — extreme squash landings',
    loop: false,
    duration: 1.7
  },
  peek: {
    label: 'Peek',
    hint: 'Shy hide-and-reveal from the side',
    loop: false,
    duration: 1.55
  },
  ponder: {
    label: 'Ponder',
    hint: 'Floating thinker — slow dreamy drift',
    loop: true,
    duration: 0
  },
  celebrate: {
    label: 'Celebrate',
    hint: 'JACKPOT — launch, spin, burst!',
    loop: false,
    duration: 2.0
  },
  sneeze: {
    label: 'Sneeze',
    hint: 'Wind-up… AH-CHOO! — explosive stretch',
    loop: false,
    duration: 1.5
  },
  laugh: {
    label: 'Laugh',
    hint: 'Belly-laugh jiggle — ha ha ha!',
    loop: false,
    duration: 1.8
  },
  gasp: {
    label: 'Gasp',
    hint: 'Gobsmacked — stretch tall, quiver',
    loop: false,
    duration: 1.6
  },
  dizzy: {
    label: 'Dizzy',
    hint: 'Stars spinning — drunk wobble aftermath',
    loop: false,
    duration: 2.1
  },
  sleepy: {
    label: 'Sleepy',
    hint: 'Melt into a puddle… zzz',
    loop: false,
    duration: 2.4
  },
  startle: {
    label: 'Startle',
    hint: 'JUMP! — popcorn pop out of skin',
    loop: false,
    duration: 1.2
  },
  strut: {
    label: 'Strut',
    hint: 'Confident swagger — hips don\'t lie',
    loop: false,
    duration: 1.75
  },
  meltdown: {
    label: 'Meltdown',
    hint: 'Total collapse into floor puddle — reform!',
    loop: false,
    duration: 2.5
  },
  inflate: {
    label: 'Inflate',
    hint: 'Balloon puff-up — float — deflate',
    loop: false,
    duration: 2.2
  },
  yoyo: {
    label: 'Yo-Yo',
    hint: 'Elastic snap up, slam down, bounce back',
    loop: false,
    duration: 1.65
  }
}

export const ANIMATION_ORDER = [
  'breathe',
  'nod',
  'shake',
  'leanBack',
  'bow',
  'spin',
  'wiggle',
  'bounce',
  'peek',
  'ponder',
  'celebrate',
  'sneeze',
  'laugh',
  'gasp',
  'dizzy',
  'sleepy',
  'startle',
  'strut',
  'meltdown',
  'inflate',
  'yoyo'
]

const POSE = () => ({
  rotX: 0,
  rotY: 0,
  rotZ: 0,
  posX: 0,
  posY: 0,
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1
})

function clamp01(u) {
  return Math.max(0, Math.min(1, u))
}

function easeOutBack(t, overshoot = 1.70158) {
  const c3 = overshoot + 1
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInCubic(t) {
  return t * t * t
}

/** Volume-preserving squash: compress Y → expand X/Z */
function squashY(p, amount) {
  const sy = 1 - amount
  const expand = 1 / Math.sqrt(Math.max(sy, 0.25))
  p.scaleY = sy
  p.scaleX = expand
  p.scaleZ = expand
}

export function sampleAnimation(key, elapsed) {
  const def = MASCOT_ANIMATIONS[key]
  if (!def) return POSE()

  switch (key) {
    case 'breathe': {
      const p = POSE()
      const s = Math.sin(elapsed * 2.0)
      p.scaleY = 1 + s * 0.045
      p.scaleX = 1 - s * 0.022
      p.scaleZ = 1 - s * 0.015
      p.posY = s * 0.1
      return p
    }

    case 'nod': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const dip = Math.sin(u * Math.PI)
      const overshoot =
        elapsed > d * 0.5
          ? Math.sin((elapsed - d * 0.5) * 22) * 0.09 * Math.exp(-(elapsed - d * 0.5) * 5)
          : 0
      p.rotX = dip * 0.62 + overshoot
      squashY(p, dip * 0.18)
      p.posY = -dip * 0.2
      return p
    }

    case 'shake': {
      const p = POSE()
      const d = def.duration
      const decay = 1 - easeOutCubic(clamp01(elapsed / d))
      const w = Math.sin(elapsed * 32)
      p.rotY = w * 0.45 * decay
      p.rotZ = Math.sin(elapsed * 32 + 0.8) * 0.15 * decay
      p.posX = w * 0.12 * decay
      squashY(p, Math.abs(w) * 0.08 * decay)
      return p
    }

    case 'leanBack': {
      const p = POSE()
      const d = def.duration
      const lean = Math.sin(clamp01(elapsed / d) * Math.PI)
      p.rotX = -lean * 0.55
      p.posY = lean * 0.35
      p.scaleY = 1 + lean * 0.12
      p.scaleX = 1 - lean * 0.08
      p.scaleZ = 0.88 + lean * 0.08
      return p
    }

    case 'bow': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const bow = u < 0.3 ? easeOutCubic(u / 0.3) : 1 - easeInOutCubic((u - 0.3) / 0.7)
      p.rotX = bow * 0.72
      p.posY = -bow * 0.55
      squashY(p, bow * 0.28)
      return p
    }

    case 'spin': {
      const p = POSE()
      const d = def.duration
      const u = easeInOutCubic(clamp01(elapsed / d))
      p.rotY = u * TAU
      const lift = Math.sin(u * Math.PI)
      p.posY = lift * 0.45
      const wob = Math.sin(elapsed * 24) * 0.06 * lift
      p.scaleX = 1 + lift * 0.1 + wob
      p.scaleY = 1 - lift * 0.08 - wob * 0.5
      p.scaleZ = 1 + wob * 0.5
      p.rotZ = wob * 0.3
      return p
    }

    case 'wiggle': {
      const p = POSE()
      const d = def.duration
      const fade = 1 - easeOutCubic(clamp01(elapsed / d))
      const w = Math.sin(elapsed * 18)
      p.rotZ = w * 0.28 * fade
      p.rotY = Math.sin(elapsed * 14) * 0.18 * fade
      p.posX = w * 0.2 * fade
      const sq = 1 + Math.abs(w) * 0.14 * fade
      p.scaleX = sq
      p.scaleY = 1 / sq
      p.scaleZ = sq
      return p
    }

    case 'bounce': {
      const p = POSE()
      const hops = 4
      const hopDur = def.duration / hops
      if (elapsed >= def.duration) return POSE()
      const phase = (elapsed % hopDur) / hopDur
      const hopIdx = Math.min(hops - 1, Math.floor(elapsed / hopDur))
      const decay = 1 - hopIdx * 0.22
      const arc = Math.sin(phase * Math.PI)
      p.posY = arc * 0.85 * decay
      squashY(p, (1 - arc) * 0.22 * decay)
      if (phase < 0.08 && hopIdx > 0) {
        p.scaleY *= 0.82
        p.scaleX *= 1.15
      }
      return p
    }

    case 'peek': {
      const p = POSE()
      const d = def.duration
      const peek = Math.sin(clamp01(elapsed / d) * Math.PI)
      p.rotY = peek * 0.85
      p.rotX = peek * 0.22
      p.posX = peek * 0.35
      p.scaleX = 1 - peek * 0.18
      p.scaleZ = 1 - peek * 0.12
      return p
    }

    case 'ponder': {
      const p = POSE()
      p.rotZ = Math.sin(elapsed * 0.85) * 0.18
      p.rotX = -0.2 + Math.sin(elapsed * 0.65) * 0.08
      p.posY = Math.sin(elapsed * 1.0) * 0.22
      p.rotY = Math.sin(elapsed * 0.4) * 0.12
      p.scaleY = 1 + Math.sin(elapsed * 1.2) * 0.04
      return p
    }

    case 'celebrate': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const pop = u < 0.18 ? easeOutBack(u / 0.18, 2.2) : 1
      const settle = u > 0.65 ? 1 - easeInOutCubic((u - 0.65) / 0.35) : 1
      const e = pop * settle
      p.posY = e * (0.7 + Math.sin(u * Math.PI * 2) * 0.4)
      p.scaleY = 1 + e * 0.22
      p.scaleX = 1 - e * 0.12
      p.scaleZ = 1 - e * 0.08
      p.rotZ = Math.sin(elapsed * 16) * 0.25 * settle
      p.rotY = Math.sin(elapsed * 12) * 0.35 * settle
      return p
    }

    case 'sneeze': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      if (u < 0.45) {
        const wind = easeInCubic(u / 0.45)
        squashY(p, wind * 0.35)
        p.rotX = wind * 0.15
        p.posY = -wind * 0.15
      } else if (u < 0.55) {
        const blast = (u - 0.45) / 0.1
        p.scaleY = 1 + blast * 0.45
        p.scaleX = 1 - blast * 0.2
        p.scaleZ = 1 - blast * 0.15
        p.posY = blast * 0.5
        p.rotX = -blast * 0.2
      } else {
        const settle = 1 - easeOutBack(clamp01((u - 0.55) / 0.45), 2.5)
        squashY(p, settle * 0.12)
        p.posY = settle * 0.15
      }
      return p
    }

    case 'laugh': {
      const p = POSE()
      const d = def.duration
      const fade = 1 - easeOutCubic(clamp01(elapsed / d))
      const ha = Math.abs(Math.sin(elapsed * 14))
      squashY(p, ha * 0.2 * fade)
      p.rotZ = Math.sin(elapsed * 14) * 0.12 * fade
      p.posY = ha * 0.15 * fade
      p.posX = Math.sin(elapsed * 7) * 0.1 * fade
      return p
    }

    case 'gasp': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const gasp = u < 0.25 ? easeOutBack(u / 0.25, 2.0) : 1 - easeInOutCubic((u - 0.25) / 0.75)
      p.scaleY = 1 + gasp * 0.35
      p.scaleX = 1 - gasp * 0.18
      p.scaleZ = 1 - gasp * 0.12
      p.posY = gasp * 0.3
      p.rotX = -gasp * 0.18
      const quiver = gasp * Math.sin(elapsed * 30) * 0.04
      p.rotZ = quiver
      return p
    }

    case 'dizzy': {
      const p = POSE()
      const d = def.duration
      const fade = 1 - easeOutCubic(clamp01(elapsed / d))
      p.rotZ = Math.sin(elapsed * 5) * 0.35 * fade
      p.rotY = Math.sin(elapsed * 3.2) * 0.25 * fade
      p.posX = Math.sin(elapsed * 4) * 0.2 * fade
      const wobble = Math.sin(elapsed * 8) * 0.08 * fade
      p.scaleX = 1 + wobble
      p.scaleY = 1 - wobble
      p.posY = Math.abs(Math.sin(elapsed * 6)) * 0.12 * fade
      return p
    }

    case 'sleepy': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const melt = u < 0.55 ? easeInOutCubic(u / 0.55) : 1 - easeOutBack((u - 0.55) / 0.45, 1.8)
      if (u < 0.55) {
        p.scaleY = 1 - melt * 0.55
        p.scaleX = 1 + melt * 0.35
        p.scaleZ = 1 + melt * 0.2
        p.posY = -melt * 0.7
        p.rotX = melt * 0.25
        p.rotZ = melt * 0.08
      } else {
        const reform = 1 - melt
        p.scaleY = 0.45 + reform * 0.55
        p.scaleX = 1.35 - reform * 0.35
        p.posY = -0.7 + reform * 0.7
        p.rotX = 0.25 * (1 - reform)
      }
      return p
    }

    case 'startle': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      if (u < 0.12) {
        const pop = easeOutBack(u / 0.12, 3.0)
        p.scaleX = 1 + pop * 0.25
        p.scaleY = 1 + pop * 0.3
        p.scaleZ = 1 + pop * 0.2
        p.posY = pop * 0.6
      } else {
        const shake = (1 - easeOutCubic((u - 0.12) / 0.88)) * Math.sin(elapsed * 40) * 0.15
        p.rotZ = shake
        p.rotY = shake * 0.6
        const settle = 1 - easeOutCubic((u - 0.12) / 0.88)
        p.scaleY = 1 + settle * 0.15
        p.posY = settle * 0.4
      }
      return p
    }

    case 'strut': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const swagger = Math.sin(u * TAU * 2)
      const env = Math.sin(u * Math.PI)
      p.posX = swagger * 0.35 * env
      p.rotZ = swagger * 0.22 * env
      p.rotY = swagger * 0.15 * env
      p.scaleY = 1 + Math.abs(swagger) * 0.06 * env
      p.posY = Math.abs(swagger) * 0.08 * env
      return p
    }

    case 'meltdown': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      if (u < 0.4) {
        const melt = easeInCubic(u / 0.4)
        p.scaleY = 1 - melt * 0.72
        p.scaleX = 1 + melt * 0.55
        p.scaleZ = 1 + melt * 0.3
        p.posY = -melt * 1.1
        p.rotX = melt * 0.35
        p.rotZ = Math.sin(elapsed * 10) * 0.1 * melt
      } else if (u < 0.55) {
        p.scaleY = 0.28
        p.scaleX = 1.55
        p.posY = -1.1
        p.rotX = 0.35
      } else {
        const reform = easeOutBack((u - 0.55) / 0.45, 2.8)
        p.scaleY = 0.28 + reform * 0.72
        p.scaleX = 1.55 - reform * 0.55
        p.scaleZ = 1.3 - reform * 0.3
        p.posY = -1.1 + reform * 1.1
        p.rotX = 0.35 * (1 - reform)
        p.posY += Math.sin(reform * Math.PI) * 0.25
      }
      return p
    }

    case 'inflate': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      let puff
      if (u < 0.35) puff = easeOutCubic(u / 0.35)
      else if (u < 0.65) puff = 1 + Math.sin((u - 0.35) / 0.3 * Math.PI) * 0.15
      else puff = 1 - easeInOutCubic((u - 0.65) / 0.35)
      const s = 1 + puff * 0.38
      p.scaleX = s
      p.scaleY = s
      p.scaleZ = s
      p.posY = puff * 0.45
      const wob = Math.sin(elapsed * 12) * 0.04 * puff
      p.rotZ = wob
      return p
    }

    case 'yoyo': {
      const p = POSE()
      const d = def.duration
      const u = clamp01(elapsed / d)
      const cycle = (u * 2.5) % 1
      const snap = cycle < 0.5 ? easeInCubic(cycle / 0.5) : 1 - easeOutBack((cycle - 0.5) / 0.5, 2.5)
      const down = 1 - snap
      p.posY = snap * 0.7 - down * 0.35
      p.scaleY = 1 + snap * 0.35 - down * 0.2
      p.scaleX = 1 - snap * 0.15 + down * 0.18
      p.scaleZ = 1 - snap * 0.1
      if (down > 0.8) squashY(p, 0.25)
      return p
    }

    default:
      return POSE()
  }
}

export const ANIMATION_REPEAT_COUNT = 3
export const ANIMATION_LOOP_GAP = 0.7

export function isAnimationComplete(key, elapsed) {
  const def = MASCOT_ANIMATIONS[key]
  if (!def || def.loop) return false
  return elapsed >= def.duration
}
