import { optimizers } from '#/gpt-tfjs'

const { AdamW } = optimizers

const config = {
    lr: 42,
    weightDecay: 42,
}
const includeInWeightDecay = ['a', 'b']
const excludeFromWeightDecay = ['c', 'd']

console.log(
    new AdamW(
        config.lr,
        config.weightDecay,
        includeInWeightDecay,
        excludeFromWeightDecay
    )
)
