const app = require('../src/app');
const knex = require('knex');
// will need my fixtures to go here

describe('Folders endpoints', () => {
  let db;

  before('create knex Instance', () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });
});