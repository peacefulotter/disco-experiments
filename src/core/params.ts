import * as gpt from '#/gpt-tfjs'

export const getModelParams = (modelType: gpt.ModelType) => {
    const model = gpt.GPT({ modelType })
    return model.getWeights().reduce((a: number, b) => a + b.size, 0)
}
