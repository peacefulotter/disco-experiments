
# generated using: https://www.codeconvert.ai/typescript-to-python-converter
# and entering the train-config.ts file

modelType = 'gpt-mini'
dataset = 'wikitext'
batchSize = 8
seqLength = 128
lr = 0.001
maxIter = 300
baseConfig = {
    'debug': False,
    'verbose': False,
    'modelType': modelType,
    'nHead': 3,
    'nLayer': 3,
    'nEmbd': 48,
    'dataset': dataset,
    'batchSize': batchSize,
    'blockSize': seqLength,
    'lr': lr,
    'maxIter': maxIter,
    'shuffle': False,
    'weightDecay': False,
    'weight_decay': 0.001,
    'optimizer': 'adamw',
    'gradClip': 1,
    'scheduler': None,
    'dropout': 0,
    'numWorkers': 4,
    'vocabSize': 50257,
    'wandbProject': 'disco-gpt-benchmark',
    'evalFreq': 25,
    'evalSeqPrefix': 'none',
    'maxEvalBatches': 24,
}
config = {
    **baseConfig,
    'wandbName': f"{modelType}_{dataset}_bs={batchSize}_seq={seqLength}_lr={lr}_iter={maxIter}",
}

config

