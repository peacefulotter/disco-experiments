import { writeFile }  from 'fs/promises';
import tf from "@tensorflow/tfjs"; 
import { model }  from 'gpt-tfjs'
import { createDataset } from './sort';
import getDataset from './dataset';
const { GPTLMHeadModel } = model

type Datapoint = {
  'gpt-nano': number, 
  'gpt-micro': number, 
  'gpt-mini': number
}

interface Datasample {
  iter: number,
  loss: Partial<Datapoint>,
  time: Partial<Datapoint>,
  mem: Partial<Datapoint>
} 

const configs = ['gpt-nano', 'gpt-micro', 'gpt-mini'] //, 'gpt2', 'gpt2-medium', 'gpt2-large', 'gpt2-xl']

const callback = (stats: Datasample[], model: any, start: number) => (_: any, loss: number, iter: number) => {
	if (iter >= stats.length)
		stats.push({ iter: iter - 1, loss: {}, time: {}, mem: {} })
	stats[iter - 1].loss[model] = loss
	stats[iter - 1].time[model] = Date.now() - start
	stats[iter - 1].mem[model] = tf.memory().numBytes
}

async function runModels<T extends tf.TensorContainer>(dataset: tf.data.Dataset<T>, defaultConfig: any) {
	const stats = []
	const date = new Date().toISOString()

	for (const modelType of configs) 
	{
		console.log('Running', modelType);
		
		const config = { ...defaultConfig, modelType }
		const gpt = GPTLMHeadModel(config)
		
		const cb = callback(stats, modelType, Date.now())
		await gpt.train(dataset, {epochs: 15, verbose: true, callbacks: [cb]})
		
		const path = 'models/' + date + '-' + modelType
		await gpt.save(path)
	}

	await writeFile('losses-3-dummy.json', JSON.stringify(stats, null, 2), 'utf8');
}


// const { dataset, defaultConfig } = createDataset() as any;
const dataset = await getDataset('openwebtext') as any
const defaultConfig = {}
await runModels(dataset, defaultConfig)