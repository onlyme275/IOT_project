import React, { useState, useEffect } from 'react';

const Dashboard = () => {
    const [data, setData] = useState({ water: 0, raw: 0 });
    const [status, setStatus] = useState('Disconnected');
    const [motorOn, setMotorOn] = useState(false);
    const [lastUpdate, setLastUpdate] = useState('Never');
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/water-level/');
            if (response.ok) {
                const result = await response.json();
                setData(prev => ({ ...prev, water: result.water }));
                setStatus('Online');
                setLastUpdate(new Date().toLocaleTimeString());
            }
        } catch (error) {
            setStatus('Disconnected');
        }
    };

    const sendCommand = async (command) => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/run-iot/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command }),
            });
            if (response.ok) {
                setMotorOn(command === 'ON');
            }
        } catch (error) {
            console.error('Failed to control motor:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    const waterLevel = Math.min(100, Math.max(0, data.water));

    const leds = [
        { label: 'RED', on: waterLevel > 20, color: 'bg-red-500', shadow: 'shadow-red-500/50', ring: 'ring-red-500/20' },
        { label: 'BLUE', on: waterLevel > 50, color: 'bg-blue-500', shadow: 'shadow-blue-500/50', ring: 'ring-blue-500/20' },
        { label: 'YELLOW', on: waterLevel > 80, color: 'bg-yellow-500', shadow: 'shadow-yellow-500/50', ring: 'ring-yellow-500/20' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-2xl">💧</span>
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                IoT Water Monitor
                            </h1>
                            <p className="text-slate-400 text-sm">System Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-800">
                        <div className={`w-3 h-3 rounded-full ${status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">{status}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Water Level Visualization */}
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                        <h3 className="text-slate-400 font-medium uppercase tracking-wider text-xs">Tank Level</h3>

                        <div className="relative w-48 h-48 rounded-full border-8 border-slate-800 p-2 overflow-hidden bg-slate-950 shadow-inner">
                            <div
                                className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-1000 ease-in-out shadow-[0_-10px_30px_rgba(59,130,246,0.5)]"
                                style={{ height: `${waterLevel}%` }}
                            >
                                <div className="absolute top-0 left-0 w-full h-4 bg-blue-300/30 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-bold z-10">{waterLevel}%</span>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            {leds.map((led, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full shadow-lg transition-all duration-500 ${led.on ? `${led.color} ${led.shadow} ring-4 ${led.ring}` : 'bg-slate-800'}`} />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{led.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls & Metrics */}
                    <div className="space-y-6">
                        {/* Motor Control Card */}
                        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-semibold text-lg">Motor Control</h3>
                                    <p className="text-sm text-slate-400">Pump Status: {motorOn ? 'Running' : 'Stopped'}</p>
                                </div>
                                <div className={`p-3 rounded-2xl ${motorOn ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                                    ⚙️
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => sendCommand('ON')}
                                    disabled={isLoading || motorOn}
                                    className={`py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${motorOn
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white'
                                        } ${isLoading ? 'opacity-50' : ''}`}
                                >
                                    {isLoading && !motorOn ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span>Start Pump</span>
                                    )}
                                </button>

                                <button
                                    onClick={() => sendCommand('OFF')}
                                    disabled={isLoading || !motorOn}
                                    className={`py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${!motorOn
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 text-white'
                                        } ${isLoading ? 'opacity-50' : ''}`}
                                >
                                    {isLoading && motorOn ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span>Stop Pump</span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800">
                                <p className="text-slate-500 text-xs mb-1 uppercase">Updated</p>
                                <p className="font-mono text-sm">{lastUpdate}</p>
                            </div>
                            <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800">
                                <p className="text-slate-500 text-xs mb-1 uppercase">Node IP</p>
                                <p className="font-mono text-sm">192.168.4.1</p>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="text-center text-slate-600 text-xs pt-8">
                    IoT Infrastructure powered by Django & ESP32 • {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;

