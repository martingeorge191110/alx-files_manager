import { ObjectId } from 'mongodb';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';
import { fileQueue, userQueue } from './utils/queue';

fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    done(new Error('Missing fileId'));
    return;
  }
  if (!userId) {
    done(new Error('Missing userId'));
    return;
  }

  let file;
  try {
    file = await dbClient.db.collection('files').findOne({
      _id: new ObjectId(fileId),
      userId: new ObjectId(userId),
    });
  } catch (err) {
    done(err);
    return;
  }

  if (!file) {
    done(new Error('File not found'));
    return;
  }
  if (file.type !== 'image') {
    done();
    return;
  }

  const { localPath } = file;
  const sizes = [500, 250, 100];

  try {
    await Promise.all(
      sizes.map(async (size) => {
        const thumbnailBuffer = await thumbnail(localPath, { width: size });
        fs.writeFileSync(`${localPath}_${size}`, thumbnailBuffer);
      }),
    );
    done();
  } catch (err) {
    done(err);
  }
});

userQueue.process(async (job, done) => {
  const { userId } = job.data;
  if (!userId) {
    done(new Error('Missing userId'));
    return;
  }
  let user;
  try {
    user = await dbClient.db.collection('users').findOne({ _id: new ObjectId(userId) });
  } catch (err) {
    done(err);
    return;
  }
  if (!user) {
    done(new Error('User not found'));
    return;
  }
  // Print welcome message
  // eslint-disable-next-line no-console
  console.log(`Welcome ${user.email}!`);
  done();
});
