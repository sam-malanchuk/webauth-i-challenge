const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const Users = require('./users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());

server.post('/api/users', (req, res) => {
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

module.exports = server;
