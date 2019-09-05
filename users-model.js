const db = require('./data/db-config.js');

module.exports = {
  registerUser,
  loginUser,
  getUsers
}

function registerUser(userData) {
  return db('users').insert(userData)
    .then(ids => {
      const id = ids[0];
      return db('users').where({id}).first()
    })
}

function loginUser(username) {
  return db('users').where(username);
}

function getUsers() {

}