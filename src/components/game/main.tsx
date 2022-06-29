import React from "react";
import '../../styles/game/main.css';
import { io } from 'socket.io-client';
import TitleScreen from "./title-screen";
import Match from "./match";
import Game from "./game";

const socket = io('/', {
    transports: ['websocket']
});

const GameMain: React.FC = () => {
    const [pageMode, setPageMode] = React.useState<string>('title');
    const [isLogin, setIsLogin] = React.useState<boolean>(false);
    const [username, setUsername] = React.useState<string>('');
    
    const rederPage = (pageMode: string): JSX.Element => {
        switch (pageMode) {
            case 'title': {
                return (<TitleScreen
                            socket={socket}
                            isLogin={isLogin}
                            setIsLogin={setIsLogin}
                            setUsername={setUsername}
                            setPageMode={setPageMode}
                        />);
            }
            case 'match': {
                return (<Match
                            socket={socket}
                            username={username}
                            setPageMode={setPageMode}
                        />);
            }
            case 'game': {
                return (<Game 
                            socket={socket}
                            username={username}
                            setUsername={setUsername}
                        />);
            }
            default: {
                return (<h1>Error: Page Error</h1>);
            }
        }
    }

    return (
        <div className="game-main">
            {rederPage(pageMode)}
        </div>
    );
}

export default GameMain;