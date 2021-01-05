const app = require('../src/app');
const knex = require('knex');
const { makeFoldersArray } = require('../test/folders.fixtures');
const supertest = require('supertest');

describe.only('Folders endpoints', () => {
  let db;

  before('create knex Instance', () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  before('clean tables', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'));

  afterEach('clean tables', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'));

  after('disconnect from db', () => db.destroy());

  describe('GET /folders endpoint', () => {
    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();
      
      beforeEach('insert folders', () => {
        return db
          .insert(testFolders)
          .into('noteful_folders');
      });

      it('responds with 200 and an array of folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders);
      });
    });

    context('Given the database is empty', () => {
      it('responds with 200 and an empty array', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, []);
      });
    });
  });

  describe('POST /folders endpoint', () => {
    it('responds with 201 and the newly created folder', () => {
      const newFolder = {
        id: 1,
        folder_name: 'Test Folder'
      };

      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201, newFolder);
    });

    it(`responds with 400 and 'Missing folder_name'`, () => {
      const newFolder = {
        id: 1
      };

      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(400, {
          error: { message:`Missing 'folder_name' in request body` }
        });
    });
  });

  describe('GET /folders/:folder_id', () => {
    context('Given the database has folders', () => {
      const testFolders = makeFoldersArray();
      
      beforeEach('insert folders', () => {
        return db
          .insert(testFolders)
          .into('noteful_folders');
      });

      it('responds with 200 and the folder for the given id', () => {
        const idOfFolder = 3;
        const expectedFolder = testFolders[idOfFolder - 1];

        return supertest(app)
          .get(`/api/folders/${idOfFolder}`)
          .expect(200, expectedFolder);
      });
    });

    context('Given the database is empty', () => {
      it(`responds with 404 and 'Folder doesn't exist'`, () => {
        const idOfFolder = 3;
        
        return supertest(app)
          .get(`/api/folders/${idOfFolder}`)
          .expect(404, {
            error: { message: `Folder doesn't exist` }
          });
      });
    });
  });

  describe('DELETE /folders/:folder_id', () => {
    context('Given the database has folders', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .insert(testFolders)
          .into('noteful_folders');
      });

      it(`responds with 204 and removes folder from database`, () => {
        const idOfFolder = 3;
        const expectedFolders = testFolders.filter(folder => folder.id !== idOfFolder);

        return supertest(app)
          .delete(`/api/folders/${idOfFolder}`)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get('/api/folders')
              .expect(expectedFolders);
          });
      });
    });

    context('Given the database has empty', () => {
      it(`responds with 404 and 'Folder doesn't exist'`, () => {
        const idOfFolder = 3;
  
        return supertest(app)
          .delete(`/api/folders/${idOfFolder}`)
          .expect(404, {
            error: { message: `Folder doesn't exist` }
          });
      });
    });
  });
});