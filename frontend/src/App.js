import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">AgentTrace</h1>
        <p className="text-gray-500 mb-6">Real-time observability for AI agents</p>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4 inline-block">
          <span className="text-sm text-gray-500">Total runs</span>
          <p className="text-2xl font-semibold text-gray-900">{runs.length}</p>
        </div>

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