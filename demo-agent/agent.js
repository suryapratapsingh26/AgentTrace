const axios = require('axios');

const actions = ['fetch_weather', 'summarize_document', 'send_email', 'query_database', 'generate_report'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFakeRun() {
  const success = Math.random() > 0.2; // 80% success rate, 20% failure
  const action = randomChoice(actions);

  const run = {
    agentId: `agent-${Math.floor(Math.random() * 3) + 1}`, // agent-1, agent-2, or agent-3
    action,
    success,
    cost: parseFloat((Math.random() * 0.01).toFixed(4)),
    latencyMs: Math.floor(Math.random() * 800) + 100,
  };

  if (!success) {
    run.errorMessage = randomChoice([
      'Timeout while waiting for response',
      'Invalid input format',
      'Rate limit exceeded',
      'Connection refused by external API',
    ]);
  }

  return run;
}

async function sendRun() {
  const run = generateFakeRun();
  try {
    const res = await axios.post('http://localhost:5000/api/log', run);
    console.log('Logged run:', res.data.run.agentId, res.data.run.action, res.data.run.success ? '✅' : '❌');
  } catch (err) {
    console.error('Failed to log run:', err.message);
  }
}

// Send a new fake run every 3 seconds
setInterval(sendRun, 3000);

console.log('Demo agent started — sending fake runs every 3 seconds...');