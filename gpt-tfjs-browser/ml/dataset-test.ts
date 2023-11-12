import { getPreprocessedDataset } from "./dataset";
import { getConfig } from "./train";


export default async function datasetTest() {
  const config = await getConfig('val');
  const dataset = await getPreprocessedDataset(config);
  const iter = await dataset.iterator()
  const next = await iter.next()
  console.log(next);
  console.log(next.value);
  console.log(next.value.x.shape);
  console.log(next.value.y.shape);
}