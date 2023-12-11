mkdir -p ./datasets/wikitext
curl https://s3.amazonaws.com/research.metamind.io/wikitext/wikitext-103-raw-v1.zip --output datasets/wikitext/raw.zip
unzip ./datasets/wikitext/raw.zip -d ./datasets/wikitext-103
mv ./datasets/wikitext-103/wikitext-103-raw/* ./datasets/wikitext-103/
rmdir ./datasets/wikitext-103/wikitext-103-raw/