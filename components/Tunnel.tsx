// TODO: Sort out the camera movement in the tunnel. Not working, superceeds the canvas, just flies over. Might need to change to fixed positions ratehr than flyover

"use client";


import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";


// Tunnel path as XYZ coordinates (CAD-style)
const tunnelPathCoords = [
[29, 10.4, 0.52],
[29, 15.992, 0.52],
[29, 21.584, 0.52],
[29.161, 22.962, 0.52],
[29.633, 24.267, 0.52],
[30, 25, 0.52],
[30.367, 25.733, 0.52],
[30.839, 27.038, 0.52],
[31, 28.416, 0.52],
[31, 34.008, 0.52],
[31, 39.6, 0.52],
];


export default function TunnelExperience() {
const { camera } = useThree();
const curve = useMemo(() => {
return new THREE.CatmullRomCurve3(
tunnelPathCoords.map(([x, y, z]) => new THREE.Vector3(x, z, -y))
);
}, []);


const [insideTunnel, setInsideTunnel] = useState(false);
const [index, setIndex] = useState(0);
const movingRef = useRef(false);


// Listen to keypress events
useEffect(() => {
const handleKeyDown = (e: KeyboardEvent) => {
if (!insideTunnel) return;


if (e.key === "w" || e.key === "ArrowUp") {
setIndex((i) => Math.min(tunnelPathCoords.length - 1, i + 1));
movingRef.current = true;
}
if (e.key === "s" || e.key === "ArrowDown") {
setIndex((i) => Math.max(0, i - 1));
movingRef.current = true;
}
};
window.addEventListener("keydown", handleKeyDown);
return () => window.removeEventListener("keydown", handleKeyDown);
}, [insideTunnel]);


// Animate camera to new position
useFrame((_, delta) => {
if (!insideTunnel) return;
const point = curve.getPoint(index / (tunnelPathCoords.length - 1));
if (point) {
camera.position.lerp(point, delta * 5);
}
});


// Optional: toggle tunnel mode with a key (e.g., "t")
useEffect(() => {
const toggle = (e: KeyboardEvent) => {
if (e.key === "t") setInsideTunnel((prev) => !prev);
};
window.addEventListener("keydown", toggle);
return () => window.removeEventListener("keydown", toggle);
}, []);


return null;
}