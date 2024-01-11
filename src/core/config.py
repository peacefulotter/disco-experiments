import json

with open("models.json", "r") as f:
    configModels = json.load(f)

with open("config.json", "r") as f:
    baseConfig = json.load(f)

modelType = baseConfig["modelType"]
model = configModels[modelType]

config = {
    "platform": "python",
    **baseConfig,
    **model,
}
