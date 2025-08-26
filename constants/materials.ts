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
        //INFO:
        //0 - no rotation (0)
        //Math.PI/2 - quarter turn (90)
        //Math.PI - half turn (180)
        //Math.PI * 1.5 - three-quesrter turn (270)
        //Math.PI * 2 - full turn (360)
        bumpScale?: number;
        displacementScale?: number;
    }
};


const materials: MaterialConfig[] = [
    {
        groupName: "Wall_External",
        label: "Wallpaper Deco Scales",
        textures: {
            map: "/textures/wall-external/art-deco-scales-wallpaper_albedo.png",
            aoMap: "/textures/wall-external/art-deco-scales-wallpaper_ao.png",
            bumpMap: "/textures/wall-external/art-deco-scales-wallpaper_height.png",
            metalnessMap: "/textures/wall-external/art-deco-scales-wallpaper_metallic.png",
            normalMap: "/textures/wall-external/art-deco-scales-wallpaper_normal-ogl.png",
            roughnessMap: "/textures/wall-external/art-deco-scales-wallpaper_roughness.png",

        },
        settings: {
            repeat: [60, 60],
            bumpScale: 2.0,
            displacementScale: 1.0,
            rotation: Math.PI/2,
        }
    },
    {
        groupName: "Carpet",
        label: "Tunnel Carpet Floor",
        textures: {
            map: "/textures/carpet/office-carpet-fabric_albedo.png",
            aoMap: "/textures/carpet/office-carpet-fabric_ao.png",
            bumpMap: "/textures/carpet/office-carpet-fabric_height.png",
            metalnessMap: "/textures/carpet/office-carpet-fabric_metallic.png",
            normalMap: "/textures/carpet/office-carpet-fabric_normal-ogl.png",
            roughnessMap: "/textures/carpet/office-carpet-fabric_roughness.png",

        },
        settings: {
            repeat: [20, 20],
            bumpScale: 1.0,
            displacementScale: 1.0,
            rotation: Math.PI/2,
        }
    },
     {
        groupName: "Cill",
        label: "Main Window Cills",
        textures: {
            map: "/textures/cill/semi-gloss-wood_albedo.png",
            aoMap: "/textures/cill/semi-gloss-wood_ao.png",
            bumpMap: "/textures/cill/semi-gloss-wood_height.png",
            metalnessMap: "/textures/cill/semi-gloss-wood_metallic.png",
            normalMap: "/textures/cill/semi-gloss-wood_normal-ogl.png",
            roughnessMap: "/textures/cill/semi-gloss-wood_roughness.png",

        },
        settings: {
            repeat: [1, 1],
            bumpScale: 1.0,
            displacementScale: 1.0,
            rotation: Math.PI,
        }
    },
    // TODO: Find a more discreet material for the columns
    {
        groupName: "Columns",
        label: "Columns",
        textures: {
            map: "/textures/columns/speckled-granite1_albedo.png",
            aoMap: "/textures/columns/speckled-granite1_ao.png",
            bumpMap: "/textures/columns/speckled-granite1_height.png",
            metalnessMap: "/textures/columns/speckled-granite1_metallic.png",
            normalMap: "/textures/columns/speckled-granite1_normal-ogl.png",
            roughnessMap: "/textures/columns/speckled-granite1_roughness.png",

        },
        settings: {
            repeat: [1, 1],
            bumpScale: 1.0,
            displacementScale: 1.0,
            rotation: Math.PI,
        }
    },
    //  {
    //     groupName: "Detail_Gold",
    //     label: "Window Architraves",
    //     textures: {
    //         map: "/textures/detail-gold/GoldPaint_BaseColor.jpg",
    //         aoMap: "/textures/detail-gold/GoldPaint_BaseColor.jpg",
    //         bumpMap: "/textures/detail-gold/speckled-granite1_height.png",
    //         metalnessMap: "/textures/detail-gold/speckled-granite1_metallic.png",
    //         normalMap: "/textures/detail-gold/speckled-granite1_normal-ogl.png",
    //         roughnessMap: "/textures/detail-gold/speckled-granite1_roughness.png",

    //     },
    //     settings: {
    //         repeat: [1, 1],
    //         bumpScale: 1.0,
    //         displacementScale: 1.0,
    //         rotation: Math.PI,
    //     }
    // },

]

export default materials