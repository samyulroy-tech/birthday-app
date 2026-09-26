import { create } from "zustand";
import { PublicConfig, Scene } from "./types";

interface ExperienceState {
  scene: Scene;
  config: PublicConfig | null;
  unlocked: boolean;
  balloonsPopped: number;
  memoryIndex: number;
  setScene: (s: Scene) => void;
  setConfig: (c: PublicConfig) => void;
  unlock: () => void;
  popBalloon: () => void;
  setMemoryIndex: (i: number) => void;
  reset: () => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  scene: "lock",
  config: null,
  unlocked: false,
  balloonsPopped: 0,
  memoryIndex: 0,
  setScene: (s) => set({ scene: s }),
  setConfig: (c) => set({ config: c }),
  unlock: () => set({ unlocked: true }),
  popBalloon: () => set((state) => ({ balloonsPopped: state.balloonsPopped + 1 })),
  setMemoryIndex: (i) => set({ memoryIndex: i }),
  reset: () => set({ scene: "lock", unlocked: false, balloonsPopped: 0, memoryIndex: 0 }),
}));
