import React, { useState } from 'react';
import Papa from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AquariumTracker = () => {
  // State for daily logs 
  const [logs, setLogs] = useState([]);
  
  // State for authentication
  const [authenticated, setAuthenticated] = useState(false);

  // State for showing/hiding the add log form
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Handler for adding a new log entry
  const handleAddLog = (log) => {
    if (!authenticated) return; // Only add if authenticated
    
    setLogs([...logs, {
      ...log,
      date: new Date().toLocaleDateString('en-US'),
    }]);
  };

  // Calculate dosing recommendations based on latest log
  const latestLog = logs[logs.length - 1];
  const dosingRecs = calculateDosing(latestLog);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-bold mb-4">Aquarium Parameter Tracker</h1>
      
      {!authenticated && (
        <AuthPrompt onAuth={() => setAuthenticated(true)} />
      )}
      
      {authenticated && (
        <>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 mb-4"
          >
            {showAddForm ? 'Hide Form' : 'Add New Log'}
          </button>
          {showAddForm && <AddLogForm onSubmit={handleAddLog} />}
        </>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Parameter Trends</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={logs}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ph" stroke="#8884d8" />
            <Line type="monotone" dataKey="ammonia" stroke="#82ca9d" />
            <Line type="monotone" dataKey="nitrite" stroke="#ffc658" /> 
            <Line type="monotone" dataKey="nitrate" stroke="#ef843c" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Latest Dosing Recommendations</h2>
        {dosingRecs}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Log History</h2>
        <LogTable logs={logs} />
      </div>
      
    </div>
  );
};

// Component for the authentication prompt
const AuthPrompt = ({ onAuth }) => {
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === "tank123") {
      onAuth();
      setPassword("");
    } else {
      alert("Incorrect password. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <label>
        Password: 
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"  
        />
      </label>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 ml-2">
        Authenticate  
      </button>
    </form>
  );
};

// Component for the add log form 
const AddLogForm = ({ onSubmit }) => {
  const [ph, setPh] = useState("");
  const [ammonia, setAmmonia] = useState("");
  const [nitrite, setNitrite] = useState("");
  const [nitrate, setNitrate] = useState("");
  const [notes, setNotes] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newLog = {
      ph: Number(ph),
      ammonia: Number(ammonia), 
      nitrite: Number(nitrite),
      nitrate: Number(nitrate),
      notes,
    };
    
    onSubmit(newLog);
    
    // Reset form
    setPh("");
    setAmmonia("");
    setNitrite("");
    setNitrate("");
    setNotes("");
  };
  
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <h2 className="text-xl font-bold mb-4">New Log Entry</h2>
      <div className="mb-4">
        <label className="block">
          pH
          <input 
            type="number"
            step="0.1"
            value={ph}
            onChange={(e) => setPh(e.target.value)}
            className="border ml-2 p-2"
            required
          />
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block">
          Ammonia (ppm)
          <input
            type="number" 
            step="0.25"
            value={ammonia}
            onChange={(e) => setAmmonia(e.target.value)}
            className="border ml-2 p-2"
            required
          /> 
        </label>
      </div>
      
      <div className="mb-4"> 
        <label className="block">
          Nitrite (ppm)
          <input
            type="number"
            step="0.25" 
            value={nitrite}
            onChange={(e) => setNitrite(e.target.value)}
            className="border ml-2 p-2"
            required
          />
        </label>
      </div>
        
      <div className="mb-4">
        <label className="block">  
          Nitrate (ppm)
          <input
            type="number"
            value={nitrate} 
            onChange={(e) => setNitrate(e.target.value)}
            className="border ml-2 p-2"
            required 
          />
        </label>
      </div>
      
      <div className="mb-4">
        <label className="block">
          Notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)} 
            className="border ml-2 p-2"
          ></textarea>
        </label>
      </div>
        
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Submit
      </button>
    </form>
  );
};

// Component to display the log table
const LogTable = ({ logs }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left table-collapse">
        <thead>
          <tr>
            <th className="text-sm font-medium p-2 bg-gray-100">Date</th>
            <th className="text-sm font-medium p-2 bg-gray-100">pH</th>
            <th className="text-sm font-medium p-2 bg-gray-100">Ammonia</th>
            <th className="text-sm font-medium p-2 bg-gray-100">Nitrite</th>
            <th className="text-sm font-medium p-2 bg-gray-100">Nitrate</th>
            <th className="text-sm font-medium p-2 bg-gray-100">Notes</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{log.date}</td>
              <td className={`p-2 ${getAlertColor(log.ph, 6, 8)}`}>{log.ph}</td>
              <td className={`p-2 ${getAlertColor(log.ammonia, 0, 1)}`}>{log.ammonia}</td>  
              <td className={`p-2 ${getAlertColor(log.nitrite, 0, 0.5)}`}>{log.nitrite}</td>
              <td className={`p-2 ${getAlertColor(log.nitrate, 0, 20)}`}>{log.nitrate}</td>
              <td className="p-2">{log.notes}</td>
            </tr>
          ))}
        </tbody>  
      </table>
    </div>
  );
};

// Utility to get alert color based on range
const getAlertColor = (value, min, max) => {
  if (value < min || value > max) return "bg-red-200";
  return "";
};

// Utility to calculate dosing recs
const calculateDosing = (log) => {
  let recs = "";
  
  if (!log) return recs; // Guard against no logs
  
  if (log.ph < 6.5) {
    recs += "- Add Seachem Alkaline Buffer: 1/4 tsp (1.5g)\n";
  } else if (log.ph > 7.5) {
    recs += "- Add Seachem Acid Buffer: 1/8 tsp (0.75g)\n";
  } else {
    recs += "- Maintain pH, no adjustment needed\n";
  }
  
  if (log.ammonia > 0) {
    recs += "- Add Seachem Prime: 5mL (1 capful) per 50 gallons\n";
  }

  if (log.ammonia > 0.5) {
    recs += "- 50% water change recommended\n";
  }
  
  if (log.nitrite > 0) {
    recs += "- Add Seachem Stability: 5mL per 10 gallons on Days 1, 3, 7, 14\n";  
  }
  
  if (log.nitrate > 20) {
    recs += "- 20% water change recommended\n"; 
  }

  recs += "- Daily: Seachem Flourish Excel: 5mL (1 capful) per 50 gallons or 2 drops per gallon";
  
  return <pre className="p-4 bg-gray-100">{recs}</pre>;
};

export default AquariumTracker;