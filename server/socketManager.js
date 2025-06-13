const jwt = require('jsonwebtoken');
const User = require('./src/models/user.model');

module.exports = (io) => {
   
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            
            const decoded = jwt.verify(token, process.env.SECRET_KEY);

        
            const user = await User.findById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }

            
            socket.username = user.username;
            next();
        } catch (error) {
            console.error('Authentication error', error);
            next(new Error('Authentication error'));
        }
    });


    io.on('connection', (socket) => {

        
        const socketRoomMap = new Map();

        
        socket.on('join', (room) => {
            
            socket.emit('username', socket.username);

            socket.join(room);
            
            socketRoomMap.set(socket.username, room); 
            socket.emit('joined', `You joined ${room}`);
            socket.broadcast.to(room).emit('user joined', `${socket.username} joined ${room}`);
            
        });

        
        socket.on('chat message', (room, message) => {
            socket.broadcast.to(room).emit('chat message', `${socket.username}: ${message}`);
        });
        

        
        socket.on('disconnecting', async() => {
            const room = socketRoomMap.get(socket.username); 
            if (room) {
                socket.broadcast.to(room).emit('user left', `${socket.username} left the chat room`);
                socketRoomMap.delete(socket.username); 
            }
        });
    });
}