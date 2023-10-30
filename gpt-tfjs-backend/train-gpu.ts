import * as tf from "@tensorflow/tfjs-node-gpu";
import main from "./train.js";

tf.setBackend("tensorflow");
await main(tf, "gpu");
