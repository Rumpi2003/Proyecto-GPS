import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import '../App.css'
import GoogleMap from '../components/GoogleMap';

function Map() {
  return (
    <div>
      <h1>Proyecto GPS</h1>
      <GoogleMap />
    </div>
  );
}

export default Map;

