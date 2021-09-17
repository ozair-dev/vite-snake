import React, { useState, useEffect } from 'react'
import './App.css'
import logo from './logo.svg';
import Name from './components/Name' 
import Game from './components/Game'
function App() {
  
  return (
    <div className="App">
      <Name />
      <Game />
    </div>
  )
}

export default App
