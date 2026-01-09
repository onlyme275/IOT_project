import { useEffect, useState } from 'react';

export default function Main() {
    const [statusMessage, setStatusMessage] = useState("");

    const handleControl = async (command) => {
        setStatusMessage(`Sending ${command}...`);
        try {
            const response = await fetch('http://localhost:8000/api/run-iot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command: command })
            });
            const data = await response.json();
            if (response.ok) {
                setStatusMessage(data.message);
                alert("Success: " + data.message);
            } else {
                setStatusMessage("Error: " + data.message);
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            setStatusMessage("Failed to send command");
            alert("Failed to send command");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">IoT Device Control</h1>

            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md flex flex-col items-center">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Device Control (Pin 14)</h2>

                <div className="flex gap-6 w-full justify-center">
                    <button
                        onClick={() => handleControl("ON")}
                        className="flex-1 px-6 py-4 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition duration-300 shadow-md transform hover:scale-105 uppercase tracking-wider"
                    >
                        Turn ON
                    </button>
                    <button
                        onClick={() => handleControl("OFF")}
                        className="flex-1 px-6 py-4 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition duration-300 shadow-md transform hover:scale-105 uppercase tracking-wider"
                    >
                        Turn OFF
                    </button>
                </div>

                {statusMessage && (
                    <div className={`mt-6 p-3 rounded-md w-full text-center ${statusMessage.includes("Error") || statusMessage.includes("Failed") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {statusMessage}
                    </div>
                )}

                <div className="mt-8 text-sm text-gray-500 text-center">
                    <p>Controls ESP32 Pin D14 via MQTT</p>
                </div>
            </div>
        </div>
    );
}


