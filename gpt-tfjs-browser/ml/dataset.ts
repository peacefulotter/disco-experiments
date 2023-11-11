import * as tf from "@tensorflow/tfjs";
import { decode, encode } from "gpt-tokenizer/esm/model/text-davinci-003";
import { model } from "gpt-tfjs";
import { Dataset, DatasetConfig, EncodedDataset } from "./types.js";
import { generate } from "gpt-tfjs/src/model.js";

const { GPTLMHeadModel } = model;

type TokenizedGenerator = () => AsyncGenerator<
  {
    x: number[];
    y: number[];
  },
  void,
  unknown
>;

async function sleep(t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, t);
  });
}

export async function getDataset(config: DatasetConfig) {
  const getStreams = await getFileStreams(config);
  async function* dataGenerator() {
    const streams = getStreams();
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        yield { text };
        await sleep(1);
      }
    }
  }
  return tf.data.generator(dataGenerator as any) as Dataset;
}

const tokenizedGenerator = (
  generator: TokenizedGenerator,
  vocabSize: number
) => {
  return tf.data.generator(generator as any).map((v: any) => ({
    // v: { x: number[]; y: number[] }
    x: tf.tensor1d(v.x, "int32"),
    y: tf.oneHot(v.y, vocabSize),
  })) as EncodedDataset;
};

export async function getPreprocessedDataset(config: DatasetConfig) {
  const { vocabSize } = config;
  const filesContentGetter = await getFilesContent(config);

  const generator: TokenizedGenerator = async function* () {
    const files = filesContentGetter();
    for await (const tensors of files) {
      for (const tokens of tensors) {
        const x = tokens.slice(0, -1);
        const y = tokens.slice(1);
        yield { x, y };
        await sleep(1);
      }
    }
  };
  return tokenizedGenerator(generator, vocabSize);
}

export async function getEncodedDataset(config: DatasetConfig) {
  const { blockSize, vocabSize, verbose } = config;
  const getStreams = await getFileStreams(config);

  const generator: TokenizedGenerator = async function* () {
    const streams = getStreams();
    if (verbose) console.log("Starting data generator");
    for await (const stream of streams) {
      for await (const chunk of stream) {
        const text = chunk.toString();
        const tokens = encode(text);
        if (verbose)
          console.log(
            `Stream chunk: ${text.slice(0, 40)}... (${tokens.length} tokens)`
          );

        if (blockSize >= tokens.length) {
          const x = tokens.slice(0, blockSize);
          const y = tokens.slice(1, blockSize + 1);
          x.push(...new Array(blockSize - x.length).fill(vocabSize - 1));
          y.push(...new Array(blockSize - y.length).fill(vocabSize - 1));
          yield { x, y };
        }

        for (let i = 0; i < tokens.length - blockSize - 1; i += blockSize) {
          const x = tokens.slice(i, i + blockSize);
          const y = tokens.slice(i + 1, i + blockSize + 1);
          yield { x, y };
          await sleep(1);
        }

        await sleep(1);
      }
    }
  };
  return tokenizedGenerator(generator, vocabSize);
}

async function getFileStreams(config: DatasetConfig) {
  const { files } = config;
  const getStreams = () =>
    files.map(
      (file) => ""
      // TODO
      // fs.createReadStream(path.join(dir, file), {
      //   encoding: "utf8",
      //   highWaterMark: config.blockSize,
      // })
    );
  return getStreams;
}

async function getFilesContent(config: DatasetConfig) {
  const { dir, files } = config;
  let n = 0;
  return async function*() {
      const file = files[n]
      console.log('Reading dataset file', file, 'at', n);
      const res = await fetch("/api/dataset/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dir, file }),
      });
      const { content } = await res.json();
      n++;
      yield content as number[][];
    }
}

export async function inference(model: typeof GPTLMHeadModel, text: string) {
  const tokens = encode(text);
  const outputs = await generate(
    model,
    tokens,
    { maxLength: 32, temperature: 1, doSample: false },
    async (g: any) => {
      // const idx = g.idxNext;
      // const t = decode(idx[0]);
      console.log(` time: ${g.timePerToken}`);
      await new Promise((r) => setTimeout(r, 1));
    }
  );
  return decode(outputs[0]);
}
