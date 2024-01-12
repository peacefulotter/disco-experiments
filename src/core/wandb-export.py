import os
import json
import wandb

import sys

sys.path.append(os.path.abspath("../../core/"))
from config import config

if len(sys.argv) < 5:
    print(
        """
Please provide a platform, backend, gpu name and model type as an argument
e.g. "python wandb-export.py browser webgl nvidia-a100 gpt-nano", 
          
    allowed platforms are: "browser", "node"
    allowed backends are: "cpu", "webgl", "wasm", "webgpu", "tensorflow"
    allowed model types are: "gpt-nano", "gpt-micro", "gpt-mini", "gpt2", "gpt2-medium", "gpt2-large", "gpt2-xl"
    """
    )
    exit()

platform = sys.argv[1]
backend = sys.argv[2]
gpu = sys.argv[3]
model = sys.argv[4]

file_name = f"exp_{platform}_{backend}_{gpu}_{model}.json"
path = os.path.join(os.path.dirname(__file__), "wandb", file_name)
print("Loading file:", path)
with open(path, "r") as f:
    save = json.load(f)

init = save["init"]
init["platform"] = platform
init["backend"] = backend
init["gpu"] = gpu
init["model"] = model
wandb.init(config=init, project=config["wandbProject"], name=file_name)
for log in save["logs"]:
    wandb.log(log)

wandb.finish()
