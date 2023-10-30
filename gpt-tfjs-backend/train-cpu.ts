import * as tf from "@tensorflow/tfjs-node";
import main from "./train.js";

await main(tf, "wikitext-103/train", "gpt-nano");
