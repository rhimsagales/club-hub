const express = require('express');
const cors = require('cors'); // <== add this
const { createClub } = require('./firebase-functions');

const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(cors()); // <== add this line to enable CORS


// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

app.use(express.json());

// Route to handle club creation
app.post('/api/create-club', createClub);

app.get('/', (req, res) => {
    res.send('ClubHub API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
