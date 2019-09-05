const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const Users = require('./users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());

server.post('/api/register', (req, res) => {
  const userData = req.body;

  userData.password = bcrypt.hashSync(userData.password, 6);

  Users.registerUser(userData)
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      res.status(500).json({err});
    })
});

server.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  Users.loginUser({ username }).first()
    .then(user => {
      if(user && bcrypt.compareSync(password, user.password)) {
        res.cookie('user_id', user.id); // create a cookie with the user ID
        res.status(200).json({ message: `Logged in. Welcome ${user.username}!` });
      } else {
        res.status(200).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Server error logging in' });
    })
});

module.exports = server;
