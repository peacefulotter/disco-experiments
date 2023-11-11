import { EncodedDataset } from "./types.js"



export default async function evaluate(tf: any, model: any, eval_dataset: EncodedDataset) 
{
  const iter = await eval_dataset.iterator()
  let losses = []
  // let accs = []
  while (true) {
    let next = await iter.next()
    if (next == null)
      break
    const {x, y} = next.value
    const logits = model.apply(x)
    const loss = tf.losses.softmaxCrossEntropy(y, logits)
    const lossVal = await loss.array()
    losses.push(lossVal)
    // accs.push( logits) 
  }
  const loss = tf.tensor(losses).mean()
  const pp = 2.71828 ** loss
  return {  
    "val/loss": loss,
    "val/perplexity": pp,
    // "val/acc": val_acc,
  }
}