mkdir -p ./datasets/tiny-shakespeare
curl https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt --output ./datasets/tiny-shakespeare/train
cp ./datasets/tiny-shakespeare/train ./datasets/tiny-shakespeare/validation
