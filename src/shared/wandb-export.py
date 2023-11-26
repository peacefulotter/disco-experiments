
import os
import json
import wandb

import sys
sys.path.append(os.path.abspath('../../shared/'))
from config import config

if len(sys.argv) < 3:
    print('''
Please provide a platform and backend name as an argument
e.g. "python wandb-export.py browser webgpu", 
          
    allowed platforms are: "browser", "node"
    allowed backends are: "webgpu", "webgl", "cpu", "tensorflow"
    ''')
    exit()

platform = sys.argv[1]
backend_name = sys.argv[2]

file_name = f'{backend_name}_{config["wandbName"]}.json'
path = os.path.join(os.path.dirname(__file__), 'checkpoints', file_name)
print('Loading file:', path)
with open(path, 'r') as f:
    save = json.load(f)

init = save['init']
config = init['config']
wandb.init(config=config, project=config['wandbProject'], name=file_name)
for log in save['logs']:
    wandb.log(log)

wandb.finish()