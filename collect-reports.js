const fs = require('fs');
const path = require('path');
const lighthouseCli = require.resolve('lighthouse/lighthouse-cli');
const spawnSync = require('child_process').spawnSync;

const args = process.argv.slice(2);
const testUrl = args[0];
const outputFolderName = args[1];
const cleanOutputFolder = args[2];
const NUMBER_OF_RUNS = args[3] | 10;
const outputFolderPath = path.resolve(__dirname, outputFolderName);

if (cleanOutputFolder) {
  fs.rmdirSync(outputFolderPath, {recursive: true});
}

if (fs.existsSync(outputFolderPath)) {
  const files = fs.readdirSync(outputFolderPath).filter(filename => filename !== '.DS_Store');
  if (files.length > 0) {
    console.warn('Output directory is not empty!')
    process.exit(-1);
  }
} else {
  fs.mkdirSync(outputFolderPath);
}

const saveFile = (path, data) => {
  fs.writeFileSync(path, data)
}

for (let i = 0; i < NUMBER_OF_RUNS; i++) {
  console.log(`Running Lighthouse attempt #${i + 1}...`);
  const {status = -1, stdout} = spawnSync('node', [
    lighthouseCli,
    testUrl,
    '--only-categories=performance',
    '--output=json'
  ]);
  if (status !== 0) {
    console.log('Lighthouse failed, skipping run...');
    continue;
  }

  saveFile(path.resolve(outputFolderPath, `run-${i + 1}.json`), JSON.stringify(JSON.parse(stdout)));
}
