import torch
import torch.nn as nn
import torch.nn.functional as F

softmax = nn.Softmax(dim=1)

x = torch.tensor([[0.1, 0.2, 0.7], [0.2, 0.3, 0.5], [0.3, 0.2, 0.5]])
print(x)
x = softmax(x)
x = x.view(-1, x.size(-1))
print(x)

y = torch.tensor([0, 1, 2], dtype=torch.int64)
y = y.view(-1)
print(y)

print(x.dtype, y.dtype)
a = F.cross_entropy(x, y)
print(a)