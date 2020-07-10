import Speedtest from 'fast-speedtest-api';
import { appendFile } from 'fs';

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
  const now = new Date().toISOString();
  const log = `${now},${speed},Mbps\n`;
  return new Promise((resolve, reject) => {
    appendFile('log.txt', log, 'utf8', (err) => {
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

// start the loop
runTest();
