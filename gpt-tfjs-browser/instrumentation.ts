'use client'

import trainGPU from "./ml/train-gpu";

export function register() {
  console.log("here", process.browser, typeof window);
  trainGPU('webgpu')
}
