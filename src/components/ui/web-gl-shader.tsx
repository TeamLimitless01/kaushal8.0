"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animationId: number | null = null
    let renderer: THREE.WebGLRenderer | null = null
    let scene: THREE.Scene | null = null
    let camera: THREE.OrthographicCamera | null = null
    let mesh: THREE.Mesh | null = null
    let geometry: THREE.BufferGeometry | null = null
    let material: THREE.RawShaderMaterial | null = null

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        float d = length(p) * distortion;
        
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        // Vivid animated emerald wave frequencies
        float r = 0.035 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.110 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.055 / abs(p.y + sin((bx + time) * xScale) * yScale);

        // Ambient deep green emerald backdrop base
        vec3 bg = vec3(0.012, 0.075, 0.048);
        vec3 wave = vec3(r, g, b);
        
        gl_FragColor = vec4(bg + wave, 1.0);
      }
    `

    try {
      scene = new THREE.Scene()
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
      })

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      renderer.setPixelRatio(dpr)
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      renderer.setClearColor(new THREE.Color(0x02150e), 1.0)

      const uniforms = {
        resolution: { value: [window.innerWidth * dpr, window.innerHeight * dpr] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.45 },
        distortion: { value: 0.05 },
      }

      const position = [
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, 1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        side: THREE.DoubleSide,
      })

      mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const handleResize = () => {
        if (!renderer || !canvas) return
        const width = window.innerWidth
        const height = window.innerHeight
        const currentDpr = Math.min(window.devicePixelRatio || 1, 2)
        renderer.setPixelRatio(currentDpr)
        renderer.setSize(width, height, false)
        uniforms.resolution.value = [width * currentDpr, height * currentDpr]
      }

      handleResize()
      window.addEventListener("resize", handleResize)

      const animate = () => {
        uniforms.time.value += 0.012
        if (renderer && scene && camera) {
          renderer.render(scene, camera)
        }
        animationId = requestAnimationFrame(animate)
      }

      animate()

      return () => {
        if (animationId !== null) cancelAnimationFrame(animationId)
        window.removeEventListener("resize", handleResize)
        if (mesh && scene) {
          scene.remove(mesh)
        }
        geometry?.dispose()
        material?.dispose()
        renderer?.dispose()
      }
    } catch (err) {
      console.error("WebGLShader initialization failed:", err)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full block pointer-events-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        background: "radial-gradient(circle at 50% 30%, #032b1d 0%, #01130d 70%, #000a06 100%)",
      }}
    />
  )
}
