```
git clone
cd
npm install -g typescript ts-node
npm install
curl https://s3.amazonaws.com/research.metamind.io/wikitext/wikitext-103-raw-v1.zip --output datasets/wikitext/raw.zip
unzip ./datasets/wikitext/raw.zip -d ./datasets/wikitext-103
mv ./datasets/wikitext/wikitext-103-raw/wiki.train.raw ./datasets/wikitext/
mv ./datasets/wikitext/wikitext-103-raw/wiki.test.raw ./datasets/wikitext/
mv ./datasets/wikitext/wikitext-103-raw/wiki.valid.raw ./datasets/wikitext/
rmdir ./datasets/wikitext/wikitext-103-raw/
```
