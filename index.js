const express = require('express');
const app = express();
const port = 80;

app.get('/', (req, res) => {
  res.send(`Grzyb Wielki, date: ${(new Date()).toUTCString()}`);
});

app.listen(port, () => {
  console.log(`Grzyb app listening on port ${port}`);
});
