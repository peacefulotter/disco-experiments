from src.data.utils import get_dataset
from src.optim.utils import get_batch
from types import SimpleNamespace

args = SimpleNamespace(dataset='wikitext')
data = get_dataset(args)
dataset = data['train']
x, y = get_batch(dataset, 8, 4)
print(x)
print(y)