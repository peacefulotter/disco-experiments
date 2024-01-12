import * as tf from '@tensorflow/tfjs'
import { model, train } from '#/gpt-tfjs'
import { BrowserBackendName } from '~/tfjs-types'
import setBackend from '~/backend'
import getConfig from './config'
const { GPTLMHeadModel } = model

function l2Loss(tensor: tf.Tensor) {
    // https://www.tensorflow.org/api_docs/python/tf/nn/l2_loss
    return tf.div(tf.sum(tf.square(tensor)), 2)
}

function globalNorm(tensors: tf.Tensor[]) {
    // https://github.com/tensorflow/tensorflow/blob/c256c071bb26e1e13b4666d1b3e229e110bc914a/tensorflow/python/ops/clip_ops.py#L242
    var halfSquaredNorms: tf.Tensor<tf.Rank>[] = []
    tensors.forEach((tensor, ti) => {
        halfSquaredNorms.push(l2Loss(tensor))
    })
    var halfSquaredNorm = tf.sum(tf.stack(halfSquaredNorms))
    var norm = tf.sqrt(
        tf.mul(halfSquaredNorm, tf.scalar(2.0, halfSquaredNorm.dtype))
    )
    return norm
}

function clipByGlobalNorm(
    tensors: tf.Tensor<tf.Rank>[],
    clipNorm: number
): tf.Tensor[] {
    // https://github.com/kamalkraj/minGPT-TF/blob/master/mingpt/optimization.py
    // https://github.com/tensorflow/tensorflow/blob/v2.7.0/tensorflow/python/ops/clip_ops.py#L291-L382
    /*
    To perform the clipping, the values t_list[i] are set to:
        t_list[i] * clip_norm / max(global_norm, clip_norm)
    where:
        global_norm = sqrt(sum([l2norm(t)**2 for t in t_list]))
    */
    var useNorm = globalNorm(tensors)
    var scale = tf.mul(
        clipNorm,
        tf.minimum(
            tf.div(tf.scalar(1.0), useNorm),
            tf.div(tf.scalar(1.0, useNorm.dtype), clipNorm)
        )
    )
    return tensors.map((tensor) => tf.clone(tf.mul(tensor, scale)))
}

function clipByGlobalNormObj(tensorsObj: tf.NamedTensorMap, clipNorm: number) {
    const varNames = Object.keys(tensorsObj)
    const tensorsArr = varNames.map((n) => tensorsObj[n])
    const tensorsArrClipped = clipByGlobalNorm(tensorsArr, clipNorm)
    const tensorsObjClipped: tf.NamedTensorMap = {}
    tensorsArrClipped.forEach((t, ti) => {
        tensorsObjClipped[varNames[ti] as any] = t
    })
    return tensorsObjClipped
}

const ownTest = async () => {
    const inputs = tf.input({ shape: [2, 3] })
    const layer = tf.layers
        .dense({
            name: 'layer',
            units: 2,
        })
        .apply(inputs) as tf.SymbolicTensor
    const model = tf.model({ inputs: inputs, outputs: layer })

    const opt = tf.train.adam(0.001)

    const { x, y } = {
        x: tf.ones([2, 3]),
        y: tf.ones([2, 2]),
    }

    // Keep loss for reporting
    let loss: tf.Tensor | null = null
    const optFunc = () => {
        const logits = model.apply(x) as tf.Tensor
        loss = tf.keep(tf.losses.softmaxCrossEntropy(y, logits))
        return loss as tf.Scalar
    }
    tf.tidy(() => {
        let { grads } = opt.computeGradients(optFunc)
        let gradsClipped = clipByGlobalNormObj(grads, 1)
        opt.applyGradients(gradsClipped as any)
    })

    console.log('here')
    if (loss !== null) {
        let lossVal = await (loss as tf.Tensor).array()
        console.log(lossVal)
        ;(loss as tf.Tensor).dispose()
    }

    x.dispose()
    y.dispose()
}

export default async function trainTest(backendName: BrowserBackendName) {
    await setBackend(tf, backendName)

    const baseConfig = await getConfig()
    const config = {
        ...baseConfig,
        batchSize: 2,
        blockSize: 5,
        vocabSize: 3,
        modelType: 'gpt-nano',
    } as const

    async function* generator() {
        while (true) {
            console.log('in dataset')
            yield {
                x: [1, 2],
                y: [3, 4],
            }
        }
    }

    const dataset = tf.data.generator(generator as any).map((v: any) => ({
        x: tf.tensor1d(v.x, 'int32'),
        y: tf.oneHot(v.y, config.vocabSize),
    }))

    const gpt = new GPTLMHeadModel(config)
    await train(gpt, dataset, config)
}
