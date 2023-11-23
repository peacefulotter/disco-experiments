
import os
import json
import wandb

import sys
sys.path.append('../../')
import config

path = os.path.join(os.path.dirname(__file__), 'checkpoints', config.wandbName)
print(path)
raise Exception('stop')
with open('save.json', 'r') as f:
    save = json.load(f)

print(save.keys())
init = save['init']
config = init['config']
wandb.init(config=config, project=config['wandbProject'], name=config['wandbName'])
for log in save['logs']:
    wandb.log(log)

wandb.finish()