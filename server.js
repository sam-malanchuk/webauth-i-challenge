const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const Users = require('./users-model.js');

const server = express();

server.use(helmet());
server.use(cookieParser());
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

  Users.getBy({ username }).first()
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

server.get('/api/users', restricted, (req, res) => {
  res.status(200).json({ message: 'all good here'});
});

function restricted(req, res, next) {
  const { user_id } = req.cookies;
  console.log('here is the cookie', user_id);
  
  Users.getBy({id: user_id}).first()
    .then(user => {
      next();
    })
    .catch(err => {
      res.status(404).json({ message: 'not logged in' });
    })
}

module.exports = server;
