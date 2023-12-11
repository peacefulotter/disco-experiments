import json

with open("models.json", "r") as f:
    configModels = json.load(f)

with open("config.json", "r") as f:
    baseConfig = json.load(f)

modelType = baseConfig["modelType"]
dataset = baseConfig["dataset"]
batchSize = baseConfig["batchSize"]
blockSize = baseConfig["blockSize"]
lr = baseConfig["lr"]
maxIter = baseConfig["maxIter"]

model = configModels[modelType]

config = {
    **baseConfig,
    **model,
    "residDrop": baseConfig["embdDrop"],
    "wandbName": f"{modelType}_{dataset}_bs={batchSize}_seq={blockSize}_lr={lr}_iter={maxIter}",
}
