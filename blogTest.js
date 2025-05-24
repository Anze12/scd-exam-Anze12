const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Blog = require('../models/Blog');
const View = require('../models/View');
const User = require('../models/User');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create test user
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'blogger',
      email: 'blogger@example.com',
      password: 'password123',
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'blogger@example.com',
      password: 'password123',
    });

  token = loginRes.body.token;
});

afterEach(async () => {
  await Blog.deleteMany();
  await View.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Blog - Create', () => {
  it('should create a blog and initialize view count', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Blog',
        content: 'This is a test blog post.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Blog created successfully');

    const blog = await Blog.findOne({ title: 'Test Blog' });
    expect(blog).toBeDefined();

    const view = await View.findOne({ blogId: blog._id });
    expect(view).toBeDefined();
    expect(view.views).toBe(0);
  });
});
