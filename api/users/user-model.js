//import database configuration or object
const db = require('../../data/db-config.js');

module.exports = {
  find,
  findById,
  findBy,
  findUserBills,
  findUserBillsByDate,
  findUserBillsByTextEntry, 
  findByUserEmail,
  add,
  update,
  remove,
};

function find() {
  return db('users');
}

function findById(id) {  
  return db('users')
    .where('id', id)
    .first()
    .then(user => (user ? user : null));    
}

function findBy(filter) {
  return db('users')
    .where(filter)
    .first()
    .then(user => (user ? user : null));
}

function findUserBills(userId) {
  return db('bills as b')
    .join('users as u', 'u.id', 'b.user_id')
    .select(
      'b.id',
      'b.split_sum',
      'b.split_people_count',
      'b.split_each_amount',
      'b.notes',
      'b.description',
      'b.created_at',
      'b.user_id',
      'u.email as user_email',
    )
    .where('b.user_id', userId);
}

function findUserBillsByDate(userId, date){
  return db('bills as b')
  .join('users as u', 'u.id', 'b.user_id')
  .select(
    'b.id',
    'b.split_sum',
    'b.split_people_count',
    'b.split_each_amount',
    'b.notes',
    'b.description',
    'b.created_at',
    'b.user_id',
    'u.email as user_email'
  )  
  .where('b.user_id', userId)
  .where('b.created_at', date)  
  .orderBy('b.created_at')
}

function findUserBillsByTextEntry(userId, search_text){
  return db('bills as b')
  .join('users as u', 'u.id', 'b.user_id')
  .select(
    'b.id',
    'b.split_sum',
    'b.split_people_count',
    'b.split_each_amount',
    'b.notes',
    'b.description',
    'b.created_at',
    'b.user_id',
    'u.email as user_email'
  )  
  .where('b.user_id', userId)   
  .where('b.description', 'like', `%{search_text}%`)
  .orderBy('b.created_at')
}

function findByUserEmail(user_email) {
  return db('users')
    .where('email', user_email)
    .first()
    .then(user => (user ? user : null));
}

function add(user) {
  return db('users')
    .insert(user, 'id')  
    //the return id is enclosed in [], using [id] removes the []  
    .then(([id]) => (id ? id : null)); 
}

function update(id, changes) {
  return db('users')
    .where({ id })
    .update(changes);
}

function remove(id) {
  return db('users')
    .where('id', id)
    .del();
}
