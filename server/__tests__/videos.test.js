const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Video = require('../models/Video');

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
describe('Videos Endpoint', () => {
  let token1, token2, userId1, userId2;

  beforeAll(async () => {
    // create two users
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'UserA', email: 'a@example.com', password: 'pass1234' });
    token1 = res1.body.token;
    userId1 = res1.body.user.id;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'UserB', email: 'b@example.com', password: 'pass1234' });
    token2 = res2.body.token;
    userId2 = res2.body.user.id;
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get(`/api/videos/${userId2}`);
    expect(res.statusCode).toBe(401);
  });

  it('should return empty list initially', async () => {
    const res = await request(app)
      .get(`/api/videos/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('should return videos between users', async () => {
    // insert video docs directly
    const vid1 = new Video({ from: userId1, to: userId2, videoUrl: 'url1' });
    const vid2 = new Video({ from: userId2, to: userId1, videoUrl: 'url2' });
    await vid1.save();
    await vid2.save();

    const res = await request(app)
      .get(`/api/videos/${userId2}`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    // verify order and content
    expect(res.body[0].videoUrl).toBe('url1');
    expect(res.body[1].videoUrl).toBe('url2');
  });
});
