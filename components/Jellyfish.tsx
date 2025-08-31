"use client";

import { Center, MeshWobbleMaterial, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Fragment, useMemo, useRef } from "react";

type SchoolProps = {
  url?: string;
  count?: number;

  // glass clearance
  margin?: number;

  // separation
  separationRadius?: number;       // baseline distance 
  separationStrength?: number;

  // sizes
  baseScale?: number;              // used if scaleRange is not provided
  scaleRange?: [number, number];   // absolute scale range (overrides baseScale/jitter)
  scaleJitter?: [number, number];  // multiplier around baseScale if no scaleRange

  // motion ranges per agent
  speedRange?: [number, number];           // horizontal speed (m/s)
  verticalSpeedRange?: [number, number];   // vertical follow speed (m/s)
  buoyancyRange?: [number, number];
  pulseFreqRange?: [number, number];
  pulseUpRange?: [number, number];

  bobAmpRange?: [number, number];
  bobSpeedRange?: [number, number];
  wobbleFactorRange?: [number, number];
  wobbleSpeedRange?: [number, number];
  tiltPerSpeedDeg?: number;
  maxTiltDeg?: number;

  color?: string;
  debugBox?: boolean;

  // glow
  palette?: string[];
  glowRange?: [number, number];
  glowHalo?: boolean;
  haloScale?: number;
  haloOpacity?: [number, number];
};

type AgentParams = {
  speed: number;
  verticalSpeed: number;
  buoyancyUp: number;
  pulseFreq: number;
  pulseUpStrength: number;
  bobAmp: number;
  bobSpeed: number;
  wobbleFactor: number;
  wobbleSpeed: number;
  tiltPerSpeedDeg: number;
  maxTiltDeg: number;
  scale: number;  
  color: string;
};

