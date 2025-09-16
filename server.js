const express = require('express');
const cors = require('cors'); // <== add this
const { createClub } = require('./firebase-functions');
const http = require('http');
const socketio = require('socket.io');
const admin = require('firebase-admin');

const app = express();
const path = require('path');
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3000;

app.use(cors()); // <== add this line to enable CORS
// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

app.use(express.json());

// Route to handle club creation
app.post('/api/create-club', createClub);

// Club login API for credential validation
app.post('/api/club-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false });
    try {
        // Search for club node with matching username and password
        const clubsSnap = await admin.database().ref('clubs').once('value');
        let foundClub = null;
        clubsSnap.forEach(clubSnap => {
            const club = clubSnap.val();
            if (club.username === username && club.clubPassword === password) {
                foundClub = { id: clubSnap.key, ...club };
            }
        });
        if (foundClub) {
            console.log('Found club:', foundClub);
            res.json({ success: true, clubId: foundClub.id, clubName: foundClub.clubName });
        } else {
            res.json({ success: false });
        }
    } catch (err) {
        res.json({ success: false });
    }
});

// Update club info/settings
app.post('/api/update-club', async (req, res) => {
    const { username, clubName, ...updates } = req.body;
    if (!username) return res.status(400).json({ success: false, error: 'Missing username.' });
    try {
        // Find club node by username
        const clubsSnap = await admin.database().ref('clubs').once('value');
        let clubId = null;
        let clubData = null;
        clubsSnap.forEach(clubSnap => {
            const club = clubSnap.val();
            if (club.username === username) {
                clubId = clubSnap.key;
                clubData = club;
            }
        });
        if (!clubId) return res.status(404).json({ success: false, error: 'Club not found.' });

        // If clubName is being updated and is different, move node
        if (clubName && clubName !== clubId) {
            // Check if new clubName already exists
            const newClubSnap = await admin.database().ref('clubs').child(clubName).once('value');
            if (newClubSnap.exists()) {
                return res.status(409).json({ success: false, error: 'New club name already exists.' });
            }
            // Create new node with updated data
            const newClubData = { ...clubData, ...updates, clubName };
            await admin.database().ref('clubs').child(clubName).set(newClubData);
            // Delete old node
            await admin.database().ref('clubs').child(clubId).remove();
            return res.json({ success: true, clubId: clubName });
        } else {
            // Regular update
            await admin.database().ref('clubs').child(clubId).update(updates);
            return res.json({ success: true, clubId } );
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create Event API
app.post('/api/create-event', async (req, res) => {
    const { clubName, eventName, eventType, eventDate, eventTime } = req.body;
    if (!clubName || !eventName || !eventType || !eventDate || !eventTime) {
        return res.status(400).json({ success: false, error: 'Missing event fields.' });
    }
    try {
        const clubRef = admin.database().ref('clubs').child(clubName);
        const clubSnap = await clubRef.once('value');
        if (!clubSnap.exists()) {
            return res.status(404).json({ success: false, error: 'Club not found.' });
        }
        const clubData = clubSnap.val();
        if (!Array.isArray(clubData.events)) clubData.events = [];
        clubData.events.push({ eventName, eventType, eventDate, eventTime });
        await clubRef.update({ events: clubData.events });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/', (req, res) => {
    res.send('ClubHub API is running');
});

// DELETE club route
app.delete('/api/delete-club', async (req, res) => {
    try {
        const { clubName } = req.body;
        if (!clubName) {
            return res.status(400).json({ success: false, message: 'Club name required.' });
        }
        // Firebase Admin SDK logic
        const clubRef = admin.database().ref('clubs');
        // Find club by name
        const snapshot = await clubRef.orderByChild('clubName').equalTo(clubName).once('value');
        if (!snapshot.exists()) {
            return res.status(404).json({ success: false, message: 'Club not found.' });
        }
        // Get club key
        const clubKey = Object.keys(snapshot.val())[0];
        // Remove club
        await clubRef.child(clubKey).remove();
        return res.json({ success: true });
    } catch (err) {
        console.error('Error deleting club:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Socket.io logic
io.of('/clubOwners').on('connection', (socket) => {
    socket.on('club-login', async ({ username }) => {
        // Find club node by username
        const clubsSnap = await admin.database().ref('clubs').once('value');
        let foundClub = null;
        clubsSnap.forEach(clubSnap => {
            const club = clubSnap.val();
            if (club.username === username) {
                foundClub = { id: clubSnap.key, ...club };
            }
        });
        if (!foundClub) {
            socket.emit('club-login-failed');
            return;
        }
        // Listen for changes to this club node
        const clubRef = admin.database().ref('clubs').child(foundClub.id);
        const listener = clubRef.on('value', (snap) => {
            socket.emit('club-data', snap.val());
        });
        // Clean up listener on disconnect
        socket.on('disconnect', () => {
            clubRef.off('value', listener);
        });
    });
});

io.of('/general').on('connection', (socket) => {
    admin.database().ref('clubs').on('value', (snap) => {
        socket.emit('all-clubs-data', snap.val());
    })
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
