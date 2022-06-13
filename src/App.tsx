import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import GameMain from './components/game/main';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <Routes>
                    <Route path={"/"} element={<GameMain />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
