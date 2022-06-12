import React from 'react';
import logo from './logo.svg';
import './App.css';
import { io } from 'socket.io-client';
import Match from './components/match';
const socket = io('http://localhost:3000', {
    transports: ['websocket']
});

function App() {
  return (
    <div className="App">
      <Match socket={socket} />
    </div>
  );
}

export default App;
