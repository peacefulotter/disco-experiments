

import json
import wandb

with open('save.json', 'r') as f:
    save = json.load(f)

init = save[0]
config = init['config']
wandb.init(config=config, project=config['wandbProject'], name=config['wandbName'])
for log in save[1:]:
    wandb.log(log)

wandb.finish()