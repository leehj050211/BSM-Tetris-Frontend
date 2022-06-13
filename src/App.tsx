import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import { io } from 'socket.io-client';
import Match from './components/match';
import Game from './components/game';
const socket = io('http://localhost:3000', {
    transports: ['websocket']
});

function App() {
    const [username, setUsername] = React.useState<string>('');
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path={"/game"} element={<Game socket={socket} username={username} setUsername={setUsername} />}></Route>
                    <Route path={"/"} element={<Match socket={socket} username={username} setUsername={setUsername} />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
