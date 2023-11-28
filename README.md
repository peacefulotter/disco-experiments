# File Structure

```sh
.
├── datasets # Folder containing the installed and preprocessed datasets
├── src
│   ├── browser # JS browser version
│   │   ├── client # NextJS client for training in the browser
│   │   │   ├── app # NextJS app router folder, defining pages and api routes
│   │   │   └── ml  # Folder containing the ML related scripts and tests
│   │   └── server # Express server for serving the client
│   │       ├── server.ts # Main file creating the express server listening to some given port
│   │       └── socket.ts # WebSocket server for streaming the preprocessed dataset to the client
│   ├── gpt-tfjs # Clone of the gpt-tfjs npm package, with some minor modifications
│   ├── node # NodeJS version
│   │   ├── train-cpu.ts # Training script for the 'cpu' backend
│   │   ├── train-gpu.ts # Training script for the 'tensorflow' backend
│   │   └── train.ts # Generic training script calling the training function from shared/train.ts
│   ├── pytorch # Pytorch version
│   │   ├── llm-baselines # Clone of the llm-baselines repo, with some minor modifications, mainly to use the config.py file
│   │   │   └── run.sh # Starts training with the config provided in src/shared/config.py
│   │   └── minGPT # Clone of the minGPT repo, with some minor modifications, mainly to use the config.py file
|   |   |   └── run.sh # Starts training with the config provided in src/shared/config.py
│   └── shared # Shared folder containing the shared scripts between the browser and node versions
│       ├── config.py # Python version of config.ts
│       ├── config.ts # Main config file for the model, training, and more
│       ├── dataset-node.ts # Dataset implementation for Node, using the filesystem to stream read the dataset
│       ├── dataset.ts # Dataset implementation for the browser, transforming token arrays into a tf.data.Dataset
│       ├── evaluate.ts # Evaluation function for the model
│       ├── inference.ts # Inference function for the model
│       ├── preprocess.ts # Preprocessing script for the wikitext dataset (other datasets can be added)
│       ├── train.ts # Training function for the model, logging stats every iteration and saving them to WandB
│       ├── wandb-export.py # Script for exporting the training stats to WandB (since the npm package is broken)
│       ├── wandb-node.ts # WandbNode class inheriting from WandB, for writing the saved stats to a file
│       └── wandb.ts # WandB class defining the interface for saving the training stats (init, log, finish)
├── chrome-webgpu.sh # Starts chrome with webgpu enabled
└── install-wikitext.sh # Installs the wikitext-103-raw dataset under ./datasets/
```

# Prerequisites

-   Install bun
    -   visit: https://github.com/oven-sh/bun
-   cuDNN Install
    -   sudo apt install nvidia-cudnn
    -   OR see: https://stackoverflow.com/questions/66977227/could-not-load-dynamic-library-libcudnn-so-8-when-running-tensorflow-on-ubun

# Setup

Feel free to have a look at `./src/shared/config.ts` which is a file shared between the browser and node versions. It is the main config file where you can change lots of parameters regarding the model, the training, and more.
If you are planning to run the python version provided under `./src/gpt-pytorch`, then you will need to convert this typescript file to a python file. This can be done easily here: https://www.codeconvert.ai/typescript-to-python-converter, save it under `./src/shared/config.py` (already provided for the default config.ts)

# Installation & Setup

```sh
$ git clone
$ cd disco-experiments/
$ ./install-wikitext.sh # Installs the wikitext-103-raw dataset
$ cd ./src/shared/
$ bun install -g typescript ts-node
$ bun install
$ bun preprocess.ts # Tokenizes the wikitext dataset as a preprocessing step
```

### Running on the browser

Start the client:

```sh
$ cd ./src/browser/client/
$ bun install
$ bun run dev
# The following is optional and are destined to people who have chrome
$ google-chrome --enable-unsafe-webgpu --enable-features=Vulkan,UseSkiaRenderer # Run chrome with WebGPU enabled
# Or from the project root directory
$ ./chrome-webgpu.sh & # same command as above + run in detach mode
```

And now for the server:

```sh
$ cd ./src/browser/server/
$ bun install
$ bun run dev
```

1. **Important**: Check if your browser supports webgpu, firefox does not as of writing this and to the best of my knowledge. Go to `chrome://gpu` and there should be a flag under "Graphics Feature Status" called "WebGPU". Make sure it is set to **Enabled** or **Hardware Accelerated**.
2. Navigate to `localhost:3000` on your browser.
3. Click on the "Train webgl" or "Train webgpu" button and check the console for logs.

### Running on Node

```sh
$ cd ./src/node/
$ bun install
$ bun train-gpu.ts # for training on the 'tensorflow' backend, using a GPU
$ bun train-cpu.ts # for training on the 'cpu' backend, using the CPU
```

## WandB

The pytorch tests work with wandb, but since the @wandb/sdk npm package is broken, the training statistics from **both** the browser and node versions need to be exported to wandb manually. A script has been made for this:

```sh
$ cd ./src/shared/
$ python3 wandb-export.py {platform} {backendname} # platform=browser|node, backendname=webgl|webgpu|cpu|tensorflow
```

# Fix errors & warnings

### Errors

-   "The Node.js native addon module (tfjs_binding.node) can not be found at path: /home/user/..."
    -   First move to the **appropriate directory**, look at the error message and check the directory where the error is thrown, it might come from the `shared` dir as well.
    -   Move to the directory mentioned in the error message
    -   `$ npm rebuild @tensorflow/tfjs-node --build-addon-from-source`
    -   `$ npm rebuild @tensorflow/tfjs-node-gpu --build-addon-from-source`

### Warnings

-   Missing cuda .so files
    -   sudo apt install nvidia-cuda-toolkit
-   To fix "successful NUMA node read from SysFS had negative value (-1)":
    -   for a in /sys/bus/pci/devices/\*; do echo 0 | sudo tee -a $a/numa_node; done
    -   (https://github.com/tensorflow/tensorflow/issues/42738)
    -

# Results
