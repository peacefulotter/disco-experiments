
import os
import json
import wandb

import sys
sys.path.append(os.path.abspath('../..'))
from config import config

if len(sys.argv) < 2:
    print('Please provide the backend name as an argument, e.g. "python wandb-export.py webgpu", allowed backends are: "webgpu", "webgl", "cpu')
    exit()

backend_name = sys.argv[1]

file_name = f'{backend_name}_{config["wandbName"]}.json'
path = os.path.join(os.path.dirname(__file__), 'checkpoints', file_name)
print('Loading file:', path)
with open(path, 'r') as f:
    save = json.load(f)

print(save.keys())
init = save['init']
config = init['config']
wandb.init(config=config, project=config['wandbProject'], name=file_name)
for log in save['logs']:
    wandb.log(log)

wandb.finish()