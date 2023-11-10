import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";
import main from "./train";

export default async function trainGPU(backend: string) {
  tf.setBackend(backend);
  console.log("Backend set to:", tf.getBackend());
  await main("browser_" + backend);
}
