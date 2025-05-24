const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let token;
let blogId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await request(app)
    .post('/api/auth/register')
    .send({
      username: 'commenter',
      email: 'commenter@example.com',
      password: 'password123',
    });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'commenter@example.com',
      password: 'password123',
    });

  token = loginRes.body.token;

  const blogRes = await request(app)
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Comment Blog',
      content: 'Blog for commenting',
    });

  blogId = (await Blog.findOne({ title: 'Comment Blog' }))._id;
});

afterEach(async () => {
  await Comment.deleteMany();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Comment - Add', () => {
  it('should add a comment to a blog', async () => {
    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        blogId: blogId.toString(),
        content: 'Nice blog!',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Comment added successfully');

    const comment = await Comment.findOne({ blogId });
    expect(comment).toBeDefined();
    expect(comment.content).toBe('Nice blog!');
  });
});
