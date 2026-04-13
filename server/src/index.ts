import { bootstrapApplication } from './app/index.js';

const result = await bootstrapApplication();

console.info(`server ready at ${result.address}`);
