// Lights component 

"use client";

import { Center } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect } from "react";

type Props = {
  debug?: boolean;
  floorY?: number; //tank floor level
};

export default function Lights({ debug = true, floorY = 3.52 }: Props) {
  return (
    <Center disableY>
      {/* DARK BASE */}
      <ambientLight intensity={0.25} color={0xffffff} />
      <hemisphereLight color={0x6aa6ff} groundColor={0x001422} intensity={0.35} />

      {/* FAINT SUN FROM ABOVE */}
      <directionalLight position={[0, 25, 0]} intensity={0.1} color={0xffffff}>
        <object3D attach="target" position={[0, 0, 0]} />
      </directionalLight>

      {/* NEON POOLS (PointLights) */}
      <pointLight name="NeonA" position={[-10, floorY + 0.4, -6]} color={0x00f5ff} intensity={20} distance={30} decay={3} />
      <pointLight name="NeonB" position={[ -2, floorY + 0.4, -6]} color={0xff3ef3} intensity={20} distance={50} decay={3} />
      <pointLight name="NeonC" position={[ 10, floorY + 0.4, -6]} color={0x00ff85} intensity={20} distance={50} decay={3} />
      <pointLight name="NeonD" position={[-10, floorY + 0.4,  6]} color={0x22e3ff} intensity={20} distance={50} decay={3} />
      <pointLight name="NeonE" position={[ 2, floorY + 0.4,  6]} color={0xff6d00} intensity={20} distance={50} decay={3} />
      <pointLight name="NeonF" position={[ 10, floorY + 0.4,  6]} color={0xffd500} intensity={20} distance={50} decay={3} />

      {/* {debug && (
        <> */}
          {/* <AttachDirectionalHelper lightName="DirectionalLight" /> */}
          {/* <AttachPointHelper lightName="NeonA" size={0.25} />
          <AttachPointHelper lightName="NeonB" size={0.50} />
          <AttachPointHelper lightName="NeonC" size={0.75} />
          <AttachPointHelper lightName="NeonD" size={1} />
          <AttachPointHelper lightName="NeonE" size={1.25} />
          <AttachPointHelper lightName="NeonF" size={1.50} />
        </>
      )} */}
    </Center>
  );
}

/* -------- Light helpers -------- */
// function AttachDirectionalHelper({ lightName = "DirectionalLight", size = 1, color = 0xffdd55 }) {
//   const { scene } = useThree();
//   useEffect(() => {
//     const light = scene.getObjectByProperty("type", "DirectionalLight") as THREE.DirectionalLight | null;
//     if (!light) return;
//     const helper = new THREE.DirectionalLightHelper(light, size, color as THREE.Color | string | number);
//     scene.add(helper);
//     return () => {
//       helper.dispose?.();
//       scene.remove(helper);
//     };
//   }, [scene, size, color, lightName]);
//   return null;
// }
function AttachPointHelper({ lightName, size = 0.25 }: { lightName: string; size?: number }) {
  const { scene } = useThree();
  useEffect(() => {
    const light = scene.getObjectByName(lightName) as THREE.PointLight | null;
    if (!light) return;
    const helper = new THREE.PointLightHelper(light, size);
    scene.add(helper);
    return () => {
      helper.dispose?.();
      scene.remove(helper);
    };
  }, [scene, lightName, size]);
  return null;
}
