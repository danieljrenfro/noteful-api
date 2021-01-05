const app = require('../src/app');
const knex = require('knex'); 
const { makeNotesArray } = require('../test/notes.fixtures');
const { makeFoldersArray } = require('../test/folders.fixtures');
const supertest = require('supertest');
const { expect } = require('chai');


describe('Notes endpoints', () => {
  let db;

  before('create knex instance', () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
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

  describe('POST /notes endpoint', () => {
    const testFolders = makeFoldersArray();

    beforeEach('insert folders', () => {
      return db
        .insert(testFolders)
        .into('noteful_folders');
    });
    
    it('responds with 201 and the newly created note', function() {
      this.retries(3);
      const newNote = {
        id: 1,
        note_name: 'Test Note',
        content: 'Test Content',
        folder_id: 1
      };

      return supertest(app)
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body.id).to.eql(newNote.id);
          expect(res.body.note_name).to.eql(newNote.note_name);
          expect(res.body.content).to.eql(newNote.content);
          expect(res.body.folder_id).to.eql(newNote.folder_id);
          const expectedDate = new Date().toLocaleString();
          const actualDate = new Date(res.body.date_modified).toLocaleString();
          expect(actualDate).to.eql(expectedDate);
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
        });
    });

    const requiredFields = ['note_name', 'folder_id'];

    requiredFields.forEach(field => {
      it(`respond with 400 and '${field} is missing'`, () => {
        const newNote = {
          id: 1,
          note_name: 'Test Note',
          content: 'Test Content',
          folder_id: 1
        };

        delete newNote[field];

        return supertest(app)
          .post('/api/notes')
          .send(newNote)
          .expect(400, {
            error: { message: `Missing ${field} in request body` }
          });
      });
    });
  });

  describe('GET /notes/:note_id', () => {
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

      it('responds with 200 and the found note', () => {
        const noteId = 3;
        const expectedNote = testNotes[noteId - 1];

        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(200, expectedNote);
      });
    });

    context('Given the database is empty', () => {
      it(`responds with 404 and 'Note doesn't exist' if invalid id`, () => {
        const noteId = 3;

        return supertest(app)
          .get(`/api/notes/${noteId}`)
          .expect(404, {
            error: { message: `Note doesn't exist` }
          });
      });
    });
  });

  describe('DELETE /notes/:note_id', () => {
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

      it(`responds with 204 and 'No Content'`, () => {
        const idToDelete = 3;
        const expectedNotes = testNotes.filter(note => note.id !== idToDelete);

        return supertest(app)
          .delete(`/api/notes/${idToDelete}`)
          .expect(204)
          .then(() => {
            return supertest(app)
              .get('/api/notes')
              .expect(expectedNotes);
          });
      });
    });

    context('Given the database is empty', () => {
      it(`responds with 404 and 'Note doesn't exist'`, () => {
        const idToDelete = 3;

        return supertest(app)
          .delete(`/api/notes/${idToDelete}`)
          .expect(404, {
            error: { message: `Note doesn't exist` }
          });
      });
    });
  });
});