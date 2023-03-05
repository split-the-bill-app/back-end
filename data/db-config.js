const knex = require('knex');
const knexConfig = require('../knexfile.js');

//a db configuration from an environment variable or the development object from knexfile.js
const dbEnv = process.env.DB_ENV || 'development';
console.log('ENV:', process.env.DB_ENV);

//specify either dev or prod object to select from knexfile.js
module.exports = knex(knexConfig[dbEnv]);


