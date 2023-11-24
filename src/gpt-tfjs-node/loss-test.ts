import * as tf from '@tensorflow/tfjs-node'

// const sigEntropy = tf.losses.sigmoidCrossEntropy(x, y)
// const sofEntropy = tf.losses.softmaxCrossEntropy(x, y) //  undefined, undefined, tf.argMax
// console.log(sigEntropy);
// console.log(sofEntropy);

let _epsilon: number

/**
 * Returns the value of the fuzz factor used in numeric expressions.
 */
export function epsilon() {
    if (_epsilon == null) {
        _epsilon = tf.backend().epsilon()
    }
    return _epsilon
}

type ArrayTypes = Uint8Array | Int32Array | Float32Array
function arrayProd(
    array: number[] | ArrayTypes,
    begin?: number,
    end?: number
): number {
    if (begin == null) {
        begin = 0
    }
    if (end == null) {
        end = array.length
    }

    let prod = 1
    for (let i = begin; i < end; ++i) {
        prod *= array[i]
    }
    return prod
}

function flatten(x: tf.Tensor): tf.Tensor {
    const newShape = [arrayProd(x.shape)]
    return x.reshape(newShape)
}

// https://github.com/tensorflow/tfjs-layers/blob/0c6b1cae38a9677d3db464b2743f02185d713ba6/tfjs-layers/src/losses.ts
export function categoricalCrossentropy(
    target: tf.Tensor,
    output: tf.Tensor,
    fromLogits = false
): tf.Tensor {
    return tf.tidy(() => {
        if (fromLogits) {
            output = tf.softmax(output)
        } else {
            // scale preds so that the class probabilities of each sample sum to 1.
            const outputSum = tf.sum(output, output.shape.length - 1, true)
            output = tf.div(output, outputSum)
        }
        output = tf.clipByValue(output, epsilon(), 1 - epsilon())
        return tf.neg(
            tf.sum(
                tf.mul(target.toFloat(), tf.log(output)),
                output.shape.length - 1
            )
        )
    })
}

export function sparseCategoricalCrossentropy(
    target: tf.Tensor,
    output: tf.Tensor
): tf.Tensor {
    return tf.tidy(() => {
        const flatTarget = tf.floor(flatten(target)).toInt() as tf.Tensor1D
        output = tf.clipByValue(output, epsilon(), 1 - epsilon())
        const outputShape = output.shape
        const oneHotTarget = tf
            .oneHot(flatTarget, outputShape[outputShape.length - 1])
            .reshape(outputShape)
        const fromLogits = false
        return categoricalCrossentropy(oneHotTarget, output, fromLogits)
    })
}

async function main() {
    const x = tf.tensor([
        [0.3, 0.4, 0.5, 0.2],
        [0.3, 0.8, 0.5, 0.2],
        [0.3, 0.4, 0.5, 1],
    ])
    const x_soft = tf.argMax(tf.softmax(x), 1)
    console.log(await x_soft.array())

    const y = tf.tensor([3, 1, 1])

    const a = tf.tensor2d(
        [
            [0.1, 0.2, 0.7],
            [0.2, 0.3, 0.5],
            [0.3, 0.2, 0.5],
        ],
        [3, 3]
    )
    console.log(await a.data(), await tf.softmax(a).data())

    const target = tf.tensor1d([0, 1, 2])
    const result = sparseCategoricalCrossentropy(target, tf.softmax(a))
    console.log(await result.mean().data(), await result.data())
}
main()
