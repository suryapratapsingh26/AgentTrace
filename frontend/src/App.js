import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    // Initial load
    axios
      .get('http://localhost:5000/api/logs')
      .then((res) => {
        setRuns(res.data);
      })
      .catch((err) => {
        console.error('Error fetching logs:', err);
      });

    // Listen for real-time updates
    socket.on('newRun', (newRun) => {
      setRuns((prevRuns) => [newRun, ...prevRuns]);
    });

    // Cleanup listener when component unmounts
    return () => {
      socket.off('newRun');
    };
  }, []);

  return (
    <div className="App">
      <h1>AgentLens</h1>
      <p>Total runs: {runs.length}</p>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Agent ID</th>
            <th>Action</th>
            <th>Success</th>
            <th>Cost</th>
            <th>Latency (ms)</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run._id}>
              <td>{run.agentId}</td>
              <td>{run.action}</td>
              <td>{run.success ? '✅' : '❌'}</td>
              <td>{run.cost}</td>
              <td>{run.latencyMs}</td>
              <td>{new Date(run.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;