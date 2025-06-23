import request from 'supertest';
import { MongoClient } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import app from '../server';

let server;

beforeAll((done) => {
  server = app.listen(5000, done);
});
afterAll((done) => {
  server.close(done);
});

describe('API Endpoints', () => {
  it('GET /status should return 200 and redis/db status', async () => {
    const res = await request(server).get('/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('redis');
    expect(res.body).toHaveProperty('db');
  });

  it('GET /stats should return 200 and stats object', async () => {
    const res = await request(server).get('/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('files');
  });

  it('POST /users should create a user', async () => {
    const res = await request(server)
       .post('/users')
       .send({ email: `test${Date.now()}@test.com`, password: '123456' });
    expect([200, 201, 400]).toContain(res.statusCode);
  });

  it('GET /connect should fail without credentials', async () => {
    const res = await request(server).get('/connect');
    expect([401, 400]).toContain(res.statusCode);
  });

  it('GET /disconnect should fail without token', async () => {
    const res = await request(server).get('/disconnect');
    expect([401, 400]).toContain(res.statusCode);
  });

  it('GET /users/me should fail without token', async () => {
    const res = await request(server).get('/users/me');
    expect([401, 400]).toContain(res.statusCode);
  });

  it('POST /files should fail without token', async () => {
    const res = await request(server).post('/files').send({});
    expect(res.statusCode).toBe(401);
  });

  it('GET /files/:id should fail without token', async () => {
    const res = await request(server).get('/files/123');
    expect([401, 404]).toContain(res.statusCode);
  });

  it('GET /files should fail without token', async () => {
    const res = await request(server).get('/files');
    expect(res.statusCode).toBe(401);
  });

  it('PUT /files/:id/publish should fail without token', async () => {
    const res = await request(server).put('/files/123/publish');
    expect([401, 404]).toContain(res.statusCode);
  });

  it('PUT /files/:id/unpublish should fail without token', async () => {
    const res = await request(server).put('/files/123/unpublish');
    expect([401, 404]).toContain(res.statusCode);
  });

  it('GET /files/:id/data should fail without token', async () => {
    const res = await request(server).get('/files/123/data');
    expect([401, 404, 400]).toContain(res.statusCode);
  });
});

