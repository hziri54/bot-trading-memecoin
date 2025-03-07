const fs = require('fs');
const path = require('path');

const SESSION_FILE = path.join(__dirname, '../data/sessions.json');

// ✅ Lire les sessions depuis le fichier JSON
function loadSessions() {
    if (!fs.existsSync(SESSION_FILE)) return {};
    return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
}

// ✅ Sauvegarder les sessions dans le fichier JSON
function saveSessions(sessions) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

// ✅ Ajouter une session
function addSession(userId, data) {
    let sessions = loadSessions();
    sessions[userId] = data;
    saveSessions(sessions);
}

// ✅ Récupérer une session
function getSession(userId) {
    let sessions = loadSessions();
    return sessions[userId] || null;
}

// ✅ Supprimer une session
function deleteSession(userId) {
    let sessions = loadSessions();
    if (sessions[userId]) {
        delete sessions[userId];
        saveSessions(sessions);
    }
}

module.exports = { addSession, getSession, deleteSession };
