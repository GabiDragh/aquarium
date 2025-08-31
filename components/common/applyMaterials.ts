//NOTE: Component to handle materials application logic (reusable for each material from the materials.ts contants file -> assigns to each blender export collection group)

"use client"

import * as THREE from "three"
import type { MaterialConfig } from "../../constants/materials"

export function applyMaterials(scene: THREE.Group, materials: MaterialConfig[]) {
  const loader = new THREE.TextureLoader()

  // helper to log error
  const loadTex = (url?: string, setup?: (t: THREE.Texture) => void) => {
    if (!url) return undefined
    const tex = loader.load(
      url,
      (t) => {
        // defaults for all textures
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        t.anisotropy = 8
        // sRGB only for color maps; the rest stay linear
        if (!/(_roughness|_metallic|_normal|_height|_ao)|roughness|metal/i.test(url)) {
          t.colorSpace = THREE.SRGBColorSpace
        }
        if (setup) setup(t)
      },
      undefined,
      (err) => {
        console.error(`[applyMaterials] FAILED to load texture: ${url}`, err)
      }
    )
    return tex
  }

  materials.forEach(({ groupName, textures, settings }) => {
    const grp = scene.getObjectByName(groupName) as THREE.Group | undefined
    if (!grp) {
      console.warn(`[applyMaterials] Group not found in GLB: ${groupName}`)
      return
    }

    const mat = new THREE.MeshStandardMaterial()
    mat.side = THREE.DoubleSide
    if (settings?.roughness !== undefined) mat.roughness = settings.roughness

    // Base color (albedo)
    mat.map = loadTex(textures.map, (t) => {
      if (settings?.repeat) t.repeat.set(...settings.repeat)
      if (settings?.rotation) {
        t.center.set(0.5, 0.5) // rotate around center
        t.rotation = settings.rotation
      }
    }) ?? null

    // AO
    mat.aoMap = loadTex(textures.aoMap) ?? null

    // Bump / Height
    mat.bumpMap = loadTex(textures.bumpMap) ?? null
    if (mat.bumpMap) mat.bumpScale = settings?.bumpScale ?? 1

    // Metalness
    mat.metalnessMap = loadTex(textures.metalnessMap) ?? null

    // Normal
    mat.normalMap = loadTex(textures.normalMap) ?? null
    if (mat.normalMap) mat.normalScale = new THREE.Vector2(1, 1)

    // Roughness
    mat.roughnessMap = loadTex(textures.roughnessMap, (t) => {
      if (settings?.repeat) t.repeat.set(...settings.repeat)
      if (settings?.rotation) {
        t.center.set(0.5, 0.5)
        t.rotation = settings.rotation
      }
    }) ?? null

    // Apply to meshes in the group
    grp.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (!mesh.geometry.attributes.uv) {
          console.warn(`[applyMaterials] Mesh has no UVs, skipping: ${mesh.name}`)
          return
        }
        if (textures.aoMap && mesh.geometry.attributes.uv) {
          mesh.geometry.setAttribute("uv2", mesh.geometry.attributes.uv.clone())
        }
        mesh.material = mat
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  })
}
