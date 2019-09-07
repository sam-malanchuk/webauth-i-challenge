const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const connectSessionKnex = require('connect-session-knex');

const db = require('./data/db-config.js');
const Users = require('./users-model.js');

const server = express();

const KnexSessionStore = connectSessionKnex(session);

const sessionConfig = {
  name: 'frap',
  secret: "this is the secret encryption for this project",
  cookie: {
    maxAge: 7 * 24 * 1000 * 60 * 60,
    secure: false,
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    knex: db,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 12 * 1000 * 60 * 60
  })
}

server.use(helmet());
server.use(express.json());
server.use(session(sessionConfig));

// endpoint takes in a username and password and creates a new user in the database
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

// endpoint takes in a username and password to create a log in session if user credentials exist
server.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  Users.getBy({ username }).first()
    .then(user => {
      if(user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user.id;
        res.status(200).json({ message: `Logged in. Welcome ${user.username}!` });
      } else {
        res.status(200).json({ message: 'You shall not pass!' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Server error logging in' });
    })
});

// restricted endpoint to get a list of the users
server.get('/api/users', restricted, (req, res) => {
  Users.getUsers()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error getting users list' });
    })
});

// Middleware:

// Checks if the user is logged in to allow/deny access to restricted endpoints
function restricted(req, res, next) {
  if(req.session.user) {
    const user_id = req.session.user;

    Users.getBy({id: user_id}).first()
    .then(user => {
      if(user) {
        next();
      } else {
        res.status(404).json({ message: 'You shall not pass!' });
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'Error getting the list.' });
    })
  } else {
    res.status(404).json({ message: 'You shall not pass!' });
  }
}

module.exports = server;
