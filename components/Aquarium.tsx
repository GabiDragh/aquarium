"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Building from "../components/Building"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Water from "../components/Water";

// INFO: Camera poition log -> use only when needed otherwise it flods the log
// function CameraDebugger() {
//     const {camera } = useThree()
   
//     useFrame(() => {
//         console.log("Position:", camera. position)
//         console.log("Rotation:", camera.rotation)
        
//     })
//     return null
// }


export default function Aquarium() {
  return (
    <div className="w-screen h-screen">
      <Canvas camera={{ position: [-17.51, 2.86, 21.14], fov: 50 }}>
        {/* <CameraDebugger /> */}
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={0.7} />
        <Environment preset="sunset" />
        <OrbitControls />

        <Building />
        {/* <Water /> */}
      </Canvas>
    </div>
  );
}
