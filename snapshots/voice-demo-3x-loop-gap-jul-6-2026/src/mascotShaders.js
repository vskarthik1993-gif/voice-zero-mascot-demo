import * as THREE from 'three'

export const pbrSurfaceShader = {
  uniforms: {
    baseColor: { value: new THREE.Color('#e6eaef') },
    lightColor: { value: new THREE.Color('#f5e6d4') },
    lightDir: { value: new THREE.Vector3(0, -1, 0.12).normalize() },
    lightIntensity: { value: 1.0 },
    metalness: { value: 1 },
    roughness: { value: 0.06 },
    clearcoat: { value: 0 },
    clearcoatRoughness: { value: 0.1 },
    envMap: { value: null },
    envMapIntensity: { value: 1.2 },
    flipEnvMap: { value: -1 },
    keyLightDir: { value: new THREE.Vector3(0, 0, -1) },
    keyLightColor: { value: new THREE.Color('#ffe8d0') },
    keyLightIntensity: { value: 0.28 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      vPos = position;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    uniform vec3 baseColor;
    uniform vec3 lightColor;
    uniform vec3 lightDir;
    uniform float lightIntensity;
    uniform float metalness;
    uniform float roughness;
    uniform float clearcoat;
    uniform float clearcoatRoughness;
    uniform samplerCube envMap;
    uniform float envMapIntensity;
    uniform float flipEnvMap;
    uniform vec3 keyLightDir;
    uniform vec3 keyLightColor;
    uniform float keyLightIntensity;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;

    void main() {
      vec3 n = normalize(vNormal);
      vec3 v = normalize(vView);
      vec3 l = normalize(-lightDir);

      // Same top-down pool response as Kelvin gradient
      float topLit = pow(max(dot(n, l), 0.0), 0.72);
      float poolMix = lightIntensity;
      float litMix = clamp(poolMix + keyLightIntensity, 0.0, 1.0);
      float ambient = mix(0.04, 0.22, step(0.02, litMix));
      float shade = ambient + topLit * poolMix * 0.78;

      float brush = metalness > 0.5 && roughness > 0.2
        ? pow(abs(sin(vPos.y * 95.0)), 6.0) * 0.45
        : 0.0;
      float r = clamp(roughness + brush * 0.2, 0.02, 0.98);

      float ndl = max(dot(n, l), 0.0);
      vec3 h = normalize(l + v);
      float specPow = mix(6.0, 128.0, 1.0 - r);
      float spec = pow(max(dot(n, h), 0.0), specPow) * ndl * topLit * poolMix;

      vec3 refl = reflect(-v, n);
      vec3 env = textureCube(envMap, vec3(flipEnvMap * refl.x, refl.y, refl.z)).rgb;
      float envGate = pow(topLit, 0.48) * litMix;

      vec3 diffuse = baseColor * shade * (0.5 + 0.5 * (1.0 - metalness * 0.8));
      vec3 specCol = mix(vec3(0.03), lightColor, metalness);
      vec3 col = diffuse + specCol * spec * (0.3 + metalness * 0.9);
      col = mix(col, env * envMapIntensity, metalness * (1.0 - r * 0.6) * envGate);
      col += env * envMapIntensity * 0.03 * (1.0 - metalness) * envGate;
      col += lightColor * topLit * poolMix * 0.32 * (0.25 + metalness * 0.75);

      if (clearcoat > 0.01) {
        float ccSpec = pow(max(dot(n, h), 0.0), mix(20.0, 200.0, 1.0 - clearcoatRoughness)) * topLit * poolMix;
        col += vec3(1.0) * ccSpec * clearcoat * 0.75;
        col = mix(col, env, clearcoat * envGate * 0.3);
      }

      if (keyLightIntensity > 0.001) {
        vec3 kl = normalize(-keyLightDir);
        float keyLit = pow(max(dot(n, kl), 0.0), 0.58);
        vec3 kh = normalize(kl + v);
        float keySpec = pow(max(dot(n, kh), 0.0), specPow) * keyLit;
        col += baseColor * keyLit * keyLightIntensity * 0.16 * (1.0 - metalness * 0.45);
        col += keyLightColor * keyLit * keyLightIntensity * 0.38 * (0.22 + metalness * 0.78);
        col += keyLightColor * keySpec * keyLightIntensity * metalness * (0.22 + (1.0 - r) * 0.42);
      }

      gl_FragColor = vec4(col, 1.0);
    }
  `
}

export const kelvinGradientShader = {
  uniforms: {
    colorHot: { value: new THREE.Color('#fff8f0') },
    colorMid: { value: new THREE.Color('#f0d8b0') },
    colorCool: { value: new THREE.Color('#e8b878') },
    lightColor: { value: new THREE.Color('#f5e6d4') },
    lightDir: { value: new THREE.Vector3(0, -1, 0.12).normalize() },
    lightIntensity: { value: 1.0 },
    bodyDim: { value: 0.68 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      vPos = position;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    uniform vec3 colorHot;
    uniform vec3 colorMid;
    uniform vec3 colorCool;
    uniform vec3 lightColor;
    uniform vec3 lightDir;
    uniform float lightIntensity;
    uniform float bodyDim;
    varying vec3 vNormal;
    varying vec3 vView;
    varying vec3 vPos;

    vec3 smoothGradient(float t) {
      t = clamp(t, 0.0, 1.0);
      t = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
      if (t < 0.5) {
        float u = t * 2.0;
        u = u * u * (3.0 - 2.0 * u);
        return mix(colorCool, colorMid, u);
      }
      float u = (t - 0.5) * 2.0;
      u = u * u * (3.0 - 2.0 * u);
      return mix(colorMid, colorHot, u);
    }

    void main() {
      vec3 n = normalize(vNormal);
      float flow = dot(n, normalize(vec3(0.1, -0.82, 0.38))) * 0.5 + 0.5;
      flow = mix(flow, 1.0 - (vPos.y * 0.016 + 0.5), 0.35);
      flow = smoothstep(0.04, 0.96, flow);
      vec3 base = smoothGradient(flow) * bodyDim;
      float topLit = pow(max(dot(n, -lightDir), 0.0), 0.72);
      vec3 col = base * (0.28 + topLit * lightIntensity) + lightColor * topLit * lightIntensity * 0.42;
      col += colorHot * pow(topLit, 2.8) * 0.18;
      gl_FragColor = vec4(col, 1.0);
    }
  `
}
