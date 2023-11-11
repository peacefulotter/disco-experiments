import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgpu';
import '@tensorflow/tfjs-backend-webgl';
import main from "./train";

export default async function trainGPU(backend: string) {
  tf.setBackend(backend);
  const tfBackend = tf.getBackend()
  console.log("Backend set to:", tfBackend);
  if (tfBackend === undefined) {
    console.error('backend is undefined')
    return
  }
  // await main("browser_" + backend);
  await main("cluster_webgpu")
}
