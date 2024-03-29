//import database configuration or object
const db = require('../../data/db-config.js');

module.exports = {
  find,
  findById,
  findBy,
  findBillNotifications,
  add,
  update,
  remove,
  findUserBillNotifications,
  findUserOwedBills,
  findAllPaidBills  
};

function find() {
  return db('bills');
}

function findById(id) {
  return db('bills')
    .where('id', id)
    .first()
    .then(bill => (bill ? bill : null));
}

function findBy(filter) {
  return db('bills')
    .where(filter)
    .first()
    .then(bill => (bill ? bill : null));
}

function findBillNotifications(bill_id) { 
  return db('notifications as n')
    .join('bills as b', 'b.id', 'n.bill_id')
    .select('n.id', 'n.email', 'n.bill_id', 'n.paid', 'b.split_each_amount', 'b.description', 'b.split_people_count', 'b.created_at')
    .where('n.bill_id', bill_id);
}

//you owe your friends
function findUserBillNotifications(email) {
  return db('notifications as n')
    .join('bills as b', 'b.id', 'n.bill_id') //bill the notification is for
    .join('users as u', 'u.id', 'b.user_id') //person that the bill is owed to
    .select('u.firstname', 'u.lastname', 'u.email', 'b.created_at', 'b.split_each_amount', 'b.description', 'n.paid')    
    .where('n.paid', false)
    .where('n.email', '=', email);      
}

//your friends owe you
function findUserOwedBills(userId) {
  return db('users as u') //user who created the bills    
    .join('bills as b', 'b.user_id', 'u.id')
    .join('notifications as n', 'n.bill_id', 'b.id') 
    .select('b.id', 'b.created_at', 'b.split_each_amount', 'b.description', 'n.paid', 'n.email')    
    .where('u.id', userId)
    .where('n.paid', false);    
}

//find all paid bills for a logged in user
function findAllPaidBills(userId) {
  return db('users as u') //user who created the bills
    .join('bills as b', 'b.user_id', 'u.id')
    .join('notifications as n', 'n.bill_id', 'b.id') 
    .select('b.id', 'b.created_at', 'b.split_each_amount', 'b.description', 'n.paid', 'n.email')    
    .where('u.id', userId)
    .where('n.paid', true);    
}

function add(bill) {
  return db('bills')
    .insert(bill, 'id')
    //.then(([id]) => this.findById(id));
    .then(([id]) => (id ? id : null));
}

function update(id, changes) {
  return db('bills')
    .where({ id })
    .update(changes);
}

function remove(id) {  
  return db('bills')
    .where('id', id)
    .del();
}
