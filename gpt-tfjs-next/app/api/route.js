// @ts-nocheck
// const { createDataset } = require('./sort')
const { GPTLMHeadModel } = require('gpt-tfjs').model

const configs = ['gpt-nano', 'gpt-micro', 'gpt-mini', 'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl']
const defaultConfig = {
  vocabSize: 3,
  blockSize: 11,
  dropout: 0.1
}

// const trainDataset = createDataset();

const callback = (losses, model) => (_, lossVal, iteration) => {
  losses.push({key: model, value: [iteration, lossVal * 10]})
}

export async function GET(request) {
  console.log(request);
  const losses = []
  // for (let i = 0; i < 3; i++) {
  //   const modelType = configs[i]
  //   console.log('Running', modelType);
  //   const config = { ...defaultConfig, modelType }
  //   // const start = performance.now()
  //   const gpt = GPTLMHeadModel(config)
  //   const cb = callback(losses, modelType)
  //   await gpt.train(trainDataset, {epochs: 2, verbose: false, callbacks: [cb]})
  //   // const time = performance.now() - start
  // }
 
  return Response.json(losses)
}