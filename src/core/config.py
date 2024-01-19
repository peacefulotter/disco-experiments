import json
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
print(dir_path)

with open(os.path.join(dir_path, "models.json"), "r") as f:
    configModels = json.load(f)

with open(os.path.join(dir_path, "config.json"), "r") as f:
    baseConfig = json.load(f)

modelType = baseConfig["modelType"]
model = configModels[modelType]

config = {
    "platform": "python",
    **baseConfig,
    **model,
}
