//NOTE: Material constant file to contain each material maps and settings

import * as THREE from 'three'

//Types

export type MaterialConfig = {
    groupName: string;
    label?: string;
    textures: {
        map?: string;
        aoMap?: string;
        roughnessMap?: string;
        metalnessMap?: string;
        normalMap?: string;
        bumpMap?: string;
        heightMap?: string;
    };
    settings?: {
        repeat?: [number, number];
        rotation?: number;
        bumpScale?: number;
        displacementScale?: number;
    }
};

const materials: MaterialConfig[] = [
    {
        groupName: "Wall_External",
        label: "Wallpaper Deco Scales",
        textures: {
            map: "/textures/art-deco-scales-wallpaper-bl/art-deco-scales-wallpaper_albedo.png",
            aoMap: "/textures/art-deco-scales-wallpaper-bl/art-deco-scales-wallpaper_ao.png",
            bumpMap: "/textures/art-deco-scales-wallpaper-bl/art-deco-scales-wallpaper_height.png",
            metalnessMap: "/textures/art-deco-scales-wallpaper-bl/art-deco-scales-wallpaper_metallic.png",
            normalMap: "/textures/art-deco-scales-wallpaper-bl/art-deco-scales-wallpaper_normal-ogl.png",
            roughnessMap: "/textures/art-deco-scales-wallpaper-bl/art-deco-scales-wallpaper_roughness.png",

        },
        settings: {
            repeat: [40, 45],
            bumpScale: 1.0,
            displacementScale: 1.0,
            rotation: Math.PI/2,
        }
    }
]

export default materials