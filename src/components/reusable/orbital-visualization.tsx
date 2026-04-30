'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Suppress THREE.Clock deprecation warning emitted by @react-three/fiber internals
if (typeof window !== 'undefined') {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock')) return;
    _warn(...args);
  };
}

// Shared time accumulator updated once per frame via r3f delta — no THREE.Clock/Timer
const worldTime = { t: 0 };

interface PlanetData {
  name: string;
  radius: number;
  orbitRadius: number;
  speed: number;
  color: string;
  emissive: string;
  tiltX: number;
  tiltZ: number;
  startAngle: number;
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
}

const PLANETS: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 0.2,
    orbitRadius: 2.8,
    speed: 1.6,
    color: '#b5a59a',
    emissive: '#6b5c4e',
    tiltX: 0.3,
    tiltZ: 0.2,
    startAngle: 0,
  },
  {
    name: 'Venus',
    radius: 0.34,
    orbitRadius: 4.4,
    speed: 1.15,
    color: '#e8c97e',
    emissive: '#c8a440',
    tiltX: -0.5,
    tiltZ: -0.25,
    startAngle: 1.0,
  },
  {
    name: 'Earth',
    radius: 0.36,
    orbitRadius: 6.0,
    speed: 0.85,
    color: '#4fc3f7',
    emissive: '#0288d1',
    tiltX: 0.4,
    tiltZ: 0.45,
    startAngle: 2.2,
  },
  {
    name: 'Mars',
    radius: 0.27,
    orbitRadius: 8.0,
    speed: 0.65,
    color: '#ef7e56',
    emissive: '#b84220',
    tiltX: -0.6,
    tiltZ: 0.3,
    startAngle: 3.5,
  },
  {
    name: 'Saturn',
    radius: 0.55,
    orbitRadius: 10.5,
    speed: 0.35,
    color: '#e8d5a3',
    emissive: '#c9a84c',
    tiltX: 0.45,
    tiltZ: -0.55,
    startAngle: 0.5,
    hasRings: true,
    ringInner: 0.78,
    ringOuter: 1.45,
  },
];

function Sun() {
  const coreRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const t = worldTime.t;
    if (coreRef.current) coreRef.current.scale.setScalar(1 + Math.sin(t * 2.0) * 0.025);
    if (midRef.current) midRef.current.scale.setScalar(1 + Math.sin(t * 1.4 + 1) * 0.05);
    if (outerRef.current) outerRef.current.scale.setScalar(1 + Math.sin(t * 0.9 + 2) * 0.08);
  });

  return (
    <>
      <mesh ref={outerRef} scale={2.4}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#ff5500"
          emissive="#ff3300"
          emissiveIntensity={0.4}
          transparent
          opacity={0.05}
        />
      </mesh>
      <mesh ref={midRef} scale={1.55}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#fdb813"
          emissiveIntensity={0.6}
          transparent
          opacity={0.1}
        />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial color="#ffe066" emissive="#fdb813" emissiveIntensity={1.4} />
      </mesh>
    </>
  );
}

function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const primitive = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color, opacity: 0.2, transparent: true });
    return new THREE.Line(geo, mat);
  }, [radius, color]);

  return <primitive object={primitive} />;
}

function SaturnRings({ inner, outer }: { inner: number; outer: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 80]} />
      <meshStandardMaterial
        color="#c8a860"
        emissive="#8a6020"
        emissiveIntensity={0.35}
        side={THREE.DoubleSide}
        transparent
        opacity={0.72}
      />
    </mesh>
  );
}

function PlanetSystem({ planet }: { planet: PlanetData }) {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!planetRef.current) return;
    const t = worldTime.t * planet.speed * 0.25 + planet.startAngle;
    planetRef.current.position.x = Math.cos(t) * planet.orbitRadius;
    planetRef.current.position.z = Math.sin(t) * planet.orbitRadius;
    planetRef.current.rotation.y += 0.006;
  });

  return (
    <group rotation={[planet.tiltX, 0, planet.tiltZ]}>
      <OrbitRing radius={planet.orbitRadius} color={planet.color} />
      <mesh ref={planetRef}>
        <sphereGeometry args={[planet.radius, 32, 32]} />
        <meshStandardMaterial
          color={planet.color}
          emissive={planet.emissive}
          emissiveIntensity={0.45}
          roughness={0.75}
          metalness={0.1}
        />
        {planet.hasRings && <SaturnRings inner={planet.ringInner!} outer={planet.ringOuter!} />}
      </mesh>
    </group>
  );
}

function SolarSystem() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = worldTime.t * 0.045;
    }
  });

  return (
    <group ref={groupRef}>
      <Sun />
      {PLANETS.map((planet) => (
        <PlanetSystem key={planet.name} planet={planet} />
      ))}
    </group>
  );
}

function Ticker() {
  useFrame((_, delta) => {
    worldTime.t += delta;
  });
  return null;
}

function Scene() {
  return (
    <>
      <Ticker />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffd080" distance={50} decay={1.2} />
      <pointLight position={[30, 15, 25]} intensity={0.1} color="#4488ff" distance={100} />
      <SolarSystem />
    </>
  );
}

export function OrbitalVisualization() {
  return (
    <div style={{ width: '100%', height: '100%' }} className="w-full h-full bg-transparent">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 10, 26], fov: 58, near: 0.1, far: 300 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
