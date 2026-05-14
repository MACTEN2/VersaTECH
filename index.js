const fs = require('fs');

// --- CONFIGURATION ---
const DB_PATH = './data/tickets.json';
const KB_PATH = './data/knowledge_base.json';
const STATS_PATH = './docs/stats.log';


// --- HELPER FUNCTIONS (The "Tools") ---

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function readKB() {
    return JSON.parse(fs.readFileSync(KB_PATH, 'utf8'));
}

// Ensure the stats file exists so it doesn't crash later
if (!fs.existsSync('./docs')) fs.mkdirSync('./docs');

// --- FEATURE FUNCTIONS (The "Logic") ---

/**
 * FEATURE: Knowledge Base Suggestion Engine
 */
function getKBSuggestion(ticketId) {
    const tickets = readDB();
    const kb = readKB();
    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) {
        console.log(`❌ Error: Ticket #${ticketId} not found.`);
        return null;
    }

    // Search KB for a solution that matches the category or keyword
    const suggestion = kb.find(entry => 
        entry.category === ticket.category || 
        ticket.issue_description.toLowerCase().includes(entry.issue_keyword)
    );

    if (suggestion) {
        console.log(`\n💡 [KB SUGGESTION for Ticket #${ticketId}]:`);
        console.log(`Recommended Steps: ${suggestion.solution}\n`);
        return suggestion.solution;
    } else {
        console.log(`\n🔍 No matching KB article found for Ticket #${ticketId}.\n`);
        return null;
    }
}

/**
 * FEATURE: Resolve Ticket with Protocol Checks
 */
function resolveTicket(ticketId, category, steps) {
    let tickets = readDB();
    let ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) return;

    // Protocol Check: Categorization
    const validCategories = ["Hardware", "Software", "Network"];
    if (!validCategories.includes(category)) {
        return console.error(`❌ Protocol Error: '${category}' is not valid.`);
    }

    // Protocol Check: Documentation Length
    if (steps.length < 20) {
        return console.error("❌ Protocol Error: Documentation too short.");
    }

    ticket.category = category;
    ticket.steps_taken = steps;
    ticket.status = "Resolved";
    ticket.resolution_code = "FIXED_PERMANENT";

    writeDB(tickets);
    
    // Log stats for the final report
    const logEntry = `[${new Date().toISOString()}] Ticket #${ticketId} Resolved. Category: ${category}\n`;
    fs.appendFileSync(STATS_PATH, logEntry);

    console.log(`✅ Success: Ticket #${ticketId} resolved.`);
}

// --- TEST SUITE (Run this to verify) ---

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API Route: Get all tickets
app.get('/api/tickets', (req, res) => {
    res.json(readDB());
});

// API Route: Get KB Suggestion
app.get('/api/kb/:id', (req, res) => {
   const getKBSuggestion = (ticketIssue) => {
    try {
        const kb = JSON.parse(fs.readFileSync('./data/knowledge_base.json', 'utf8'));
        const issueLower = ticketIssue.toLowerCase();
        
        const match = kb.find(entry => 
            entry.keywords.some(kw => issueLower.includes(kw))
        );

        return match ? match.solution : "No specific KB found. Standard diagnostic: Check connectivity and restart hardware.";
    } catch (err) {
        return "KB Engine Offline.";
    }
};
});

// API Route: Resolve Ticket
app.post('/api/resolve', (req, res) => {
    const { id, category, steps } = req.body;
    resolveTicket(id, category, steps);
    res.json({ message: "Success" });
});

app.listen(PORT, () => {
    console.log(`🚀 IT Simulator Backend running on http://localhost:${PORT}`);
});