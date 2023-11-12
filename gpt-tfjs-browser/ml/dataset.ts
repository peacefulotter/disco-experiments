import * as tf from '@tensorflow/tfjs'
import { decode, encode } from "gpt-tokenizer/model/text-davinci-003";
import { model } from "gpt-tfjs";
import {
  DatasetConfig,
} from "./types.js";
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

const tokenizedGenerator = (
  generator: TokenizedGenerator,
  vocabSize: number
) => {
  return tf.data
    .generator(generator as any)
    .map((v: any & { x: number[]; y: number[] }) => ({
      x: tf.tensor1d(v.x, "int32"),
      y: tf.oneHot(v.y, vocabSize),
    }))
};

export async function getPreprocessedDataset(
  config: DatasetConfig
) {
  const { dir, vocabSize } = config;
  const filesContentGetter = await getFilesContent(config, dir);

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

async function getFilesContent(config: DatasetConfig, dir: string) {
  const { files } = config;
  let n = 0;
  return async function*() {
      if (n >= files.length)
        n = 0
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
      yield JSON.parse(content) as number[][];
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
