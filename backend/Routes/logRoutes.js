const express = require('express');
const router = express.Router();
const AgentRun = require('../models/AgentRun');

// POST /api/log — agents send their run data here
router.post('/log', async (req, res) => {
  try {
    const { agentId, action, input, output, cost, latencyMs, success, errorMessage } = req.body;

    const run = new AgentRun({
      agentId,
      action,
      input,
      output,
      cost,
      latencyMs,
      success,
      errorMessage,
    });

    await run.save();

    res.status(201).json({ message: 'Run logged', run });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs — fetch recent runs
router.get('/logs', async (req, res) => {
  try {
    const runs = await AgentRun.find().sort({ timestamp: -1 }).limit(100);
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;