require('dotenv').config();
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('AgentLens backend is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});