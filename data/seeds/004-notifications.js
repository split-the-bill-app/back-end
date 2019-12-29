exports.seed = function(knex) {
  return knex('notifications')
    .del()
    .then(function() {
      return knex('notifications').insert([
        {
          bill_id: 1,
          email: 'maryjane@yahoo.com',
        },
        {
          bill_id: 2,
          email: 'johndoe@yahoo.com',
        }
      ]);
    });
};
