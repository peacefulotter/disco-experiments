# Setup

Feel free to have a look at `./src/config.ts` which is a file shared between the browser and the node versions. It is the main config file where you can change lots of parameters regarding the model, the training itself, and more.

# Installation

```sh
$ git clone
$ cd disco-experiments/
$ npm install -g typescript ts-node
$ npm install
```

Then install wikitext using: `./install-wikitext.sh`

### tfjs-browser

##### For running training on the browser

```sh
$ cd ./src/gpt-tfjs-browser/
$ npm install
$ npm run dev
# The following is optional and are destined to people who have chrome
$ google-chrome --enable-unsafe-webgpu --enable-features=Vulkan,UseSkiaRenderer # Run chrome with WebGPU enabled
```

Go to `localhost:3000` on a browser supporting webgpu (not firefox as of writing this to the best of my knowledge).
**Important**: Check if your browser supports webgpu: go to `chrome://gpu` and there should be a flag under "Graphics Feature Status" called "WebGPU". Make sure it is **not** set to Disabled

### tfjs-node

##### For running training in a NodeJs environment

```sh
$ cd ./src/gpt-tfjs-node/
$ npm install
$ ts-node-esm train-gpu.ts # for training on the 'tensorflow' backend, using a GPU
$ ts-node-esm train-cpu.ts # for training on the 'cpu' backend, using the CPU
```

# Results
