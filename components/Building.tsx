//Aquarium building model

import { useGLTF, Center } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";
import materials from "../constants/materials";
import { applyMaterials } from "./common/applyMaterials";

function Building() {
  const { scene } = useGLTF("/models/aquariumWater.glb");
  // console.log(scene)

  //NOTE: Initial aquarium building model, without the materials logic
  //    useEffect(() => {
  //   scene.traverse((child) => {
  //     if ((child as THREE.Mesh).isMesh) {
  //       const mesh = child as THREE.Mesh;
  //       const parent = mesh.parent as THREE.Group;

  //       console.log("Parent group (Blender Collection):", parent?.name);
  //          }
  //   });
  // }, [scene]);


  //NOTE: useEffect to apply materials to each group (Blender collection) based on the applyMaterials component logic and the materials.ts file info 
  useEffect(() => {
    applyMaterials(scene, materials);
  }, [scene]);

  return (
    <Center disableY>
      <primitive object={scene} />
    </Center>
  );
}

useGLTF.preload("/models/aquariumWater.glb");

export default Building;
