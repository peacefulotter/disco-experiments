import tf from "@tensorflow/tfjs-node"; 

const x = tf.tensor([1, 2, 3, 4]);
console.log(x.shape);

x.pad([[2, 0]]).print();