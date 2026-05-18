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

// API Route: Get KB Suggestion (FIXED SYNTAX DISCREPANCY)
app.get('/api/kb', (req, res) => {
    try {
        const ticketIssue = req.query.issue;
        if (!ticketIssue) {
            return res.json({ suggestion: "No issue query provided for analysis." });
        }

        const kb = JSON.parse(fs.readFileSync(KB_PATH, 'utf8'));
        const issueLower = ticketIssue.toLowerCase();
        
        // Dynamic scan across keywords array
        const match = kb.find(entry => 
            entry.keywords && entry.keywords.some(kw => issueLower.includes(kw.toLowerCase()))
        );

        const suggestion = match ? match.solution : "No specific KB found. Standard diagnostic: Check connectivity and restart hardware.";
        res.json({ suggestion });
    } catch (err) {
        console.error("KB Engine Error:", err);
        res.status(500).json({ suggestion: "KB Engine Offline." });
    }
});

// API Route: Resolve Ticket
app.post('/api/resolve', (req, res) => {
    const { id, category, steps } = req.body;
    resolveTicket(id, category, steps);
    res.json({ message: "Success" });
});

// --- NEW TICKET INGESTION PROTOCOL ---
app.post('/api/tickets', (req, res) => {
    try {
        const { user, issue, priority, category } = req.body;
        
        // 1. Read existing tickets
        const ticketsPath = './data/tickets.json';
        const tickets = JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
        
        // 2. Generate a professional unique ID (increment highest existing ID)
        const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 101;
        
        // 3. Formulate the new ticket object
        const newTicket = {
            id: newId,
            user: user || "Unknown User",
            issue: issue || "No description provided.",
            priority: priority || "Low",
            category: category || "General IT"
        };
        
        // 4. Append and write back to flat-file database
        tickets.push(newTicket);
        fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2));
        
        // 5. Respond with the newly created ticket
        res.status(201).json(newTicket);
    } catch (err) {
        console.error("Ingestion Error:", err);
        res.status(500).json({ error: "Failed to log new enterprise ticket." });
    }
});

// --- LIVE METRICS PROTOCOL ---
// --- LIVE METRICS PROTOCOL ---
app.get('/api/metrics', (req, res) => {
    try {
        const ticketsPath = './data/tickets.json';
        let activeCount = 0;
        let criticalCount = 0;

        // Safely check and read tickets file
        if (fs.existsSync(ticketsPath)) {
            const tickets = JSON.parse(fs.readFileSync(ticketsPath, 'utf8'));
            activeCount = tickets.length;
            criticalCount = tickets.filter(t => t.priority === 'Critical').length;
        }
        
        // Safely check and read stats log file
        let resolvedCount = 0;
        const statsPath = './docs/stats.log';
        if (fs.existsSync(statsPath)) {
            const logContent = fs.readFileSync(statsPath, 'utf8');
            // Cleanly filter out empty spaces and look for the 'Resolved' keyword
            resolvedCount = logContent.split('\n').filter(line => line.trim() && line.includes('Resolved')).length;
        }

        // Return data cleanly with status 200
        res.status(200).json({
            activeTickets: activeCount,
            criticalTickets: criticalCount,
            resolvedTickets: resolvedCount
        });
    } catch (err) {
        console.error("Metrics Engine Error:", err);
        res.status(500).json({ error: "Failed to compile system metrics safely." });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 IT Simulator Backend running on http://localhost:${PORT}`);
});