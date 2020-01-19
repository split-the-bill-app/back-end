const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
  return knex('users')
    .del()
    .then(function() {
      return knex('users').insert([
        {
          email: 'tishay_ann@yahoo.com',
          password: bcrypt.hashSync('test', 10),
          firstname: 'Tishay',
          lastname: 'Ann',
        },
        {
          email: 'tishayann@gmail.com',
          password: bcrypt.hashSync('test', 10),
          firstname: 'Jazlene',
          lastname: 'Arianna',
        }        
      ]);
    });
};
