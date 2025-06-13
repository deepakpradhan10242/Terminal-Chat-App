const axios = require('axios');
require ('dotenv').config();

module.exports = async (username) => {
    try {
        const response = await axios.get(`${process.env.BACKEND_URL}/auth/tokens/${username}`);
        return response.data;
    } catch (error) {
        console.error(error.response?.data || 'An error occurred while fetching the token');
        return null; 
    }
};
