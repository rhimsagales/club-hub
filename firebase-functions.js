require('dotenv').config();
const fs = require('fs');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(Buffer.from(process.env.SERVICE_ACC_KEY, 'base64').toString('utf-8'))),
        databaseURL: 'https://clubhub-99dbe-default-rtdb.asia-southeast1.firebasedatabase.app/'
    });
}

const db = admin.database();

/**
 * Creates a new club in the Firebase Realtime Database under the 'clubs' node.
 * @param {object} req - Express request object (expects club data in req.body)
 * @param {object} res - Express response object
 */
function createClub(req, res) {
    console.log('Received createClub request');
    console.log('Request body:', req.body);
    const clubData = req.body;
    if (!clubData || !clubData.clubName || !clubData.username || !clubData.clubPassword) {
        console.log('Validation failed: missing required fields');
        return res.status(400).json({ error: 'Missing required club fields.' });
    }
    // Check if club name or username already exists
    db.ref('clubs').child(clubData.clubName).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                res.status(409).json({ error: 'Club name already exists.' });
                return null;
            }
            // Check for username existence in all clubs
            return db.ref('clubs').orderByChild('username').equalTo(clubData.username).once('value');
        })
        .then(usernameSnap => {
            if (!usernameSnap) return; // Already responded above
            if (usernameSnap && usernameSnap.numChildren() > 0) {
                res.status(409).json({ error: 'Username already exists.' });
                return null;
            }
            // Create club if both checks pass
            return db.ref('clubs').child(clubData.clubName).set(clubData)
                .then(() => {
                    res.status(201).json({ success: true, clubId: clubData.clubName });
                })
                .catch(error => {
                    console.error('Error creating club:', error);
                    if (!res.headersSent) res.status(500).json({ error: error.message });
                });
        })
        .catch(error => {
            console.error('Error checking club existence:', error);
            if (!res.headersSent) res.status(500).json({ error: error.message });
        });
}

module.exports = { createClub };