// TODO: Sort out the camera movement in the tunnel. Not working, superceeds the canvas, just flies over. Might need to change to fixed positions ratehr than flyover

"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

// Tunnel path as XYZ coordinates
const tunnelPathCoords: [number, number, number][] = [
  [1.38, 2, -16.11],
  [1.2, 2, -12.42],
  [1.27, 2, -7.35],
  [1.03, 2, -3.92],
  [0.19, 2, -1.04],
  [-0.7, 2, 0.32],
  [-1.27, 2, 2.06],
  [-0.3, 2, 4.9],
  [-1.03, 2, 9.96],
  [-0.99, 2, 15.58],
];

export default function TunnelExperience() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  const [insideTunnel, setInsideTunnel] = useState(false);
  const [index, setIndex] = useState(0);

  // --- Toggle tunnel mode with T ---
  useEffect(() => {
    const toggle = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "t") {
        setInsideTunnel((prev) => !prev);
      }
    };
    window.addEventListener("keydown", toggle);
    return () => window.removeEventListener("keydown", toggle);
  }, []);

  // --- Handle stepping (keyboard + click) ---
  useEffect(() => {
    if (!insideTunnel) return;

    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") {
        setIndex((i) => Math.min(i + 1, tunnelPathCoords.length - 1));
      }
      if (key === "s" || key === "arrowdown") {
        setIndex((i) => Math.max(i - 1, 0));
      }
    };

    const handleClick = () => {
      setIndex((i) => Math.min(i + 1, tunnelPathCoords.length - 1));
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("click", handleClick);
    };
  }, [insideTunnel]);

  // --- Snap camera + lock pivot at current waypoint ---
  useEffect(() => {
    if (!insideTunnel || !controlsRef.current) return;

    const [x, y, z] = tunnelPathCoords[index];
    const pos = new THREE.Vector3(x, y, z);

    // Place camera at the waypoint
    camera.position.copy(pos);

    // Lock orbit pivot at the same spot
    controlsRef.current.target.copy(pos);
    controlsRef.current.update();
  }, [index, insideTunnel, camera]);

  return (
    <>
      {insideTunnel && (
        <OrbitControls
          ref={controlsRef}
          args={[camera, gl.domElement]}
          enablePan={false}
          enableZoom={false}
        />
      )}
    </>
  );
}
