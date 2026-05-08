import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Stars, Sparkles, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ─── Black Hole GLSL Shader ───────────────────────────────────────────────────
const BlackHoleShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(1, 1),
    uSchwarzschildRadius: 1.5,
  },
  // Vertex
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment — gravitational lensing + accretion glow on disk plane
  `
    uniform float uTime;
    uniform float uSchwarzschildRadius;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Photon sphere approximation
    float blackHoleMask(vec2 uv) {
      float d = length(uv - 0.5) * 2.0;
      float r = uSchwarzschildRadius * 0.18;
      return 1.0 - smoothstep(r - 0.01, r + 0.06, d);
    }

    // Accretion disk glow — hot gas lanes
    vec3 accretionColor(vec2 uv, float t) {
      float d = length(uv - 0.5) * 2.0;
      float angle = atan(uv.y - 0.5, uv.x - 0.5);
      float spin = angle + t * 0.6;
      float lane = sin(spin * 4.0 + d * 8.0) * 0.5 + 0.5;
      float disk = smoothstep(0.26, 0.30, d) * smoothstep(0.72, 0.60, d);

      // Electric Violet + Solar Orange gradient
      vec3 hot   = vec3(1.0, 0.42, 0.0);   // Solar Orange
      vec3 mid   = vec3(0.54, 0.0, 1.0);   // Electric Violet
      vec3 cold  = vec3(0.0, 0.85, 1.0);   // Cyan edge

      vec3 col = mix(cold, mid, smoothstep(0.28, 0.45, d));
      col = mix(col, hot, lane * smoothstep(0.45, 0.30, d));

      // Doppler brightening left vs right
      float doppler = smoothstep(-1.0, 1.0, cos(angle));
      col *= 0.7 + doppler * 1.5;

      return col * disk * (0.8 + lane * 0.7);
    }

    // Lensing distortion — bends light around singularity
    vec2 gravLens(vec2 uv, float strength) {
      vec2 dir = uv - 0.5;
      float d = length(dir);
      float factor = strength / (d * d + 0.001);
      return uv - dir * factor * 0.015;
    }

    // Outer glow corona
    vec3 corona(vec2 uv, float t) {
      float d = length(uv - 0.5) * 2.0;
      float pulse = sin(t * 0.7) * 0.1 + 0.9;
      float rim = smoothstep(0.22, 0.19, d) * smoothstep(0.08, 0.22, d);
      float shimmer = sin(d * 30.0 - t * 3.0) * 0.5 + 0.5;
      vec3 c = mix(vec3(0.54, 0.0, 1.0), vec3(1.0, 0.55, 0.0), shimmer);
      return c * rim * pulse * 2.5;
    }

    void main() {
      vec2 uv = vUv;
      float t  = uTime;

      // Gravitational lensing warp
      vec2 warped = gravLens(uv, 0.04);

      float mask    = blackHoleMask(warped);
      vec3  accrete = accretionColor(uv, t);
      vec3  glow    = corona(uv, t);

      // Background starfield haze (around lens)
      float d2 = length(uv - 0.5) * 2.0;
      vec3  bg = vec3(0.0, 0.0, 0.01) * (1.0 - d2 * 0.5);

      vec3 col = bg + accrete + glow;

      // Absolute singularity — pure black inside photon sphere
      col = mix(col, vec3(0.0), mask);

      // Photon ring — super-bright rim around event horizon
      float rimD    = length(uv - 0.5) * 2.0;
      float photonR = smoothstep(0.205, 0.195, abs(rimD - 0.21)) * 3.0;
      col += vec3(1.0, 0.8, 0.4) * photonR * (0.8 + sin(t * 2.0) * 0.2);

      // Cinematic vignette
      float vig = 1.0 - smoothstep(0.5, 1.0, d2);
      col *= vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `
);
extend({ BlackHoleShaderMaterial });

// ─── Accretion Disk Particle Ring ─────────────────────────────────────────────
function AccretionParticles({ count = 3000 }) {
  const ref    = useRef();
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 2.8 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * (0.12 + Math.random() * 0.15);
      pos[i*3+0] = Math.cos(theta) * r;
      pos[i*3+1] = height;
      pos[i*3+2] = Math.sin(theta) * r;
      // Color: hot inner = orange, outer = violet/cyan
      const heat = 1.0 - (r - 2.8) / 3.2;
      col[i*3+0] = 0.4 + heat * 0.6;
      col[i*3+1] = 0.05 + heat * 0.2;
      col[i*3+2] = 0.8 - heat * 0.3;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.18;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors,    3]} />
      </bufferGeometry>
      <pointsMaterial size={0.055} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} />
    </points>
  );
}

// ─── Chrome Debris ────────────────────────────────────────────────────────────
function ChromeDebris({ count = 35 }) {
  const refs    = useRef([]);
  const data    = useMemo(() => Array.from({ length: count }, (_, i) => ({
    pos:   [( Math.random()-0.5)*28, (Math.random()-0.5)*14, (Math.random()-0.5)*12 - 8],
    rot:   [Math.random()*6, Math.random()*6, Math.random()*6],
    speed: 0.1 + Math.random() * 0.4,
    size:  0.04 + Math.random() * 0.22,
    shape: Math.floor(Math.random() * 3),
  })), [count]);

  useFrame((state) => {
    data.forEach((d, i) => {
      if (!refs.current[i]) return;
      const t = state.clock.elapsedTime * d.speed;
      refs.current[i].rotation.x = d.rot[0] + t;
      refs.current[i].rotation.y = d.rot[1] + t * 0.7;
      refs.current[i].position.y = d.pos[1] + Math.sin(t + i) * 0.4;
    });
  });

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => refs.current[i] = el} position={d.pos} scale={d.size}>
          {d.shape === 0 && <icosahedronGeometry args={[1, 0]} />}
          {d.shape === 1 && <tetrahedronGeometry args={[1, 0]} />}
          {d.shape === 2 && <octahedronGeometry  args={[1, 0]} />}
          <meshStandardMaterial
            color="#d4d4d8"
            metalness={1}
            roughness={0.05}
            envMapIntensity={2}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Liquid Metal Droplets ────────────────────────────────────────────────────