export default function Jellyfish({
  url = "/models/jellyfish.glb",
  count = 10,
  margin = 4,
  separationRadius = 4,
  separationStrength = 1.5,

  baseScale = 0.25,
  scaleRange,
  scaleJitter = [0.05, 1.5],

  speedRange = [0.02, 0.2],
  verticalSpeedRange = [0.05, 0.2],
  buoyancyRange = [0.006, 0.025],
  pulseFreqRange = [0.65, 0.95],
  pulseUpRange = [0.015, 0.03],

  bobAmpRange = [0.02, 0.045],
  bobSpeedRange = [0.2, 0.35],
  wobbleFactorRange = [0.16, 0.26],
  wobbleSpeedRange = [0.75, 1.05],
  tiltPerSpeedDeg = 4.5,
  maxTiltDeg = 7,

  color = "#7dd3fc",
  debugBox = false,

  //glow
  palette = ["#00f5ff", "#ff3ef3", "#00ff85", "#22e3ff", "#ffd500", "#ff6d00"],
  glowRange = [0.7, 2.2],
}: SchoolProps) {
  const { scene } = useGLTF(url);

  // One geometry for all
  const jellyGeom = useMemo(() => {
    let m: THREE.Mesh | null = null;
    scene.traverse((c) => {
      if ((c as THREE.Mesh).isMesh && !m) m = c as THREE.Mesh;
    });
    if (m && (m as THREE.Mesh).geometry && (m as THREE.Mesh).geometry instanceof THREE.BufferGeometry) {
      return (m as THREE.Mesh).geometry as THREE.BufferGeometry;
    }
    return null;
  }, [scene]);

  // Refs per agent (render)
  const outerRefs = useRef<(THREE.Group | null)[]>([]);
  const innerRefs = useRef<(THREE.Group | null)[]>([]);
  const matRefs   = useRef<(THREE.Material | null)[]>([]);

  // Water refs
  const waterObjRef = useRef<THREE.Object3D | null>(null);
  const waterBoxRef = useRef<THREE.Box3 | null>(null);
  const boxHelperRef = useRef<THREE.Box3Helper | null>(null);
  const rayRef = useRef(new THREE.Raycaster());

  // WORLD-SPACE motion state
  const posW = useRef([...Array(count)].map(() => new THREE.Vector3()));
  const velW = useRef([...Array(count)].map(() => new THREE.Vector3()));
  const targetW = useRef<(THREE.Vector3 | null)[]>([...Array(count)].map(() => null));
  const timers = useRef<Float32Array>(new Float32Array(count));
  const inited = useRef<boolean[]>([...Array(count)].map(() => false));

  // Per-agent config
  const params = useRef<AgentParams[]>([...Array(count)].map(() => ({
    speed:           rand(speedRange[0],           speedRange[1]),
    verticalSpeed:   rand(verticalSpeedRange[0],   verticalSpeedRange[1]),
    buoyancyUp:      rand(buoyancyRange[0],        buoyancyRange[1]),
    pulseFreq:       rand(pulseFreqRange[0],       pulseFreqRange[1]),
    pulseUpStrength: rand(pulseUpRange[0],         pulseUpRange[1]),
    bobAmp:          rand(bobAmpRange[0],          bobAmpRange[1]),
    bobSpeed:        rand(bobSpeedRange[0],        bobSpeedRange[1]),
    wobbleFactor:    rand(wobbleFactorRange[0],    wobbleFactorRange[1]),
    wobbleSpeed:     rand(wobbleSpeedRange[0],     wobbleSpeedRange[1]),
    tiltPerSpeedDeg,
    maxTiltDeg,
    scale: computeAgentScale(baseScale, scaleRange, scaleJitter),
    color,
  })));

  
  // Neon per-jelly (for glow)
  const neon = useRef(
    Array.from({ length: count }, () => {
      const c = new THREE.Color(palette[(Math.random() * palette.length) | 0]);
      return { base: c, current: c.clone(), hueShift: (Math.random() * 0.04 - 0.02) };
    })
  );

  // For scale-aware separation
  const sepRefScale = useMemo(
    () => (scaleRange ? (scaleRange[0] + scaleRange[1]) / 2 : baseScale),
    [scaleRange, baseScale]
  );

  // Scratch
  const sepForces = useRef([...Array(count)].map(() => new THREE.Vector3()));
  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const worldCandidate = new THREE.Vector3();

  useFrame((state, delta) => {
    const root = state.scene;
    const t = state.clock.getElapsedTime();

    // 1) Locate the water mesh, compute its world AABB once
    if (!waterObjRef.current) {
      const water = root.getObjectByName("WaterVolume");
      if (water) {
        waterObjRef.current = water;
        const box = new THREE.Box3().setFromObject(water);
        waterBoxRef.current = box;
        if (debugBox) {
          const helper = new THREE.Box3Helper(box, 0x00ffff);
          boxHelperRef.current = helper;
          root.add(helper);
        }
      } else {
        return; // wait for WaterVolume to mount
      }
    }
    const waterObj = waterObjRef.current!;
    const box = waterBoxRef.current!;
    const topLimit = box.max.y - margin;
    const bottomLimit = box.min.y + margin;

    // 2) Init each agent in WORLD space at a random point truly INSIDE the water mesh
    for (let i = 0; i < count; i++) {
      if (!inited.current[i] && outerRefs.current[i]) {
        const pW = randomPointInsideWater(box, margin + separationRadius * 0.6, waterObj, rayRef.current) ?? box.getCenter(new THREE.Vector3());
        // keep initial spacing (scaled by sizes)
        let tries = 0;
        const minSepBase = separationRadius * (params.current[i].scale / sepRefScale);
        while (tries++ < 40 && tooCloseWorld(pW, posW.current, params.current, i, minSepBase, sepRefScale)) {
          const retry = randomPointInsideWater(box, margin + separationRadius * 0.6, waterObj, rayRef.current);
          if (retry) pW.copy(retry);
        }

        posW.current[i].copy(pW);
        velW.current[i].set(0, 0, 0);
        targetW.current[i] = pickTargetInsideWater(box, pW, margin, waterObj, rayRef.current);
        timers.current[i] = 0;
        inited.current[i] = true;

        // write to render object (convert world -> local of parent)
        const outer = outerRefs.current[i]!;
        if (outer.parent) {
          const local = pW.clone();
          outer.parent.worldToLocal(local);
          outer.position.copy(local);
        } else {
          outer.position.copy(pW);
        }
      }
    }

    // Wait until all outer refs exist
    for (let i = 0; i < count; i++) if (!outerRefs.current[i]) return;

    // 3) Separation in WORLD space (size-aware)
    for (let i = 0; i < count; i++) sepForces.current[i].set(0, 0, 0);
    for (let i = 0; i < count; i++) {
      const pi = posW.current[i];
      const si = params.current[i].scale;
      for (let j = i + 1; j < count; j++) {
        const pj = posW.current[j];
        const sj = params.current[j].scale;
        const minD = separationRadius * ((si + sj) / (2 * sepRefScale));
        tmp.subVectors(pi, pj);
        const d = tmp.length();
        if (d > 0 && d < minD) {
          const push = (1 - d / minD) * separationStrength;
          tmp.normalize().multiplyScalar(push);
          sepForces.current[i].add(tmp);
          sepForces.current[j].sub(tmp);
        }
      }
    }

    // 4) Move each agent (WORLD space), then write to render (LOCAL)
    for (let i = 0; i < count; i++) {
      const outer = outerRefs.current[i]!;
      const inner = innerRefs.current[i]!;
      const mat   = matRefs.current[i] as THREE.MeshStandardMaterial | null;
      const p     = posW.current[i];
      const v     = velW.current[i];
      const cfg   = params.current[i];

      timers.current[i] += delta;

      // target refresh if close or timed out
      if (!targetW.current[i]) {
        targetW.current[i] = pickTargetInsideWater(box, p, margin, waterObj, rayRef.current);
      } else {
        tmp.copy(targetW.current[i]!).sub(p);
        const dist = tmp.length();
        if (dist < 0.22 || timers.current[i] > 8) {
          targetW.current[i] = pickTargetInsideWater(box, p, margin, waterObj, rayRef.current);
          timers.current[i] = 0;
        }
      }

      // Desired velocity (WORLD) toward target + buoyancy + pulse thrust
      tmp.copy(targetW.current[i]!).sub(p);
      // Horizontal desired
      tmp2.set(tmp.x, 0, tmp.z);
      const dH = tmp2.length();
      if (dH > 0.0001) tmp2.multiplyScalar(cfg.speed / dH);
      // Vertical towards target slowly
      const toY = THREE.MathUtils.clamp(targetW.current[i]!.y - p.y, -0.4, 0.4);
      tmp2.y = toY * THREE.MathUtils.clamp(cfg.verticalSpeed, 0.01, 0.2);

      // Buoyancy + pulse
      const s = Math.sin(t * (Math.PI * 2) * cfg.pulseFreq);
      const upThrust = s > 0 ? s * cfg.pulseUpStrength : 0;
      tmp2.y += cfg.buoyancyUp + upThrust;

      // Top/bottom soft avoidance
      const nearTop = p.y > topLimit - 0.12;
      const nearBottom = p.y < bottomLimit + 0.12;
      if (nearTop) {
        if (targetW.current[i]!.y >= p.y - 0.01)
          targetW.current[i]!.y = THREE.MathUtils.lerp(bottomLimit, topLimit, 0.35 + Math.random() * 0.25);
        tmp2.y = Math.min(tmp2.y, 0) - 0.05;
      }
      if (nearBottom) {
        if (targetW.current[i]!.y <= p.y + 0.01)
          targetW.current[i]!.y = THREE.MathUtils.lerp(bottomLimit, topLimit, 0.55 + Math.random() * 0.25);
        tmp2.y = Math.max(tmp2.y, 0) + 0.025;
      }

      // Add separation (WORLD)
      tmp.addVectors(tmp2, sepForces.current[i]);

      // Smooth velocity & propose next world position
      v.lerp(tmp, THREE.MathUtils.clamp(delta * 1.6, 0, 1));

      worldCandidate.copy(p).addScaledVector(v, delta);

      // Coarse clamp to AABB margin
      clampToBox(worldCandidate, box, margin);

      // HARD test: must be inside actual water mesh
      if (!isInsideWater(worldCandidate, waterObj, rayRef.current)) {
        // reject step, slow down, retarget deeper inside
        v.multiplyScalar(0.2);
        targetW.current[i] = pickTargetInsideWater(box, p, margin, waterObj, rayRef.current);
      } else {
        // accept step
        p.copy(worldCandidate);
      }

      // Write render transform: world -> local of parent
      if (outer.parent) {
        const local = p.clone();
        outer.parent.worldToLocal(local);
        outer.position.copy(local);
      } else {
        outer.position.copy(p);
      }

      // Visual bob + pulse (scale uses cfg.scale)
      if (inner) {
        inner.position.y = Math.sin(t * (cfg.bobSpeed * Math.PI * 2)) * cfg.bobAmp;
        const beat = (Math.sin(t * cfg.pulseFreq * Math.PI * 2) + 1) * 0.5;
        const squashY = 1 - beat * 0.06;
        const stretchXZ = 1 + beat * 0.07;
        inner.scale.set(stretchXZ * cfg.scale, squashY * cfg.scale, stretchXZ * cfg.scale);
      }

      // Tilt into horizontal motion
      const speedH = Math.hypot(v.x, v.z);
      const deg = Math.min(cfg.maxTiltDeg, speedH * cfg.tiltPerSpeedDeg);
      const tiltX = THREE.MathUtils.degToRad((v.z / (speedH || 1)) * deg);
      const tiltZ = THREE.MathUtils.degToRad((-v.x / (speedH || 1)) * deg);
      outer.rotation.x = THREE.MathUtils.lerp(outer.rotation.x, tiltX, THREE.MathUtils.clamp(delta * 3, 0, 1));
      outer.rotation.z = THREE.MathUtils.lerp(outer.rotation.z, tiltZ, THREE.MathUtils.clamp(delta * 3, 0, 1));

      // Emissive pulse
       if (mat) {
        // hue drift
        const clr = neon.current[i].current;
        const hsl: { h: number; s: number; l: number } = { h: 0, s: 0, l: 0 };
        clr.getHSL(hsl);
        clr.setHSL((hsl.h + neon.current[i].hueShift * delta + 1) % 1, Math.min(1, hsl.s), hsl.l);

        // pulse intensity
        const beat = (Math.sin(t * 1.8 + i * 0.7) + 1) * 0.5;
        const ei = THREE.MathUtils.lerp(glowRange[0], glowRange[1], beat);

        mat.emissive.copy(clr);
        mat.emissiveIntensity = ei;
      }
    }
  });

  if (!jellyGeom) return null;

  return (
    <Center disableY>
      {Array.from({ length: count }).map((_, i) => (
        <Fragment key={i}>
          <group ref={(el) => (outerRefs.current[i] = el)}>
            <group ref={(el) => (innerRefs.current[i] = el)}>
              <mesh geometry={jellyGeom} castShadow receiveShadow>
                <MeshWobbleMaterial
                  ref={(el) => { matRefs.current[i] = el as THREE.MeshStandardMaterial | null; }}
                   color={"#cfe9ff"}
                  emissive={"#ffffff"}
                  roughness={0.35}
                  metalness={0.05}
                  factor={params.current[i].wobbleFactor}
                  speed={params.current[i].wobbleSpeed}
                  toneMapped={false}
                />
              </mesh>
            </group>
          </group>
        </Fragment>
      ))}
    </Center>
  );
}

