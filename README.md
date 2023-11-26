# Prerequisites

-   Install bun
    -   visit: https://github.com/oven-sh/bun
-   cuDNN Install
    -   sudo apt install nvidia-cudnn
    -   OR see: https://stackoverflow.com/questions/66977227/could-not-load-dynamic-library-libcudnn-so-8-when-running-tensorflow-on-ubun

# Setup

Feel free to have a look at `./src/shared/config.ts` which is a file shared between the browser and the node versions. It is the main config file where you can change lots of parameters regarding the model, the training itself, and more.
If you are planning to run the python version provided under `./src/gpt-pytorch`, then you will need to convert this typescript file to a python file. This can be done easily here: https://www.codeconvert.ai/typescript-to-python-converter and save it under `./src/shared/config.py` (already provided for the default config.ts)

# Installation

```sh
$ git clone
$ cd disco-experiments/
$ ./install-wikitext.sh # Installs the wikitext-103-raw dataset
$ cd ./src/shared/
$ npm install -g typescript ts-node
$ npm install
$ bun preprocess.ts # Tokenizes the wikitext dataset
```

### tfjs-browser

##### For running training in the browser

```sh
$ cd ./src/gpt-tfjs-browser/
$ npm install
$ npm run dev
# The following is optional and are destined to people who have chrome
$ google-chrome --enable-unsafe-webgpu --enable-features=Vulkan,UseSkiaRenderer # Run chrome with WebGPU enabled
# Or from the project root directory
$ ./chrome-webgpu.sh & # same command as above + run in detach mode
```

1. **Important**: Check if your browser supports webgpu, firefox does not as of writing this and to the best of my knowledge. Go to `chrome://gpu` and there should be a flag under "Graphics Feature Status" called "WebGPU". Make sure it is set to **Enabled** or **Hardware Accelerated**.
2. Navigate to `localhost:3000` on your browser.
3. Click on the "Train webgl" or "Train webgpu" button and check the console

### tfjs-node

##### For running training in a NodeJs environment

```sh
$ cd ./src/gpt-tfjs-node/
$ npm install
$ bun train-gpu.ts # for training on the 'tensorflow' backend, using a GPU
$ bun train-cpu.ts # for training on the 'cpu' backend, using the CPU
```

## WandB

The pytorch tests do work with wandb, but since the @wandb/sdk npm package is broken, the training statistics from **both** the browser and node versions need to be exported to wandb manually.

```sh
$ cd ./src/shared/
$ python3 wandb-export.py {platform} {backendname} # platform=browser|node, backendname=webgl|webgpu|cpu|tensorflow
```

# Fix warnings

-   Missing cuda .so files
    -   sudo apt install nvidia-cuda-toolkit
-   To fix "successful NUMA node read from SysFS had negative value (-1)":
    -   for a in /sys/bus/pci/devices/\*; do echo 0 | sudo tee -a $a/numa_node; done
    -   (https://github.com/tensorflow/tensorflow/issues/42738)
    -

# Results
