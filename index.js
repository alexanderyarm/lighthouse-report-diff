const fs = require('fs');
const path = require('path');

const beforeFolder = path.resolve(__dirname, 'before')
const afterFolder = path.resolve(__dirname, 'after')

const beforeFiles = fs.readdirSync(beforeFolder).filter(filename => filename !== '.DS_Store')
const afterFiles = fs.readdirSync(afterFolder).filter(filename => filename !== '.DS_Store')

const readFile = (folder) => (filename) => {
  const fileData = fs.readFileSync(path.resolve(folder, filename));
  return JSON.parse(fileData)
}

const filterData = ({categories, audits}) => ({
  'performance-score': {numericValue: categories.performance.score, numericUnit: 'point'},
  'first-contentful-paint': audits['first-contentful-paint'],
  'largest-contentful-paint': audits['largest-contentful-paint'],
  'first-meaningful-paint': audits['first-meaningful-paint'],
  'speed-index': audits['speed-index'],
  'total-blocking-time': audits['total-blocking-time'],
  'max-potential-fid': audits['max-potential-fid'],
  'cumulative-layout-shift': audits['cumulative-layout-shift'],
  'server-response-time': audits['server-response-time'],
  'first-cpu-idle': audits['first-cpu-idle'],
})

const getDisplayName = (metricName) => {
  switch(metricName) {
    case 'performance-score': return 'Performance ········'
    case 'first-contentful-paint': return 'FCP ················'
    case 'largest-contentful-paint': return 'LCP ················'
    case 'first-meaningful-paint': return 'FMP ················'
    case 'speed-index': return 'Speedindex ·········'
    case 'total-blocking-time': return 'TBT ················'
    case 'max-potential-fid': return 'Max Potential FID ··'
    case 'cumulative-layout-shift': return 'CLS ················'
    case 'server-response-time': return 'Server Response Time'
    case 'first-cpu-idle': return 'First CPU Idle ·····'
    default:
      return metricName;
  }
}
 
const getDisplayUnit = (unit) => {
  if (unit === 'millisecond') {
    return 's';
  } else {
    return '';
  }
}

const getRoundedValue = (value, unit) => {
  if (unit === 'millisecond') {
    return Math.floor(value) / 1000;
  } else if (unit === 'unitless') {
    return value.toFixed(4);
  } else if (unit === 'point') {
    return Math.floor(value * 100);
  }
} 

const collectData = (acc, item, index, arr) => {
  const newAcc = acc;
  const data = Object.keys(item).forEach((metricName) => {
    const metricData = item[metricName];

    newAcc[metricName] = acc[metricName] ? acc[metricName] + metricData.numericValue : metricData.numericValue;

    if (index === arr.length - 1) {
      newAcc[metricName] = newAcc[metricName] / arr.length;
    }
  })

  

  return newAcc;
}

const metricInfo = beforeFiles
  .map(readFile(beforeFolder))
  .map(filterData)
  .filter((item, index) => index === 0)
  .reduce((acc, metric) => {
    Object.keys(metric).forEach((metricName) => {
      const {numericUnit: unit} = metric[metricName] || '';
      acc[metricName] = { unit }
    })
    return acc;
  }, {})
  

const beforeData = beforeFiles
  .map(readFile(beforeFolder))
  .map(filterData)
  .reduce(collectData, {})

const afterData = afterFiles
  .map(readFile(afterFolder))
  .map(filterData)
  .reduce(collectData, {})

const diffData = Object.keys(beforeData).reduce((acc, metricName) => {
  const unit = metricInfo[metricName].unit;
  const diffValue = afterData[metricName] - beforeData[metricName];
  const roundedAverageValue = getRoundedValue(diffValue, unit)

  acc[metricName] = roundedAverageValue;
  return acc;
}, {})

console.log('\n')
Object.keys(diffData).forEach((metricName) => {
  const unit = metricInfo[metricName].unit;
  const displayUnit = getDisplayUnit(unit);
  const metricValue = diffData[metricName];
  
  
  if (metricValue < 0) {
    console.log("\x1b[37m", `${getDisplayName(metricName)}`, "\x1b[31m", `${metricValue}${displayUnit}`)
  } else {
    console.log("\x1b[37m", `${getDisplayName(metricName)}`, "\x1b[32m", `+${metricValue}${displayUnit}`)
  }
})
console.log('\n')
