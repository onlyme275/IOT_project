import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
    const [data, setData] = useState({ water: 0, raw: 0 });
    const [status, setStatus] = useState('Disconnected');
    const [nodeOnline, setNodeOnline] = useState(false);
    const [lastUpdate, setLastUpdate] = useState('Never');
    const [logs, setLogs] = useState([{ type: 'System', msg: 'Initializing...', time: new Date().toLocaleTimeString() }]);

    const addLog = (type, msg) => {
        setLogs(prev => [{ type, msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
    };

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/water-level/');
            if (response.ok) {
                const result = await response.json();
                setData(result);
                setLastUpdate(new Date().toLocaleTimeString());
                setNodeOnline(true);
                setStatus('Online');
                addLog('Data', `Received: ${result.water}% (Raw: ${result.raw})`);
            } else {
                setNodeOnline(false);
                setStatus('Online (No Data)');
            }
        } catch (error) {
            setStatus('Disconnected');
            setNodeOnline(false);
            addLog('Error', 'Failed to fetch from Django API');
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const percent = Math.min(100, Math.max(0, data.water));
    const offset = 283 - (percent / 100) * 283;

    return (
        <div className="dashboard-container">
            <header>
                <div className="logo">
                    <span className="icon">💧</span>
                    <h1>HydroGuard</h1>
                </div>
                <div className={`status-badge ${status.toLowerCase().includes('online') ? 'connected' : 'disconnected'}`}>
                    <span className="dot"></span>
                    <span className="status-text">{status}</span>
                </div>
            </header>

            <section className="metrics-grid">
                <div className="glass-card main-level">
                    <div className="card-header">
                        <h3>Water Level</h3>
                        <span className="trend-icon">≈</span>
                    </div>
                    <div className="level-display">
                        <div className="circular-progress">
                            <svg viewBox="0 0 100 100">
                                <circle className="bg" cx="50" cy="50" r="45"></circle>
                                <circle
                                    className="fg"
                                    cx="50" cy="50" r="45"
                                    style={{ strokeDashoffset: offset }}
                                ></circle>
                            </svg>
                            <div className="value-container">
                                <span className="value">{percent}</span><small>%</small>
                            </div>
                        </div>
                    </div>
                    <div className="meta-data">
                        <div className="meta-item">
                            <span className="label">Raw ADC</span>
                            <span className="value">{data.raw}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Last Update</span>
                            <span className="value">{lastUpdate}</span>
                        </div>
                    </div>
                </div>

                <div className="side-panel">
                    <div className="glass-card status-card">
                        <h3>System Health</h3>
                        <div className="health-item">
                            <span>ESP32 Node</span>
                            <span className={`status-pill ${nodeOnline ? 'online' : 'offline'}`}>
                                {nodeOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="glass-card console-card">
                        <h3>Live Feed</h3>
                        <div className="log-container">
                            {logs.map((log, i) => (
                                <div key={i} className={`log-entry ${log.type.toLowerCase()}`}>
                                    <span className="log-time">[{log.time}]</span>
                                    <strong>{log.type}:</strong> {log.msg}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
