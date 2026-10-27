import React, { useEffect, useRef } from "react";
const ThreeDBackground = () => {
  const stageRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const isRafRunning = useRef(false);
  const rafId = useRef(null);

  useEffect(() => {
    // 1. Accessibility: Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // 2. Performance: Check if device is touch-primary (coarse pointer)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isTouchDevice || !stageRef.current) {
      return;
    }

    // Smooth Lerp Animation Loop
    const updateParallax = () => {
      if (document.hidden) {
        isRafRunning.current = false;
        return;
      }

      // Linear interpolation with damping factor
      const ease = 0.045;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      const deltaX = Math.abs(targetPos.current.x - currentPos.current.x);
      const deltaY = Math.abs(targetPos.current.y - currentPos.current.y);

      if (stageRef.current) {
        // Perspective tilt: rotateY up to 7deg, rotateX up to 6deg, subtle translation
        const rotY = (currentPos.current.x * 7).toFixed(3);
        const rotX = (-currentPos.current.y * 5.5).toFixed(3);
        const transX = (currentPos.current.x * -16).toFixed(2);
        const transY = (currentPos.current.y * -12).toFixed(2);

        stageRef.current.style.transform = `translate3d(${transX}px, ${transY}px, 0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }

      // Sleep loop if motion has settled to save CPU / battery
      if (deltaX < 0.0005 && deltaY < 0.0005) {
        isRafRunning.current = false;
      } else {
        rafId.current = requestAnimationFrame(updateParallax);
      }
    };

    const handlePointerMove = (e) => {
      // Normalize mouse coordinates to -1.0 .. +1.0
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      targetPos.current.x = Math.max(-1, Math.min(1, normX));
      targetPos.current.y = Math.max(-1, Math.min(1, normY));

      // Wake up RAF loop if idle
      if (!isRafRunning.current) {
        isRafRunning.current = true;
        rafId.current = requestAnimationFrame(updateParallax);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
          isRafRunning.current = false;
        }
      } else {
        if (!isRafRunning.current) {
          isRafRunning.current = true;
          rafId.current = requestAnimationFrame(updateParallax);
        }
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0B0B0D] select-none"
      aria-hidden="true"
    >
      {/* ========================================================= */}
      {/* 1. CINEMATIC BURNT-ORANGE VOLUMETRIC LIGHTING             */}
      {/* ========================================================= */}
      <div className="three-d-lighting-container">
        {/* Top-Right primary burnt-orange atmospheric key light */}
        <div className="three-d-light-tr" />
        {/* Bottom-Left secondary burnt-orange fill light */}
        <div className="three-d-light-bl" />
        {/* Center-depth subtle warm accent light */}
        <div className="three-d-light-center" />
        {/* Cinematic Vignette */}
        <div className="three-d-vignette" />
      </div>

      {/* ========================================================= */}
      {/* 2. 3D PERSPECTIVE VIEWPORT & PARALLAX STAGE               */}
      {/* ========================================================= */}
      <div className="three-d-viewport">
        <div ref={stageRef} className="three-d-stage">

          {/* OBJECT 1: Hero Glossy Obsidian Sphere (Top-Right, Deep Layer) */}
          <div className="three-d-item obj-hero-sphere">
            <div className="sphere-shadow" />
            <div className="sphere-body glossy-sphere-lg">
              <div className="sphere-specular-glint" />
              <div className="sphere-rim-orange" />
            </div>
          </div>

          {/* OBJECT 2: Dual-Axis Metallic Orbital Gyroscope Rings (Top-Right) */}
          <div className="three-d-item obj-orbital-rings">
            <div className="orbital-ring-outer">
              <div className="ring-specular" />
            </div>
            <div className="orbital-ring-inner">
              <div className="ring-specular" />
            </div>
          </div>

          {/* OBJECT 3: 3D Faceted Quantum Crystal Octahedron (Bottom-Left) */}
          <div className="three-d-item obj-crystal-octahedron">
            <div className="octahedron-crystal">
              {/* Upper Pyramid (4 Facets) */}
              <div className="octa-facet facet-top-1" />
              <div className="octa-facet facet-top-2" />
              <div className="octa-facet facet-top-3" />
              <div className="octa-facet facet-top-4" />
              {/* Lower Pyramid (4 Facets) */}
              <div className="octa-facet facet-bot-1" />
              <div className="octa-facet facet-bot-2" />
              <div className="octa-facet facet-bot-3" />
              <div className="octa-facet facet-bot-4" />
            </div>
            <div className="crystal-glow" />
          </div>

          {/* OBJECT 4: Secondary Midground Glossy Obsidian Sphere (Bottom-Right) */}
          <div className="three-d-item obj-mid-sphere">
            <div className="sphere-shadow" />
            <div className="sphere-body glossy-sphere-md">
              <div className="sphere-specular-glint" />
              <div className="sphere-rim-orange" />
            </div>
          </div>

          {/* OBJECT 5: Monolithic Sculptural Prism (Top-Left / Deep Background) */}
          <div className="three-d-item obj-sculptural-monolith">
            <div className="monolith-body">
              <div className="monolith-face-front" />
              <div className="monolith-face-side" />
              <div className="monolith-edge-glow" />
            </div>
          </div>

          {/* OBJECT 6: Metallic Halo Ring (Center-Left / Mid-Depth) */}
          <div className="three-d-item obj-halo-ring">
            <div className="halo-ring-body">
              <div className="halo-glow" />
            </div>
          </div>

          {/* OBJECT 7: Minimalist 3D Micro-Cubes (Depth Accents) */}
          <div className="three-d-item obj-micro-cube cube-pos-1">
            <div className="micro-cube-mesh">
              <div className="cube-face cube-front" />
              <div className="cube-face cube-back" />
              <div className="cube-face cube-right" />
              <div className="cube-face cube-left" />
              <div className="cube-face cube-top" />
              <div className="cube-face cube-bottom" />
            </div>
          </div>

          <div className="three-d-item obj-micro-cube cube-pos-2">
            <div className="micro-cube-mesh micro-cube-sm">
              <div className="cube-face cube-front" />
              <div className="cube-face cube-back" />
              <div className="cube-face cube-right" />
              <div className="cube-face cube-left" />
              <div className="cube-face cube-top" />
              <div className="cube-face cube-bottom" />
            </div>
          </div>

          <div className="three-d-item obj-micro-cube cube-pos-3">
            <div className="micro-cube-mesh micro-cube-xs">
              <div className="cube-face cube-front" />
              <div className="cube-face cube-back" />
              <div className="cube-face cube-right" />
              <div className="cube-face cube-left" />
              <div className="cube-face cube-top" />
              <div className="cube-face cube-bottom" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ThreeDBackground;

