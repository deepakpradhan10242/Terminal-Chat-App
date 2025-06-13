const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require("../src/models/user.model");
const redisClient = require('../src/utils/redisClient');
require('dotenv');


describe('Auth Routes', () => {
  
  let mongoServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await redisClient.connect();
  });

  
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    await redisClient.disconnect();
  });

  
  const testUser = {
    username: 'testuser',
    password: 'password123',
  };

  const testUser2 = {
    username: 'testuser2',
    password: 'password123',
  };

  let userId;

   
  describe('POST auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Registration successful');
    });

    test('should return an error if username or email already exists', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Username or email already exists');
    });
  });

   
  describe('POST auth/login', () => {
    test('should login a user', async () => {
       
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const newUser = new User({
        username: testUser2.username,
        email: testUser2.email,
        password: hashedPassword,
      });
      await newUser.save();

      userId = newUser._id;

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: testUser2.username,
          password: testUser2.password,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });

    test('should return an error for invalid username or password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'invalidusername',
          password: 'invalidpassword',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid username or password');
    });
  });

   
  describe('GET /token/:id', () => {
    test('should get a token for the user', async () => {
       
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const newUser = new User({
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
      });
      await newUser.save();

       
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);
      await redisClient.set(testUser2.username, token);

      const response = await request(app).get(`/auth/tokens/${testUser2.username}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(token);
    });

    test('should return an error if no token found', async () => {
      const response = await request(app).get('/auth/tokens/nonexistentuser');

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('No token found');
    });
  });
});