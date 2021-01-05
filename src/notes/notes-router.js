const express = require('express');
const path = require('path');
const xss = require('xss');
const NotesService = require('./notes-service');

const serializeNote = note => ({
  id: note.id,
  note_name: xss(note.note_name),
  content: xss(note.content),
  date_modified: note.date_modified,
  folder_id: note.folder_id
});

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db');

    NotesService.getAllNotes(db)
      .then(notes => {
        const serializedNotes = notes.map(note => serializeNote(note));

        res.json(serializedNotes);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const db = req.app.get('db');
    const { note_name, content, folder_id } = req.body;
    const newNote = { note_name, folder_id };

    for(const [key, value] of Object.entries(newNote)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing ${key} in request body` }
        });
      }
    }

    newNote.content = content;

    NotesService.insertNote(db, newNote)
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const db = req.app.get('db');
    const id = req.params.note_id;

    NotesService.getById(db, id)
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    const db = req.app.get('db');
    const id = req.params.note_id;

    NotesService.deleteNote(db, id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });




module.exports = notesRouter;