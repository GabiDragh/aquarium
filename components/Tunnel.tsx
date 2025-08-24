// TODO: Sort out the camera movement in the tunnel. Not working, superceeds the canvas, just flies over. Might need to change to fixed positions ratehr than flyover

"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const tunnelPathCoords = [
  [29, 10.4, 2.52],
  [29, 15.992, 1.52],
  [29, 21.584, 1.52],
  [29.161, 22.962, 1.52],
  [29.633, 24.267, 1.52],
  [30, 25, 1.52],
  [30.367, 25.733, 1.52],
  [30.839, 27.038, 1.52],
  [31, 28.416, 1.52],
  [31, 34.008, 1.52],
  [31, 39.6, 1.52],
];

const centerOffset = new THREE.Vector3(30, 0, -25);

export default function Tunnel() {
    const { camera } = useThree();
  const progressRef = useRef(0);

 const curve = useMemo(() => {
    const vecs = tunnelPathCoords.map(([x, y, z]) =>
      new THREE.Vector3(x, z, -y).sub(centerOffset)
    );
    return new THREE.CatmullRomCurve3(vecs);
  }, []);

  useFrame((_, delta) => {
    if (!camera) return;

    progressRef.current += delta * 0.05;
    if (progressRef.current > 1) progressRef.current = 1;

    const pos = curve.getPointAt(progressRef.current);
    const lookAt = curve.getPointAt(Math.min(progressRef.current + 0.01, 1));

    if (!pos || !lookAt) return;

    camera.position.copy(pos);
    camera.lookAt(lookAt);
  });

  return null;
}