import * as tf from "@tensorflow/tfjs-node-gpu";
import "@tensorflow/tfjs-backend-webgl";
import main from "./train.js";

console.log(tf.getBackend());
// tf.setBackend("tensorflow");
await main(tf, "gpu");