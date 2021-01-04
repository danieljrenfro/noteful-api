const FoldersService = {
  getAllFolders(knex) {
    return knex
      .from('noteful_folders')
      .select('*');
  },
  getById(knex, id) {
    return knex
      .select('*')
      .from('noteful_folders')
      .where('id', id)
      .first();
  },
  insertFolder(knex, newFolder) {
    return knex
      .insert(newFolder)
      .into('noteful_folders')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteFolder(knex, id) {
    return knex
      .from('noteful_folders')
      .where({ id })
      .delete();
  },
  updateFolder(knex, id, updatedFolder) {
    return knex
      .from('noteful_folders')
      .where({ id })
      .update(updatedFolder);
  }
};

module.exports = FoldersService;