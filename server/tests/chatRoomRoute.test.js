const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const ChatRoom = require('../src/models/chatRoom.model');
const app = require('../app');


describe('Chat Room API', () => {
    let mongoServer;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    
    beforeEach(async () => {
        await ChatRoom.deleteMany();
    });

    describe('POST /api/chatRooms', () => {
        it('should create a new chat room', async () => {
            const roomName = 'Test Room';

             
            const response = await request(app)
                .post('/api/chatRooms')
                .send({ roomName })
                .expect(201);

             
            expect(response.body).toEqual(roomName);
        });

        it('should return 409 if chat room already exists', async () => {
            const roomName = 'Existing Room';

             
            await ChatRoom.create({ roomName });

            
            const response = await request(app)
                .post('/api/chatRooms')
                .send({ roomName })
                .expect(409);

             
            expect(response.body.message).toEqual('Chat room already exists');
        });
    });

    describe('GET /api/chatRooms', () => {
        it('should return a list of chat room names', async () => {
            const roomNames = ['Room 1', 'Room 2', 'Room 3'];

             
            await ChatRoom.create([
                { roomName: roomNames[0] },
                { roomName: roomNames[1] },
                { roomName: roomNames[2] },
            ]);

             
            const response = await request(app)
                .get('/api/chatRooms')
                .expect(200);

             
            expect(response.body).toEqual(roomNames);
        });
    });
});