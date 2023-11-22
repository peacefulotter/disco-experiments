import * as tf from "@tensorflow/tfjs-node-gpu";
import "@tensorflow/tfjs-backend-webgl";
import main from "./train.js";

console.log(tf.engine().backendNames());
await tf.setBackend("tensorflow");
console.log(tf.getBackend());
await main(tf, "gpu");
