const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;


if (!uri) {
    console.error("MongoDB URI is not defined in the environment variables.");
    process.exit(1); 
}

async function mongoConnect() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); 
    }
}


process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully');
    process.exit(0);
});

module.exports = mongoConnect;
