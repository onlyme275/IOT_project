import { useEffect, useState } from 'react';

export default function Main() {
    const [statusMessage, setStatusMessage] = useState("");
    const [waterLevel, setWaterLevel] = useState(0);

    const fetchWaterLevel = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/get-water/');
            const data = await response.json();
            if (response.ok) {
                setWaterLevel(data.water);
            }
        } catch (error) {
            console.error('Error fetching water level:', error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchWaterLevel();

        // Setup polling every 5 seconds
        const interval = setInterval(fetchWaterLevel, 5000);

        return () => clearInterval(interval);
    }, []);

    // Calculate percentage for progress bar
    const waterPercentage = Math.min(Math.round((waterLevel / 4095) * 100), 100);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4 font-sans text-white">
            <h1 className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-300">
                Nexus Water Monitor
            </h1>

            <div className="w-full max-w-lg">
                {/* Water Level Section */}
                <div className="bg-slate-800/50 backdrop-blur-md p-10 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center">
                    <h2 className="text-2xl font-semibold mb-8 text-blue-200">System Fluid Dynamics</h2>

                    <div className="relative w-40 h-80 bg-slate-700 rounded-full overflow-hidden border-4 border-slate-600 shadow-inner">
                        <div
                            className="absolute bottom-0 w-full bg-linear-to-t from-blue-600 to-cyan-400 transition-all duration-1000 ease-in-out"
                            style={{ height: `${waterPercentage}%` }}
                        >
                            <div className="absolute top-0 left-0 w-full h-4 bg-white/20 blur-sm animate-pulse"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold drop-shadow-md">{waterPercentage}%</span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <p className="text-slate-400 text-sm">Raw ADC: <span className="text-blue-300 font-mono text-lg">{waterLevel}</span></p>
                        <p className="mt-3 text-slate-400 text-xs tracking-widest uppercase opacity-50">
                            Polling Active • 5s Cycle
                        </p>
                    </div>
                </div>
            </div>

            <footer className="mt-12 text-slate-500 text-sm tracking-widest uppercase">
                ESP32 Nexus Series • ADC 34
            </footer>
        </div>
    );
}
