//import database configuration or object
const db = require('../../data/db-config.js');

module.exports = {
  find,
  findById,
  findBy,
  add,
  update,
  remove,
  findByEmail
};

function find() {
  return db('notifications');
}

function findById(id) {
  return db('notifications')
    .where('id', id)
    .first()
    .then(notification => (notification ? notification : null));
}

function findByEmail(email) {
  return db('notifications')
    .where('email', email)
    .first()
    .then(notification => (notification ? notification : null));
}

function findBy(filter) {
  return db('notifications')
    .where(filter)
    .first()
    .then(notification => (notification ? notification : null));
}

function add(notification) {
  return db('notifications')
    .insert(notification, 'id')
    //.then(([id]) => this.findById(id));
    .then(([id]) => (id ? id : null));
}

function update(id, changes) {
  return db('notifications')
    .where({ id })
    .update(changes)
    .then( count => {
      return count > 0 ? findById(id) : null;   //return the updated notification   
  })
}

function remove(id) {  
  return db('notifications')
    .where('id', id)
    .del();
}
