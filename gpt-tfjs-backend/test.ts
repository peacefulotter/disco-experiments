import tf from "@tensorflow/tfjs-node"; 

const x = tf.tensor([1, 2, 3, 4]);
console.log(x.shape);
console.log(await x.array());

console.log(
	await x.pad([[2, 0]])
);