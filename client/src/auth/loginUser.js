const axios = require('axios');
const { prompt } = require('inquirer');
require('dotenv').config(); 

const loginUser = async (username, password) => {
  try {
    if (!username || !password) {
      const answers = await prompt([
        { type: 'input', name: 'username', message: 'Enter your username:' },
        { type: 'password', name: 'password', message: 'Enter your password:' },
      ]);
      username = answers.username;
      password = answers.password;
    }

    const response = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
      username,
      password,
    });

    console.info('----------------------------------------------');
    console.log(response.data.message);
    console.info('----------------------------------------------');
    return response.data.token;

  } catch (error) {
    const errorMessage = error.response?.data?.message
    console.error(errorMessage);
    return await loginUser();
  }
};

module.exports = loginUser;
