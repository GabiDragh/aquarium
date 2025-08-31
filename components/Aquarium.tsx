"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  AccumulativeShadows,
  RandomizedLight,
} from "@react-three/drei";
import Building from "../components/Building";
import Water from "../components/Water";
import Tunnel from "./Tunnel";
import Jellyfish from "./Jellyfish";
import Lights from "./Lights";
import { Leva } from "leva";

// INFO: Camera poition log -> use only when needed otherwise it flods the log
// function CameraDebugger() {
//     const {camera } = useThree()

//     useFrame(() => {
//         console.log("Position:", camera. position)
//         console.log("Rotation:", camera.rotation)

//     })
//     return null
// }

// DONE: Add Leva collapse={false} to each folder

const debug = false;

export default function Aquarium() {
  return (
    <div className="w-screen h-screen">
      <Leva collapsed={true} hidden={!debug} oneLineLabels />
      <Canvas
        camera={{
          position: [-20.57, 2.12, 26.6],
          fov: 50,
        }}
      >
        {/* <CameraDebugger /> */}
        <color attach="background" args={["#050914"]} />

        <Environment preset="night" background={false} />

        <OrbitControls />

        <AccumulativeShadows
          temporal
          frames={100}
          colorBlend={0.5}
          opacity={0.6}
          scale={25}
        >
          <RandomizedLight
            radius={8}
            ambient={0.3}
            intensity={1.5}
            position={[5, 10, -5]}
          />
        </AccumulativeShadows>

        <Lights debug={true} floorY={0.52} />
        <Building />
        <Water />
        <Tunnel />
        <Jellyfish glowHalo haloScale={1.1} />
      </Canvas>
    </div>
  );
}
