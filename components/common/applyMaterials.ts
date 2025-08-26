//NOTE: Component to handle materials application logic (reusable for each material from the materials.ts contants file -> assigns to each blender export collection group)

import * as THREE from "three";
import { MaterialConfig } from "../../constants/materials";

export function applyMaterials(
  scene: THREE.Group,
  materials: MaterialConfig[]
) {
  const textureLoader = new THREE.TextureLoader()

  materials.forEach(({ groupName, textures, settings }) => {
    //get group from scene by name
    const targetGroup = scene.getObjectByName(groupName) as THREE.Group
    if (!targetGroup) return

    //new group material
    const material = new THREE.MeshStandardMaterial()

    //Maps logic:
    //1. base color map: appplies constants file settings
    if (textures.map) {
      material.map = textureLoader.load(textures.map, (t: THREE.Texture) => {
        // console.log("Albedo loaded", t.image?.src);
        t.wrapS = t.wrapT = THREE.RepeatWrapping
        if (settings?.repeat) t.repeat.set(...settings.repeat)
        if (settings?.rotation) t.rotation = settings.rotation
        material.map = t
        material.needsUpdate = true
        t.colorSpace = THREE.SRGBColorSpace
      });
    }
    material.side = THREE.DoubleSide //fallbabk for walls etc to make sure the texture renders on both sides of the face

    //2. ao map
    if (textures.aoMap) {
        material.aoMap = textureLoader.load(textures.aoMap)}

    //3. bump/height map
    if (textures.bumpMap) {
      material.bumpMap = textureLoader.load(textures.bumpMap)
      material.bumpScale = settings?.bumpScale ?? 1
    }

    //4. metalness map: important to add if existent in the pbr package
    if (textures.metalnessMap) {
      material.metalnessMap = textureLoader.load(textures.metalnessMap)}

      //5. normal map: normals orientation (INFO: remember to uv unwrap in Blender, otherwise 3D model entities won't have the normals and won't see any material applied)
    if (textures.normalMap) {
      material.normalMap = textureLoader.load(textures.normalMap)
      material.normalScale = new THREE.Vector2(1, 1)
    }

    //6. roughness map: apply settings from the constants file again to keep the same scale as base/albedo map
    if (textures.roughnessMap) {
      material.roughnessMap = textureLoader.load(
        textures.roughnessMap,
        (t: THREE.Texture) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          if (settings?.repeat) t.repeat.set(...settings.repeat)
          if (settings?.rotation) t.rotation = settings.rotation
        }
      );
    }

    //Apply material to meshes inside the group
    // Traversing through group to assign material to each mesh in the group (name based)
    targetGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        console.log(mesh.name, "UV's:", !!mesh.geometry.attributes.uv)
        if (!mesh.geometry.attributes.uv) return

        //ao map uv2. If needed, clone uv 1 
        if (textures.aoMap && mesh.geometry.attributes.uv) {
          mesh.geometry.setAttribute(
            "uv2",
            mesh.geometry.attributes.uv.clone()
          )
        }

        //assigns material
        mesh.material = material

        //enables shadows
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    });
  });
}