// ---------- inside-water logic & helpers ----------
function isInsideWater(pointWorld: THREE.Vector3, waterObj: THREE.Object3D, ray: THREE.Raycaster) {
  // odd-even rule via raycast; offset a hair to avoid edge hits
  const dir = _v1.set(0.987, 0.123, 0.421).normalize();
  const origin = _v2.copy(pointWorld).addScaledVector(dir, 1e-4);
  ray.set(origin, dir);
  const hits = ray.intersectObject(waterObj, true);
  return hits.length % 2 === 1;
}

function randomPointInsideWater(
  box: THREE.Box3,
  margin: number,
  waterObj: THREE.Object3D,
  ray: THREE.Raycaster,
  tries = 60
) {
  for (let i = 0; i < tries; i++) {
    const p = randomPointInBox(box, margin);
    if (isInsideWater(p, waterObj, ray)) return p;
  }
  return null; // caller will fall back to center
}

function computeAgentScale(base: number, range?: [number, number], jitter?: [number, number]) {
  if (range) return rand(range[0], range[1]);
  const j0 = jitter?.[0] ?? 1;
  const j1 = jitter?.[1] ?? 1;
  return base * rand(j0, j1);
}

function clampToBox(v: THREE.Vector3, box: THREE.Box3, m: number) {
  v.set(
    THREE.MathUtils.clamp(v.x, box.min.x + m, box.max.x - m),
    THREE.MathUtils.clamp(v.y, box.min.y + m, box.max.y - m),
    THREE.MathUtils.clamp(v.z, box.min.z + m, box.max.z - m)
  );
  return v;
}

