const express = require('express');
const cors = require('cors'); // <== add this
const { createClub } = require('./firebase-functions');
const http = require('http');
const socketio = require('socket.io');
const admin = require('firebase-admin');
require('dotenv').config();



const app = express();
const path = require('path');
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 3000;




// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the path to the views folder
app.set('views', __dirname + '/views');

app.use(cors()); // <== add this line to enable CORS
// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

app.use(express.json());

app.get('/join-club', async (req, res) => {
    const clubs = await admin.database().ref('clubs').once('value');
    return res.render('recruit-members', { clubs: clubs.val() });
});

app.post('/api/recruit-member', async (req, res) => {
    const { club, name, email, number, section, yearLevel, studentId } = req.body;

    console.log('📥 Incoming request to /api/recruit-member');
    console.log('Request body:', req.body);

    // Server-side validation
    if (!club || !name || !email || !number || !section || !yearLevel || !studentId) {
        console.warn('⚠️ Validation failed: Missing field(s)');
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        console.log(`🔍 Looking for club with name: "${club}"`);

        const clubsSnap = await admin.database().ref('clubs')
            .orderByChild('clubName')
            .equalTo(club)
            .once('value');

        if (!clubsSnap.exists()) {
            console.warn('❌ Club not found');
            return res.status(404).json({ success: false, message: 'Club not found.' });
        }

        const clubsData = clubsSnap.val();
        console.log('✅ Club(s) found:', clubsData);

        const clubKeys = Object.keys(clubsData);
        const clubKey = clubKeys[0];
        console.log('🗝️ Using club key:', clubKey);

        const clubRef = admin.database().ref('clubs').child(clubKey);

        const clubData = clubsData[clubKey];
        console.log('📄 Existing club data:', clubData);

        // Initialize members array or empty if none
        let members = Array.isArray(clubData.members) ? clubData.members : [];

        console.log('👥 Current members:', members);

        const newMember = {
            name,
            email,
            number,
            section,
            yearLevel,
            studentId,
            pending: true,           // mark as pending since it's a recruitment
            role: 'Pending Member',  // default role, you can customize
            submittedAt: Date.now()
        };

        console.log('➕ Adding new member:', newMember);

        members.push(newMember);

        // Update the 'members' array in the database
        await clubRef.update({ members });

        console.log('✅ Successfully updated members');

        return res.json({
            success: true,
            message: 'Application submitted successfully and is pending approval.'
        });
    } catch (err) {
        console.error('❗ Error adding member:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});



app.get('/student-dashboard/:clubId', async (req, res) => {
    const clubIdEncoded = req.params.clubId;
    const decoded = Buffer.from(clubIdEncoded, 'base64').toString('utf-8');
    const clubName = decoded.replace(/-/g, ' ');

    const clubData = await admin.database().ref('clubs').child(clubName).once('value');
    if (!clubData.exists()) {
        return res.status(404).send('Club not found');
    }

    return res.render('student-dashboard', { club: clubData.val()});
    


});

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





const { CohereClientV2 } = require('cohere-ai');
const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

app.post('/api/generate-tasks', async (req, res) => {
  const { clubName, clubType, description } = req.body;

  if (!clubName) {
    console.log('Missing club name in request');
    return res.status(400).json({ success: false, message: 'Missing club name.' });
  }

  if (!clubType || !description) {
    console.log('Missing required club info fields');
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required club information: clubType and description are needed.' 
    });
  }

  try {
    const prompt = `You are an assistant for student clubs. Given the following club info, generate exactly 4 actionable tasks for club members to help the club achieve its goals.

Club Name: ${clubName}
Type: ${clubType}
Description: ${description}

Respond ONLY with a numbered list (1. ... 2. ... 3. ... 4. ...) of tasks, no extra text.`;

    console.log('Prompt sent to AI:', prompt);

    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    console.log('Full AI response:', JSON.stringify(response, null, 2));

    const contentArray = response.message.content;
    if (!contentArray || !Array.isArray(contentArray)) {
      console.log('Unexpected response format, content missing or not an array');
      return res.status(500).json({ success: false, message: 'Unexpected AI response format.' });
    }

    const aiText = contentArray.map(part => part.text).join('').trim();
    console.log('Extracted AI text:', aiText);

    const tasks = aiText.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line) || line.startsWith('-'))
      .map(line => line.replace(/^[-\d.\s]+/, '').trim())
      .filter(Boolean);

    if (tasks.length === 0) {
      console.log('AI returned no actionable tasks');
      return res.status(200).json({ success: true, tasks: [], message: 'AI did not return any tasks. Please check your club information.' });
    }

    const clubsSnap = await admin.database().ref('clubs').orderByChild('clubName').equalTo(clubName).once('value');
    if (!clubsSnap.exists()) {
      console.log(`Club not found in DB: ${clubName}`);
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    const clubKeys = Object.keys(clubsSnap.val());
    const clubKey = clubKeys[0];
    const clubRef = admin.database().ref('clubs').child(clubKey);

    await clubRef.update({ clubTask: tasks });
    console.log(`Updated clubTask for clubKey ${clubKey} with tasks`);

    return res.json({ success: true, tasks });

  } catch (err) {
    console.error('Error generating tasks:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
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

// Accept member route
app.post('/api/accept-member', async (req, res) => {
    const { name, email, role, clubName } = req.body;
    if (!name || !email || !role || !clubName) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    try {
        // Find club key by club name
        const clubsSnap = await admin.database().ref('clubs').orderByChild('clubName').equalTo(clubName).once('value');
        if (!clubsSnap.exists()) {
            return res.status(404).json({ success: false, message: 'Club not found.' });
        }
        const clubKeys = Object.keys(clubsSnap.val());
        const clubKey = clubKeys[0];
        const clubRef = admin.database().ref('clubs').child(clubKey);
        const clubData = clubsSnap.val()[clubKey];
        let members = Array.isArray(clubData.members) ? clubData.members : [];
        // Find member by name and email
        const idx = members.findIndex(m => m.name === name && m.email === email);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }
        // Update pending to false and add role
        members[idx].pending = false;
        members[idx].role = role;
        await clubRef.update({ members });
        return res.json({ success: true, message: 'Member accepted and updated.' });
    } catch (err) {
        console.error('Error accepting member:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Reject member route
app.post('/api/reject-member', async (req, res) => {
    const { name, email, clubName } = req.body;
    if (!name || !email || !clubName) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    try {
        // Find club key by club name
        const clubsSnap = await admin.database().ref('clubs').orderByChild('clubName').equalTo(clubName).once('value');
        if (!clubsSnap.exists()) {
            return res.status(404).json({ success: false, message: 'Club not found.' });
        }
        const clubKeys = Object.keys(clubsSnap.val());
        const clubKey = clubKeys[0];
        const clubRef = admin.database().ref('clubs').child(clubKey);
        const clubData = clubsSnap.val()[clubKey];
        let members = Array.isArray(clubData.members) ? clubData.members : [];
        // Find member by name and email
        const idx = members.findIndex(m => m.name === name && m.email === email);
        if (idx === -1) {
            return res.status(404).json({ success: false, message: 'Member not found.' });
        }
        // Remove from members
        members.splice(idx, 1);
        await clubRef.update({ members });
        return res.json({ success: true, message: 'Member rejected and removed.' });
    } catch (err) {
        console.error('Error rejecting member:', err);
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

        const listenerTwo = clubRef.on('child_changed', (snap) => {
            socket.emit('club-data', snap.val());
        });
        // Clean up listener on disconnect
        socket.on('disconnect', () => {
            clubRef.off('value', listener);
            clubRef.off('child_changed', listenerTwo);
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
