import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { userQueue } from '../utils/queue';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const hashedPassword = sha1(password);
    const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });
    await userQueue.add({ userId: result.insertedId.toString() });
    return res.status(201).json({ id: result.insertedId.toString(), email });
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.db.collection('users').findOne({ _id: new dbClient.client.constructor.ObjectID(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

export default UsersController;
