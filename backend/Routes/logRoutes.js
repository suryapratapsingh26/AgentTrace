const express = require('express');
const router = express.Router();
const axios = require('axios');
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

    // Broadcast to all connected dashboard clients in real time
    req.io.emit('newRun', run);

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

// POST /api/logs/:id/analyze — trigger AI analysis for a specific failed run
router.post('/logs/:id/analyze', async (req, res) => {
  try {
    const run = await AgentRun.findById(req.params.id);

    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    // If we've already analyzed this run before, return the cached result
    if (run.aiAnalysis) {
      return res.json({
        analysis: run.aiAnalysis,
        similar_past_failures: run.similarPastFailures,
        cached: true,
      });
    }

    // Call the AI service
    const aiResponse = await axios.post('http://localhost:8000/analyze-failure', {
      agentId: run.agentId,
      action: run.action,
      errorMessage: run.errorMessage || 'No error message provided',
    });

    const { analysis, similar_past_failures } = aiResponse.data;

    // Cache the result on the run document
    run.aiAnalysis = analysis;
    run.similarPastFailures = similar_past_failures;
    await run.save();

    res.json({ analysis, similar_past_failures, cached: false });
  } catch (err) {
    console.error('Error analyzing failure:', err.message);
    res.status(500).json({ error: 'Failed to analyze this run' });
  }
});

module.exports = router;