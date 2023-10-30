import * as tf from "@tensorflow/tfjs-node-gpu";
import main from "./train.js";

tf.setBackend("tensorflow");
await main(tf, "gpu", "wikitext-103/train", "gpt-nano");
