const server = require('./server.js');

const Users = require('./users-model.js');

server.post('/api/users', (req, res) => {
  const userData = req.body;

  Users.registerUser(userData)
    .then(result => {
      console.log(result);
      res.status(201).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({err});
    })
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});