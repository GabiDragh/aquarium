//Water volume with transmission material and controls
"use client"

import { useGLTF, Center, MeshTransmissionMaterial } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from 'three'
import { useControls } from 'leva'
import type { JSX } from 'react'

export default function Water(props: JSX.IntrinsicElements["group"]) {
  const { scene } = useGLTF("/models/water-volume.glb")

const {
    color,
    attenuationColor,
    bg,
    transmission,
    thickness,
    backsideThickness,
    roughness,
    ior,
    chromaticAberration,
    anisotropicBlur,
    distortion,
    distortionScale,
    temporalDistortion,
    samples,
    resolution,
    backsideResolution,
    clearcoat,
    attenuationDistance,
    transmissionSampler,
    backside
  } = {
    ...useControls("Visual", {
      color: "#a1edff",
      attenuationColor: "#213f9a",
      bg: "#282952"
    }),
    ...useControls("Optical", {
      transmission: { value: 0.78, min: 0, max: 1 },
      thickness: { value: 0.04, min: 0, max: 10, step: 0.01 },
      backsideThickness: { value: 0.02, min: 0, max: 10, step: 0.01 },
      roughness: { value: 0.0, min: 0, max: 1, step: 0.01 },
      ior: { value: 1.26, min: 0, max: 5, step: 0.01 }
    }),
    ...useControls("Effects", {
      chromaticAberration: { value: 0.45, min: 0, max: 1 },
      anisotropicBlur: { value: 0.39, min: 0, max: 1, step: 0.01 },
      distortion: { value: 0.80, min: 0, max: 1, step: 0.01 },
      distortionScale: { value: 0.50, min: 0.01, max: 1, step: 0.01 },
      temporalDistortion: { value: 0.17, min: 0, max: 1, step: 0.01 }
    }),
    ...useControls("Rendering", {
      samples: { value: 10, min: 1, max: 32, step: 1 },
      resolution: { value: 2048, min: 256, max: 4096, step: 256 },
      backsideResolution: { value: 2048, min: 256, max: 4096, step: 256 }
    }),
    ...useControls("Physics", {
      clearcoat: { value: 0.56, min: 0, max: 1 },
      attenuationDistance: { value: 3.78, min: 0, max: 10, step: 0.01 }
    }),
    ...useControls("Toggles", {
      transmissionSampler: true,
      backside: true
    })
  }

  const waterMesh = useMemo(() => {
    const group = scene.getObjectByName("Volume_Water")
    return group?.getObjectByName("Entity_10BD001") as THREE.Mesh | null
  }, [scene])

  return waterMesh ? (
    <Center disableY>
      <mesh
        geometry={waterMesh.geometry}
        position={waterMesh.position}
        rotation={waterMesh.rotation}
        scale={waterMesh.scale}
        castShadow
        receiveShadow
      >
        {/* TODO: Dry code here */}
        <MeshTransmissionMaterial
          background={new THREE.Color(bg)}
          color={new THREE.Color(color)}
          attenuationColor={new THREE.Color(attenuationColor)}
          transmission={transmission}
          thickness={thickness}
          backsideThickness={backsideThickness}
          roughness={roughness}
          ior={ior}
          chromaticAberration={chromaticAberration}
          anisotropicBlur={anisotropicBlur}
          distortion={distortion}
          distortionScale={distortionScale}
          temporalDistortion={temporalDistortion}
          samples={samples}
          resolution={resolution}
          backsideResolution={backsideResolution}
          clearcoat={clearcoat}
          attenuationDistance={attenuationDistance}
          transmissionSampler={transmissionSampler}
          backside={backside}
        />
      </mesh>
    </Center>
  ) : null
}

useGLTF.preload('/models/water-volume.glb')