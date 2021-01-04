function makeNotesArray() {
  return [
    {
      id: 1,
      note_name: 'Test Note 1',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      folder_id: 1,
      date_modified: "2021-01-04T21:56:58.604Z"
    },
    {
      id: 2,
      note_name: 'Test Note 2',
      content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      folder_id: 2,
      date_modified: "2021-01-04T21:56:58.604Z"
    },
    {
      id: 3,
      note_name: 'Test Note 3',
      content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      folder_id: 3,
      date_modified: "2021-01-04T21:56:58.604Z"
    }
  ];
}

module.exports = {
  makeNotesArray
};