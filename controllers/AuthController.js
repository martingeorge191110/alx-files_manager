import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const base64Credentials = authHeader.split(' ')[1];
    let credentials;
    try {
      credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    } catch (e) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const [email, password] = credentials.split(':');
    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 60 * 60 * 24);
    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
