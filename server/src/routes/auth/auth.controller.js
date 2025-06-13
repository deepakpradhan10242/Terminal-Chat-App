const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../../models/user.model");
const redisClient = require('../../utils/redisClient');


async function registerUser(req, res) {
  try {
    const { username, password } = req.body;

    
    const existingUser = await User.findOne({username});
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    
    await newUser.save();
    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error', error);
    res.status(500).json({ message: 'Registration error' });
  }
}

async function loginUser(req, res) {
  try {
    const { username, password } = req.body;
    
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User Not found!' });
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    await redisClient.set(username, token);

    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Login error' });
  }
}

async function getToken(req, res) {
  try {
    const username = req.params.id;
    const token = await redisClient.get(username);
    if (token) {
      res.status(200).json(token);
    } else {
      res.status(400).json({ message: 'No token found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Couldn\'t get token' });
  }

}

module.exports = {
  registerUser,
  loginUser,
  getToken
}