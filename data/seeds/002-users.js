const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
  return knex('users')
    .del()
    .then(function() {
      return knex('users').insert([
        {
          email: 'koree.exton@intrees.org',
          password: bcrypt.hashSync('test', 10),
          firstname: 'Bill',
          lastname: 'Ower',
        },
        {
          email: 'mohan.eldar@intrees.org',
          password: bcrypt.hashSync('test', 10),
          firstname: 'Bill',
          lastname: 'Payer',
        }        
      ]);
    });
};
