import getDataset from './dataset'

async function test() {
    const ds = await getDataset('./openwebtext')
    console.log(ds);
    console.log(await ds.forEachAsync((input) => console.log('==============\n\n' + input)));
}

await test()