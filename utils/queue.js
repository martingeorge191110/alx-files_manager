import Queue from 'bull';

const fileQueue = new Queue('fileQueue');
const userQueue = new Queue('userQueue');

export { fileQueue, userQueue };
