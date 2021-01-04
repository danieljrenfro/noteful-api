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
      });
  });

module.exports = notesRouter;