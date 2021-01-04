const app = require('../src/app');
const knex = require('knex'); 
const { makeNotesArray } = require('../test/notes.fixtures');
const { makeFoldersArray } = require('../test/folders.fixtures');
const supertest = require('supertest');


describe('Notes endpoints', () => {
  let db;

  before('create knex instance', () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  before('clean tables', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'));

  after('disconnect from db', () => db.destroy());

  afterEach('clean tables', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'));


  describe('GET /notes endpoint', () => {
    context('Given the database has notes', () => {
      const testNotes = makeNotesArray();
      const testFolders = makeFoldersArray();

      beforeEach('insert folders and notes', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_notes')
              .insert(testNotes);
          });
      });

      it('responds with 200 and the array of notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes);
      });
    });

    context('Given the database is empty', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, []);
      });
    });
  });

  
});