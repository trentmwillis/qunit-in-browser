const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('Hello world from a server!'));

module.exports = () => new Promise((resolve) => {

  const server = app.listen(3000, () => resolve(server));

});
