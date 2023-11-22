

import json
import wandb

with open('save.json', 'r') as f:
    save = json.load(f)

print(save.keys())
init = save['init']
config = init['config']
wandb.init(config=config, project=config['wandbProject'], name=config['wandbName'])
for log in save['logs']:
    wandb.log(log)

wandb.finish()