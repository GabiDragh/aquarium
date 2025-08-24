
//Aquarium 'main' page to render all components

"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Html } from "@react-three/drei";

const Aquarium = dynamic(() => import ("../../components/Aquarium"), {ssr: false})

export default function Page() {
  return (
    <Suspense fallback={<Loader />}>
      <Aquarium />
    </Suspense>
  )
}

function Loader() {
  return (
    <Html center>
      <div className="text-white font-semibold text-xl animate-pulse">
        Loading aquarium...
      </div>
    </Html>
  )
}