const moment = require('moment');

exports.seed = function(knex) {
  return knex('bills')
    .del()
    .then(function() {
      return knex('bills').insert([
        {
          user_id: 1,
          split_sum: 15.73,
          split_people_count: 3,  
          split_each_amount: 5.24,        
          created_at: moment().format('MM-DD-YY'),
        },
        {
          user_id: 2,
          split_sum: 33.35,
          split_people_count: 2,
          split_each_amount: 16.68,
          created_at: moment().format('MM-DD-YY'),
        }        
      ]);
    });
};
