import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import GameMain from './components/game/main';
import RankingScreen from './components/ranking/ranking';

function App() {
    return (
        <div className="App dark">
            <BrowserRouter>
                <Routes>
                    <Route path={"/"} element={<GameMain />}></Route>
                    <Route path={"/ranking"} element={<RankingScreen />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