function LiquidMetalDroplets({ count = 20 }) {
  const refs = useRef([]);
  const data = useMemo(() => Array.from({ length: count }, (_, i) => ({
    pos:   [(Math.random()-0.5)*22, (Math.random()-0.5)*10, (Math.random()-0.5)*8 - 4],
    speed: 0.05 + Math.random() * 0.2,
    r:     0.06 + Math.random() * 0.18,
    color: i % 3 === 0 ? '#8B00FF' : i % 3 === 1 ? '#FF6B00' : '#00DBFF',
  })), [count]);

  useFrame((state) => {
    data.forEach((d, i) => {
      if (!refs.current[i]) return;
      const t = state.clock.elapsedTime * d.speed;
      refs.current[i].position.x = d.pos[0] + Math.sin(t * 2.3 + i) * 0.8;
      refs.current[i].position.y = d.pos[1] + Math.cos(t * 1.7 + i) * 0.5;
      // Squash/stretch = liquid
      const sq = 0.85 + Math.sin(t * 4 + i) * 0.15;
      refs.current[i].scale.set(sq, 1/sq, sq);
    });
  });

  return (
    <>
      {data.map((d, i) => (
        <mesh key={i} ref={el => refs.current[i] = el} position={d.pos}>
          <sphereGeometry args={[d.r, 16, 16]} />
          <meshStandardMaterial
            color={d.color}
            metalness={0.95}
            roughness={0.0}
            emissive={d.color}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Black Hole Quad ──────────────────────────────────────────────────────────
function BlackHoleQuad() {
  const matRef  = useRef();
  const { size } = useThree();

  useEffect(() => {
    if (matRef.current) {
      matRef.current.uResolution.set(size.width, size.height);
    }
  }, [size]);

  useFrame((state) => {
    if (matRef.current) matRef.current.uTime = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, -2]} renderOrder={-1}>
      <planeGeometry args={[20, 20, 1, 1]} />
      {/* @ts-ignore */}
      <blackHoleShaderMaterial ref={matRef} uSchwarzschildRadius={1.5} />
    </mesh>
  );
}

// ─── Jet Particles (polar jets from BH) ───────────────────────────────────────
function PolarJet({ direction = 1 }) {
  const ref   = useRef();
  const count = 500;
  const { positions, speeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = Math.random() * 0.4;
      const a = Math.random() * Math.PI * 2;
      p[i*3+0] = Math.cos(a) * r;
      p[i*3+1] = direction * (Math.random() * 10);
      p[i*3+2] = Math.sin(a) * r;
      s[i] = 0.5 + Math.random() * 2;
    }
    return { positions: p, speeds: s };
  }, [count, direction]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i*3+1] += direction * speeds[i] * delta * 0.4;
      if (Math.abs(pos.array[i*3+1]) > 10) pos.array[i*3+1] = 0;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={direction > 0 ? '#8B00FF' : '#FF6B00'}
        transparent opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─── Slow camera orbit ────────────────────────────────────────────────────────
function CameraOrbit() {
  const { camera } = useThree();
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.04;
    camera.position.x = Math.sin(t) * 2.5;
    camera.position.y = Math.cos(t * 0.6) * 1.0;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

// ─── Ambient fog stars ────────────────────────────────────────────────────────
function CosmicFog() {
  const ref = useRef();
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * 0.006; });
  return (
    <group ref={ref}>
      <Stars radius={100} depth={50} count={8000} factor={6} saturation={1} fade speed={0.4} />
      <Sparkles count={300} scale={30} size={3} speed={0.15} color="#8B00FF" opacity={0.5} />
      <Sparkles count={200} scale={20} size={2} speed={0.2} color="#FF6B00" opacity={0.4} />
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function BlackHole3D() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:-1, background:'#000005' }}>
      <Canvas
        camera={{ position:[0, 1.5, 8], fov:60 }}
        gl={{ antialias:true, alpha:false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure:1.4 }}
        dpr={[1, 1.5]}
      >
        <CameraOrbit />
        <CosmicFog />
        <BlackHoleQuad />
        <AccretionParticles count={3500} />
        <PolarJet direction={1}  />
        <PolarJet direction={-1} />
        <ChromeDebris count={40} />
        <LiquidMetalDroplets count={25} />

        {/* Cinematic lighting */}
        <ambientLight intensity={0.05} />
        <pointLight position={[ 6, 3, 2]}  color="#FF6B00" intensity={8}  distance={20} />
        <pointLight position={[-6, -3, 2]} color="#8B00FF" intensity={8}  distance={20} />
        <pointLight position={[ 0, 0, 5]}  color="#00DBFF" intensity={3}  distance={15} />
        <rectAreaLight position={[0,4,2]} width={12} height={2} color="#8B00FF" intensity={4} />
      </Canvas>
    </div>
  );
}
