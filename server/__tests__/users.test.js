const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');

jest.setTimeout(30000);
let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Users Endpoint', () => {
  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });

  it('should get list of users except self', async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User1', email: 'u1@example.com', password: 'pass123' });
    const token1 = res1.body.token;
    const id1 = res1.body.user.id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User2', email: 'u2@example.com', password: 'pass123' });
    const id2 = res2.body.user.id;

    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token1}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]._id.toString()).toBe(id2);
  });
});
