"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Building from "../components/Building"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Water from "../components/Water";

export default function Aquarium() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [5, 4, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" />
        <OrbitControls />

        <Building />
        {/* <Water /> */}
      </Canvas>
    </div>
  );
}
