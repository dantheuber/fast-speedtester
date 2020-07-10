const Speedtest = require('fast-speedtest-api');
const { appendFile } = require('fs');

const token = process.env.FAST_TOKEN;
const envInterval = Number(process.env.FAST_TEST_INTERVAL);
const interval = isNaN(envInterval) ? 60 : envInterval;

const options = {
  token,
  verbose: false,
  timeout: process.env.FAST_TIMEOUT || 10000,
  https: true,
  urlCount: 5,
  bufferSize: 8,
  unit: Speedtest.UNITS.Mbps,
};

const speedTest = new Speedtest(options);

const wait = () => new Promise((resolve) => {
  setTimeout(() => resolve(), interval * 1000);
});

const logResult = (speed) => {
  const flatSpeed = Math.ceil(speed);
  const now = new Date().toISOString();
  const log = `${now},${flatSpeed},Mbps\n`;
  return new Promise((resolve, reject) => {
    console.log(`${flatSpeed} Mbps`);
    appendFile('log.csv', log, 'utf8', (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const handleError = (error) => {
  console.error(error.message);
};

const runTest = () => speedTest.getSpeed()
  .then(logResult)
  .then(wait)
  .then(runTest)
  .catch(handleError);

console.log('Starting speed monitoring!');
// start the loop
runTest();
