const { createClient } = require('redis');
let redisClient;

if (process.env.NODE_ENV === 'production') {
    
    redisClient = createClient({
        url: `${process.env.REDIS_URL}`
    });
    
} else {
  
    redisClient = createClient();
}




redisClient.on('error', err => console.log('Redis Client Error', err));

module.exports = redisClient;
