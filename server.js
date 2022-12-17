const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

//import routers
const UsersRouter = require('./api/users/user-router.js');
const BillsRouter = require('./api/bills/bill-router.js');
const NotificationsRouter = require('./api/notifications/notification-router.js');

//creates express application 
const server = express();

server.use(express.json());
server.use(helmet());
server.use(cors());

server.get('/', (req, res) => { 
  res.send(
    `Welcome to Split The Bill!`,
  );
});

//mount the routers/endpoints and apply them like middleware
server.use('/api/users', UsersRouter);
server.use('/api/bills', BillsRouter);
server.use('/api/notifications', NotificationsRouter);

module.exports = server;
