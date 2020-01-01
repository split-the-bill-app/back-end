exports.up = function(knex) {
    return knex.schema
      .createTable('users', function(users) {
        users.increments();
        users.string('password', 128).notNullable();
        users.string('firstname', 128).notNullable();
        users.string('lastname', 128).notNullable();
        users
          .string('email', 128)
          .notNullable()
          .unique();
      })
      .createTable('bills', function(bills) {
        bills.increments();
        bills.string('created_at').defaultTo(knex.fn.now());
        bills.float('split_sum').notNullable();      
        bills.integer('split_people_count').notNullable();
        bills.float('split_each_amount');     
        bills.string('description');
        bills.boolean('paid').defaultTo(false);
        bills
          .integer('user_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('RESTRICT')
          .onUpdate('CASCADE');
      })
      .createTable('notifications', function(notifications) {
        notifications.increments();
        notifications.string('email', 128).notNullable();
        notifications.boolean('paid').defaultTo(false);
        notifications
          .integer('bill_id')
          .unsigned()
          .notNullable()
          .references('id')
          .inTable('bills')
          .onDelete('RESTRICT')
          .onUpdate('CASCADE');
      });
  };  
  exports.down = function(knex) {
    return knex.schema
      .dropTableIfExists('notifications')
      .dropTableIfExists('bills')
      .dropTableIfExists('users');
  };
  