const assert = require('assert');

const BASE_URL = 'http://localhost:3001';

// We store our test functions in a dynamic array so the runner can count them automatically
const testSuite = [
    {
        name: "Test Case 1: Ingesting New Valid Ticket",
        fn: async (context) => {
            const telemetryPayload = {
                user: "Marcus Vance",
                category: "Network",
                priority: "Critical",
                issue: "Unable to connect to secure assets, connection keeps dropping on the office VPN."
            };

            const postResponse = await fetch(`${BASE_URL}/api/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(telemetryPayload)
            });

            assert.strictEqual(postResponse.status, 201, "❌ Reset Failure: Backend should return status 201 for creation.");
            
            const createdTicket = await postResponse.json();
            console.log("   Server Accepted Payload. Generated Object ID:", createdTicket.id);
            
            assert.ok(createdTicket.id, "❌ Schema Failure: Ticket object is missing an assigned database ID.");
            assert.strictEqual(createdTicket.user, "Marcus Vance", "❌ Data Mismatch: User field corrupted during database save.");
            
            // Pass the generated ID to the next tests via the shared context object
            context.testTicketId = createdTicket.id;
            context.issueText = telemetryPayload.issue;
        }
    },
    {
        name: "Test Case 2: Verification of KB AI-Tailored Pattern Matcher",
        fn: async (context) => {
            const kbQueryUrl = `${BASE_URL}/api/kb?issue=${encodeURIComponent(context.issueText)}`;
            const kbResponse = await fetch(kbQueryUrl);
            
            assert.strictEqual(kbResponse.status, 200, "KB lookup endpoint returned error status.");
            const kbData = await kbResponse.json();
            
            console.log(`   AI Engine Verification Log Output:`);
            console.log(`   👉 "${kbData.suggestion}"`);
            
            // Robust validation: Ensure the engine actually found the specific VPN/Network playbook
            const foundTailoredPlaybook = kbData.suggestion.includes("GlobalProtect") || kbData.suggestion.includes("flushdns");
            
            assert.ok(foundTailoredPlaybook, "❌ Engine failed to return a specific, keyword-tailored playbook solution.");
        }
    },
    {
        name: "Test Case 3: Finalizing Incident & Archiving Entry",
        fn: async (context) => {
            if (!context.testTicketId) throw new Error("Context Missing: Test Case 1 must run first to generate a target ID.");

            const resolutionPayload = {
                id: context.testTicketId,
                category: "Network",
                steps: "Flushed the local DNS cache, cycled the network interface card, and successfully re-authenticated the user session via the VPN client."
            };

            const resolveResponse = await fetch(`${BASE_URL}/api/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(resolutionPayload)
            });

            assert.strictEqual(resolveResponse.status, 200, "❌ Protocol Failure: Server rejected valid resolution structural requirements.");
            
            const resolveData = await resolveResponse.json();
            assert.strictEqual(resolveData.message, "Success", "❌ Handshake Failure: Server didn't respond with confirmation string.");
            console.log(`   Success: Ticket #${context.testTicketId} marked as RESOLVED.`);
        }
    },
    {
        name: "Test Case 4: Live Telemetry Metrics Verification",
        fn: async (context) => {
            const response = await fetch(`${BASE_URL}/api/metrics`);
            assert.strictEqual(response.status, 200, "❌ Metrics Failure: API returned error status.");
            
            const metrics = await response.json();
            console.log("   Current System Metrics:", metrics);
            
            assert.ok(metrics.hasOwnProperty('activeTickets'), "❌ Schema Mismatch: Missing activeTickets key.");
            assert.ok(metrics.hasOwnProperty('criticalTickets'), "❌ Schema Mismatch: Missing criticalTickets key.");
            assert.ok(metrics.hasOwnProperty('resolvedTickets'), "❌ Schema Mismatch: Missing resolvedTickets key.");
        }
    },
   {
        name: "Test Case 5: AI Engine Low-Confidence Fallback Execution",
        fn: async (context) => {
            const gibberishIssue = "Unrecognized anomalies detected on terminal widget XYZ-999.";
            const kbQueryUrl = `${BASE_URL}/api/kb?issue=${encodeURIComponent(gibberishIssue)}`;
            
            const kbResponse = await fetch(kbQueryUrl);
            assert.strictEqual(kbResponse.status, 200, "KB fallback endpoint failed to respond.");
            
            const kbData = await kbResponse.json();
            console.log(`   Fallback Engine Verification Log Output:`);
            console.log(`   👉 "${kbData.suggestion}"`);
            
            // Aligned validation: Look for the actual string your backend serves up on a miss
            const hitFallbackSafetyNet = kbData.suggestion.includes("No specific KB found") || kbData.suggestion.includes("Standard diagnostic");
            
            assert.ok(hitFallbackSafetyNet, "❌ Engine failed to trigger its safe fallback protocol for unknown inputs.");
        }
    }
];

// --- STATIC RUNNER ENGINE ---
async function runAutomationTestSuite() {
    const totalTests = testSuite.length; // Dynamic calculation of total count
    let passedCount = 0;
    const sharedContext = {}; // Allows tests to pass IDs along safely

    console.log("====================================================");
    console.log(`🚀 Starting VersaTECH Automated Test Suite...`);
    console.log(`📊 Total Registered Tests to Execute: ${totalTests}`);
    console.log("====================================================");

    for (let i = 0; i < totalTests; i++) {
        const currentTest = testSuite[i];
        console.log(`\n🏃 [${i + 1}/${totalTests}] Running: ${currentTest.name}`);
        console.log(`----------------------------------------------------`);
        
        try {
            await currentTest.fn(sharedContext);
            passedCount++;
            console.log(`🟢 PASSED: ${currentTest.name}`);
        } catch (error) {
            console.error(`💥 CRASHED: ${currentTest.name}`);
            console.error(`❌ Reason: ${error.message}\n`);
            
            console.log("====================================================");
            console.log(`🚫 SIMULATION HALTED Early [${passedCount}/${totalTests} Passed]`);
            console.log("====================================================");
            process.exit(1);
        }
    }

    // Final Success Metrics Summary Banner
    console.log(`\n====================================================`);
    console.log(`🥇 TEST SUITE COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Summary: Passed ${passedCount} out of ${totalTests} total tests.`);
    console.log(`====================================================\n`);
}

// Execute the automation sequence
runAutomationTestSuite();