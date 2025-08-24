"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, AccumulativeShadows, RandomizedLight } from "@react-three/drei";
import Building from "../components/Building"
import Water from "../components/Water";
import Tunnel from "./Tunnel";

// INFO: Camera poition log -> use only when needed otherwise it flods the log
// function CameraDebugger() {
//     const {camera } = useThree()
   
//     useFrame(() => {
//         console.log("Position:", camera. position)
//         console.log("Rotation:", camera.rotation)
        
//     })
//     return null
// }

// TODO: Add Leva collapse={false} to each folder

export default function Aquarium() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [-17.51, 2.86, 20.14], fov: 50 }}>
        {/* <CameraDebugger /> */}

        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={0.7} />

        <Environment preset="forest" />
        <OrbitControls />

        <AccumulativeShadows temporal frames={100} colorBlend={0.5} opacity={0.6} scale={25}>
            <RandomizedLight radius={8} ambient={0.3} intensity={1.5} position={[5, 10, -5]} />
        </AccumulativeShadows>

        <Building />
        <Water />
        {/* <Tunnel /> */}

      </Canvas>
    </div>
  );
}
