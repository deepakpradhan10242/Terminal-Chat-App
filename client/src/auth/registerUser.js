const { prompt } = require('inquirer');
const axios = require('axios');
const loginUser = require('./loginUser');
require('dotenv').config();

const registerUser = async () => {
  const questions = [
    { type: 'input', name: 'username', message: 'Enter your username:' },
    { type: 'password', name: 'password', message: 'Enter your password:' },
  ];

  try {
    const { username, password } = await prompt(questions);
    const response = await axios.post(`${process.env.BACKEND_URL}/auth/register`, {
      username,
      password,
    });

    console.info('----------------------------------------------');
    console.info(response.data.message);
    console.info('----------------------------------------------');

    const token = await loginUser(username, password);
    return token;
  } catch (error) {
    if (error.response?.data?.message === 'Username already exists') {
      console.info(error.response.data.message);
      return await registerUser(); 
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
};

module.exports = registerUser;
