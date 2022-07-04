import React from "react";
import '../../styles/game/main.css';
import { io } from 'socket.io-client';
import TitleScreen from "./title-screen";
import Match from "./match";
import Game from "./game";
import { User } from "../../types/user";

const socket = io('/', {
    transports: ['websocket']
});

interface PropsType {
    user: User,
    setUser: React.Dispatch<React.SetStateAction<User>>
}

const GameMain: React.FC<PropsType> = (props: PropsType) => {
    React.useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        }
    }, []);
    const { user, setUser } = props;
    const [pageMode, setPageMode] = React.useState<string>('title');
    
    const rederPage = (pageMode: string): JSX.Element => {
        switch (pageMode) {
            case 'title': {
                return (<TitleScreen
                            socket={socket}
                            user={user}
                            setUser={setUser}
                            setPageMode={setPageMode}
                        />);
            }
            case 'match': {
                return (<Match
                            socket={socket}
                            user={user}
                            setPageMode={setPageMode}
                        />);
            }
            case 'game': {
                return (<Game 
                            socket={socket}
                            user={user}
                            setUser={setUser}
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