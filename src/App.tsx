import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import GameMain from './components/game/main';
import Header from './components/header';
import RankingScreen from './components/ranking/ranking';
import { User } from './types/user';

function App() {
    const [user, setUser] = React.useState<User>({
        isLogin: false,
        username: '',
        usercode: 0
    });

    return (
        <div className="App dark">
            <BrowserRouter>
                <Header user={user} setUser={setUser} />
                <Routes>
                    <Route
                        path={"/"}
                        element={
                            <GameMain user={user} setUser={setUser} />
                        }>
                    </Route>
                    <Route
                        path={"/ranking"}
                        element={
                            <RankingScreen user={user} setUser={setUser} />
                        }>
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
