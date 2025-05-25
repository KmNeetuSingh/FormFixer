const express = require('express');
const cors = require('cors');
const analyzeRoute = require("./routes/analyze");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', analyzeRoute);  // <-- Change here

app.get('/', (req, res) => res.send('FormFixer API Running'));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
