import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import main from "./train";

export default async function trainGPU() {
  tf.setBackend("webgl");
  console.log("Backend set to:", tf.getBackend());
  await main("browser_gpu");
}
