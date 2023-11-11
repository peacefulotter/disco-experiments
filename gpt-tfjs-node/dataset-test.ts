import * as tf from "@tensorflow/tfjs-node";
import { getPreprocessedDataset } from "./dataset.js";
import { config, datasetDir } from "./config.js";


// const ds = await getDataset(tf, "wikitext-103/train", config);
// console.log(ds);
// const iter = await ds.iterator();
// const next = await iter.next();
// console.log(next);

// const ds_encoded = await getEncodedDataset(tf, "wikitext-103/train", config);
// console.log(ds_encoded);
// const iter_encoded = await ds_encoded.iterator();
// const next_encoded = await iter_encoded.next();
// console.log("next_encoded", next_encoded);
let dataset = await getPreprocessedDataset(tf, datasetDir, 'val', config);
dataset = dataset.batch(4)

const iter = await dataset.iterator()
let i = 0;
while (i++ < 3) {
  const { value } = await iter.next();
  const { x, y } = value
  console.log(i, x, y);
  tf.dispose([x, y]);
}
console.log("after");
