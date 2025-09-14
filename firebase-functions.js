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
    db.ref('clubs').child(clubData.clubName).set(clubData)
        .then(() => {
            res.status(201).json({ success: true, clubId: clubData.clubName });
        })
        .catch(error => {
            console.error('Error creating club:', error);
            res.status(500).json({ error: error.message });
        });
}

module.exports = { createClub };