const mongoose = require('mongoose');

const AgentRunSchema = new mongoose.Schema({
  agentId: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  input: {
    type: mongoose.Schema.Types.Mixed,
  },
  output: {
    type: mongoose.Schema.Types.Mixed,
  },
  cost: {
    type: Number,
    default: 0,
  },
  latencyMs: {
    type: Number,
  },
  success: {
    type: Boolean,
    required: true,
  },
  errorMessage: {
    type: String,
  },
  aiAnalysis: {
    type: String,
    default: null,
  },
  similarPastFailures: {
    type: [String],
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AgentRun', AgentRunSchema);