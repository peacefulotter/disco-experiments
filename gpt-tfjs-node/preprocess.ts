import fs from "fs";
import path from "path";
import * as tf from "@tensorflow/tfjs-node";
import { readdir } from "fs/promises";
import { encode } from "gpt-tokenizer/model/text-davinci-003";
import { Dataset, DatasetConfig } from "./types.js";

// For ts-node-esm
import { fileURLToPath } from "url";
import { config } from "./config.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

function createPreprocessDataset(
  tf: any,
  getStreams: () => fs.ReadStream[],
  config: DatasetConfig
) {
  const { blockSize, vocabSize, verbose } = config;
  async function* dataGenerator() {
    const streams = getStreams();
    if (verbose) console.log("Starting data generator");
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        const tokens = encode(text);

        if (blockSize >= tokens.length) {
          const x = tokens.slice(0, blockSize);
          x.push(...new Array(blockSize - x.length + 1).fill(vocabSize - 1));
          yield x;
          await sleep(1);
          continue;
        }

        for (let i = 0; i < tokens.length - blockSize - 1; i += blockSize) {
          const x = tokens.slice(i, i + blockSize + 1);
          yield x;
          await sleep(1);
        }
      }
    }
  }

  return tf.data
    .generator(dataGenerator as any)
    .map((x: number[]) =>
      tf.tidy(() => tf.cast(x, "int32"))
    ) as tf.data.Dataset<tf.Tensor<tf.Rank>>;
}

async function getFileStreams(dir: string, config: DatasetConfig) {
  const dirPath = path.join(__dirname, "datasets/", dir);
  const files = await readdir(dirPath);
  console.log("Found", files.length, "files in dataset");
  const getStreams = () =>
    files.map((file) =>
      fs.createReadStream(path.join(dirPath, file), {
        encoding: "utf8",
        highWaterMark: config.blockSize,
      })
    );
  return getStreams;
}


const dataset_name = "wikitext-103"
const split = 'val'
const output_dir = path.join(__dirname, "datasets", dataset_name, "preprocessed", split);
console.log('Preprocessing step will write to:', output_dir);


const getStreams = await getFileStreams(path.join(dataset_name, split), config);
const dataset = createPreprocessDataset(tf, getStreams, config);

const maxLength = 4096;
let buffer = tf.buffer([maxLength, config.blockSize + 1], "int32"); //  tf.zeros([maxLength, config.blockSize + 1], "int32");

// Create preprocessed directory if it does not exist
if (!fs.existsSync(output_dir)){
    fs.mkdirSync(output_dir, { recursive: true });
}

const write = async (buffer: tf.TensorBuffer<tf.Rank, "int32">, file_idx: number, size: number) => {
  const arr = buffer.toTensor().arraySync() as number[][]
  const data = arr.slice(0, size)
  console.log(data.length);
  
  const res = await fs.promises.writeFile(
    path.join(output_dir, `data-${file_idx}.pt`),
    JSON.stringify(data)
  );
  console.log("done", file_idx, res, tf.memory());
};

let size = 0
let file_idx = 0
const iter = await dataset.iterator();
while (true) {
  const { value: v } = await iter.next();

  if (v !== null) {
    const data = v.dataSync();
    for (let i = 0; i < data.length; i++) {
      buffer.set(data[i], size, i);
    } 
  }

  size++;

  if (v == null || size >= maxLength) {
    await write(buffer, file_idx, size);
    file_idx++;
    size = 0;
  }

  if (v !== null)
    v.dispose();
  else
    break
}
