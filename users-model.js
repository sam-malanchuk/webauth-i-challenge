const db = require('./data/db-config.js');

module.exports = {
  getBy,
  registerUser,
  getUsers
}

function getBy(filter) {
  return db('users').where(filter);  
}

function registerUser(userData) {
  return db('users').insert(userData)
    .then(ids => {
      const id = ids[0];
      return db('users').where({id}).first()
    })
}

function getUsers() {
  return db('users');
}