import { ModelType } from '#/gpt-tfjs'
import { getModelParams } from '~/params'

if (process.argv.length < 3) {
    console.error('Usage: bun get-params.ts {model}')
    process.exit(1)
}

const model = process.argv[2] as ModelType
const params = getModelParams(model)
console.log(`Model: ${model} has ${params} parameters`)
