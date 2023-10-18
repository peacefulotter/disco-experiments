import { writeFile }  from 'fs/promises';
import * as tf from "@tensorflow/tfjs-node"; 
import { model }  from 'gpt-tfjs'
import { createDataset } from './sort.js';
import getDataset from './dataset.js';
import { BenchmarkSample, Dataset, DatasetConfig, Benchmark, configs } from './types.js';
const { GPTLMHeadModel } = model


const callback = (samples: BenchmarkSample[], model: any, start: number) => (_: any, loss: number, iter: number) => {
	if (iter >= samples.length)
		samples.push({ iter: iter - 1, loss: {}, time: {}, mem: {} })
	samples[iter - 1].loss[model] = loss
	samples[iter - 1].time[model] = Date.now() - start
	samples[iter - 1].mem[model] = tf.memory().numBytes
}

async function runModels(dataset: Dataset, defaultConfig: Record<string, any>) {
	const benchmark: Benchmark = {
		samples: [],
		performance: {}
	}
	const date = new Date().toISOString()

	for (const modelType of configs) 
	{
		console.log('Running', modelType);
		
		const config = { ...defaultConfig, modelType }
		const gpt = GPTLMHeadModel(config)
		
		const start = Date.now()
		const cb = callback(benchmark.samples, modelType, start)
		await gpt.train(dataset, {epochs: 15, verbose: true, callbacks: [cb]})
		const end = Date.now()
		const performance = (end - start)/ dataset.size
		benchmark.performance[modelType] = performance

		const path = 'models/' + date + '-' + modelType
		await gpt.save(path)
	}

	await writeFile(`./benchmarks/benchmark-${date}.json`, JSON.stringify(benchmark, null, 2), 'utf8');
}


const { dataset, defaultConfig: config } = createDataset() as any;
// const config: DatasetConfig & Record<string, any> = { 
// 	vocabSize: 1024, 
// 	blockSize: 16, 
// 	batchSize: 1 
// }
// const dataset = await getDataset('openwebtext', config)
await runModels(dataset, config)