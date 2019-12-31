const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
  return knex('users')
    .del()
    .then(function() {
      return knex('users').insert([
        {
          email: 'johndoe@yahoo.com',
          password: bcrypt.hashSync('test', 10),
          firstname: 'john',
          lastname: 'doe',
        },
        {
          email: 'maryjane@yahoo.com',
          password: bcrypt.hashSync('test', 10),
          firstname: 'mary',
          lastname: 'jane',
        }        
      ]);
    });
};
