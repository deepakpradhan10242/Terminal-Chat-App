const http = require('http');
const ioServer = require('socket.io');
const redisClient = require('./src/utils/redisClient');
const app = require('./app');
const mongoConnect = require('./src/config/mongo');
const socketManager = require('./socketManager');
require('dotenv').config();


const server = http.createServer(app);


const io = ioServer(server, { cors: { origin: "*" } });


socketManager(io);

server.listen(3001, async () => {
   
    await mongoConnect();
    
    await redisClient.connect();
    console.log('Server started running...');
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});