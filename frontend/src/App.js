import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const socket = io('http://localhost:5000');

function App() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/logs')
      .then((res) => {
        setRuns(res.data);
      })
      .catch((err) => {
        console.error('Error fetching logs:', err);
      });

    socket.on('newRun', (newRun) => {
      setRuns((prevRuns) => [newRun, ...prevRuns]);
    });

    return () => {
      socket.off('newRun');
    };
  }, []);

  // Derived stats
  const totalRuns = runs.length;
  const successCount = runs.filter((r) => r.success).length;
  const successRate = totalRuns > 0 ? ((successCount / totalRuns) * 100).toFixed(1) : 0;
  const avgLatency =
    totalRuns > 0 ? Math.round(runs.reduce((sum, r) => sum + (r.latencyMs || 0), 0) / totalRuns) : 0;
  const totalCost = runs.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(4);

  // Chart data: last 20 runs, oldest to newest, latency over time
  const chartData = [...runs]
    .slice(0, 20)
    .reverse()
    .map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString(),
      latency: r.latencyMs,
    }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">AgentTrace</h1>
        <p className="text-gray-500 mb-6">Real-time observability for AI agents</p>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm text-gray-500">Total runs</span>
            <p className="text-2xl font-semibold text-gray-900">{totalRuns}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm text-gray-500">Success rate</span>
            <p className="text-2xl font-semibold text-green-600">{successRate}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm text-gray-500">Avg latency</span>
            <p className="text-2xl font-semibold text-gray-900">{avgLatency}ms</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <span className="text-sm text-gray-500">Total cost</span>
            <p className="text-2xl font-semibold text-gray-900">${totalCost}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Latency — last 20 runs</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="latency" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Agent ID</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Action</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Cost</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Latency (ms)</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{run.agentId}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{run.action}</td>
                  <td className="px-4 py-3 text-sm">
                    {run.success ? (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Success
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">${run.cost}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{run.latencyMs}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(run.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;