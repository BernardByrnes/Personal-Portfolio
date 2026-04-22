'use client'

import { Spotlight } from "@/components/ui/spotlight"
import { SplineScene } from "@/components/ui/splite"

export default function RobotCard() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", borderRadius: "0.75rem", background: "rgba(0,0,0,0.96)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <Spotlight className="-top-40 left-0 md:-top-20" fill="white" />
      {/* Render the scene larger than the box and shift up so the robot centres */}
      <div style={{ position: "absolute", inset: 0, top: "-30%", height: "160%", transform: "scale(0.8)", transformOrigin: "center top" }}>
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </div>
  )
}