function randomPointInBox(box: THREE.Box3, m: number) {
  return new THREE.Vector3(
    rand(box.min.x + m, box.max.x - m),
    rand(box.min.y + m, box.max.y - m),
    rand(box.min.z + m, box.max.z - m)
  );
}

function tooCloseWorld(
  p: THREE.Vector3,
  arr: THREE.Vector3[],
  cfg: AgentParams[],
  uptoIdx: number,
  sepRadius: number,
  sepRefScale: number
) {
  for (let j = 0; j < uptoIdx; j++) {
    const desiredMin = sepRadius * ((cfg[uptoIdx].scale + cfg[j].scale) / (2 * sepRefScale));
    if (arr[j].distanceToSquared(p) < desiredMin * desiredMin) return true;
  }
  return false;
}

function pickTargetInsideWater(
  box: THREE.Box3,
  fromWorld: THREE.Vector3,
  margin: number,
  waterObj: THREE.Object3D,
  ray: THREE.Raycaster
) {
  const bottom = box.min.y + margin;
  const top = box.max.y - margin;
  const range = top - bottom;
  const high = fromWorld.y > bottom + 0.75 * range;

  for (let i = 0; i < 40; i++) {
    const y = THREE.MathUtils.clamp(
      fromWorld.y + (high ? -1 : 1) * rand(0.1, 0.35) * range,
      bottom,
      top
    );
    const x = rand(box.min.x + margin, box.max.x - margin);
    const z = rand(box.min.z + margin, box.max.z - margin);
    const p = _v3.set(x, y, z);
    if (isInsideWater(p, waterObj, ray)) return p.clone();
  }
  // fallback: any random inside-water point
  return randomPointInsideWater(box, margin, waterObj, ray) ?? box.getCenter(new THREE.Vector3());
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

// temp vectors
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
