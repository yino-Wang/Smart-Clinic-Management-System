import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { fetchHealth } from './api/health'

function App() {
  const [data, setData] = useState<any>(null);

  useEffect( () => {
    fetchHealth().then( res => {
      console.log("Health status:", res);
      setData(res);
    }).catch( err => {
      console.error("Error fetching health status:", err);
    });
  }, []);


  return (
   <div style={{ padding: '20px' }}>
     <h1>ClinicFlow Web</h1>
     <p>Health Status: {data ? data.status : 'Loading...'}</p>
     <pre>{JSON.stringify(data, null, 2)}</pre>
   </div>
  )
}

export default App
