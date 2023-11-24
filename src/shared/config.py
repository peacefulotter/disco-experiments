configModels = {
    'gpt2': {
        'nLayer': 12,
        'nHead': 12,
        'nEmbd': 768,
        'vocabSize': 50257,
        'blockSize': 1024,
    },
    'gpt2-medium': {
        'nLayer': 24,
        'nHead': 16,
        'nEmbd': 1024,
        'vocabSize': 50257,
        'blockSize': 1024,
    },
    'gpt2-large': {
        'nLayer': 36,
        'nHead': 20,
        'nEmbd': 1280,
        'vocabSize': 50257,
        'blockSize': 1024,
    },
    'gpt2-xl': {
        'nLayer': 48,
        'nHead': 25,
        'nEmbd': 1600,
        'vocabSize': 50257,
        'blockSize': 1024,
    },
    'gpt-mini': {'nLayer': 6, 'nHead': 6, 'nEmbd': 192},
    'gpt-micro': {'nLayer': 4, 'nHead': 4, 'nEmbd': 128},
    'gpt-nano': {'nLayer': 3, 'nHead': 3, 'nEmbd': 48},
}

modelType = 'gpt-nano'
model = configModels[modelType]
dataset = 'wikitext'
batchSize = 8
blockSize = 128  # = sequence length
lr = 0.001
maxIter = 300

baseConfig = {
    'debug': False,
    'verbose': False,
    'modelType': modelType,
    **model,
    'dataset': dataset,
    'batchSize': batchSize,
    'blockSize': blockSize,
    'lr': lr,
    'maxIter': maxIter,
    'shuffle': False,
    'weightDecay': False,
    'weight_decay': 0.001,
    'optimizer': 'adamw',
    'gradClip': 1,
    'scheduler': None,
    'dropout': 0,
    'numWorkers': 0,
    'vocabSize': 50257,
    'wandbProject': 'disco-gpt-benchmark',
    'evalFreq': 25,
    'evalSeqPrefix': 'none',
    'maxEvalBatches': 24,
}

config = {
    **baseConfig,
    'wandbName': f"{modelType}_{dataset}_bs={batchSize}_seq={blockSize}_lr={lr}_iter={maxIter}",
}


