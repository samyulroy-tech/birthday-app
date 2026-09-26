"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { ParticleField } from "./particles";

const FxContext =
  createContext<ParticleField | null>(null);

export function FxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const [field, setField] =
    useState<ParticleField | null>(null);

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) {
      console.warn(
        "[FxProvider] Canvas not found"
      );

      return;
    }

    console.log(
      "[FxProvider] Creating ParticleField"
    );

    const fieldInstance =
      new ParticleField(canvas);

    setField(fieldInstance);

    const handleResize = () => {
      fieldInstance.resize();
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    fieldInstance.resize();

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      fieldInstance.destroy();

      setField(null);

      console.log(
        "[FxProvider] ParticleField destroyed"
      );
    };
  }, []);

  return (
    <FxContext.Provider
      value={field}
    >
      {/* =====================================================
          PARTICLE CANVAS
          IMPORTANT:
          - Below balloons
          - Never receives pointer events
          ===================================================== */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          z-[5000]
          block
        "
        style={{
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          opacity: 1,
          display: "block",
        }}
      />

      {children}
    </FxContext.Provider>
  );
}

export function useFx() {
  return useContext(FxContext);
}