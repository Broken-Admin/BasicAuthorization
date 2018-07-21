const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const low = require('lowdb')
const reload = require('require-reload')
const passwordHash = require('password-hash')
// Low DB
const FileSync = require('lowdb/adapters/FileSync')
// Users DB
const usersAdapter = new FileSync(`${__dirname}/data/users.json`)
const users = low(usersAdapter)
var usersDB = require(`${__dirname}/data/users.json`)
// Logs DB
const logsAdapter = new FileSync(`${__dirname}/data/logs.json`)
const logs = low(logsAdapter)

server.listen(80);

users.defaults({
    users: []
  })
  .write();
logs.defaults({
    logs: []
  })
  .write();

async function deploy(pageName, path) {
  await app.use(express.static(`${__dirname}${path}`))
  console.log(`Page "${pageName}" deployed!`)
}
deploy("root", "/root/");

io.on('connection', (socket) => {
  /*socket.on('connected', function (data) {
    console.log(`Connection from ${data.ip}`);
  });*/
  socket.on('login-attempt', (data) => {
    // Write to log
    logs.get('logs')
      .push({
        timestamp: Math.round((new Date()).getTime() / 1000),
        date: Date(),
        ip: data.ip,
        type: "Login-Attempt",
        attemptedUsername: data.username
      })
      .write();
    // Vertify login.
    usersDB = reload(`${__dirname}/data/users.json`);
    for (let i = 0; i < usersDB.users.length; i++) {
      if (usersDB.users[i].username == data.username) {
        if(passwordHash.verify(data.password,usersDB.users[i].password)){
          socket.emit('alert', `Logged in as ${data.username}`)
          return;
        }
        socket.emit('alert', "Invalid username or password.")
        return
      }
    }
  });
  socket.on('register-attempt', (data) => {
    // Write to log
    logs.get('logs')
      .push({
        timestamp: Math.round((new Date()).getTime() / 1000),
        date: Date(),
        ip: data.ip,
        type: "Register-Attempt"
      })
      .write();
    // Check if user is already registered.
    usersDB = reload(`${__dirname}/data/users.json`);
    for (let i = 0; i < usersDB.users.length; i++) {
      if (usersDB.users[i].username == data.username) {
        socket.emit('alert', "A user with this username is already registered.\n\nYou may want to travel to the login page if you are this user.")
        return;
      }
    }
    socket.emit('alert', `Registered user ${data.username}.`)
    users.get('users')
      .push({
        username: data.username,
        password: passwordHash.generate(data.password)
      })
      .write();
  })
});