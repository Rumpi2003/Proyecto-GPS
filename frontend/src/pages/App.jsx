import { useState } from 'react'
import { useApi } from '../services/useApi';
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import '../App.css'

function App() {
  const { data, loading, error } = useApi('/status');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div>
        <h1>{data?.message}</h1>
      </div>
    </div>
  );
}

export default App
