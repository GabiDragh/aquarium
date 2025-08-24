import { useGLTF, Center } from "@react-three/drei"
import { useEffect } from "react"
import * as THREE from 'three'


function Water() {

    const { scene } = useGLTF('/models/water.glb')

    useEffect(() => {
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).castShadow = true
            } 
        })
    }, [scene])

    return (
    <Center disableY>
       <primitive object={scene} />
    </Center>
    )
}

useGLTF.preload('/models/water.glb')


export default Water