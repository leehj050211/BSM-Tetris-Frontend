import React from "react";
import '../../styles/game/match.css';
import { Socket } from "socket.io-client";
import { User } from "../../types/user";
import { Players } from "../../types/players";

interface PropsType {
    socket: Socket,
    user: User,
    setPageMode: React.Dispatch<React.SetStateAction<string>>
}

const Match: React.FC<PropsType> = (props: PropsType) => {
    const { socket } = props;
    const [players, setPlayers] = React.useState<Players[]>([]);
    const [roomInfo, setRoomInfo] = React.useState<{
        roomId: string,
        maxPlayers: number
    }>({
        roomId: '',
        maxPlayers: 0
    });
    const [ready, setReady] = React.useState<boolean>(false);
    const [playerListEl, setPlayerListEl] = React.useState<JSX.Element[]>([]);

    React.useEffect(() => {
        setPlayerListEl(() => players.map((user, i) => (<li key={i}><span className="match--player-name">{user.username}</span></li>)));
    }, [players]);
    
    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        socket.emit('room:info');
        socket.on('room:info', data => {
            setRoomInfo({
                roomId: data.roomId,
                maxPlayers: data.maxPlayers
            });
            setPlayers(data.players.map((player: string) => ({username: player})));
        });
        
        socket.on('room:player-join', username => {
            setPlayers((prev) => [
                ...prev,
                {username}
            ]);
        });
        
        socket.on('player:exit', username => {
            setPlayers((prev) => {
                prev = prev.filter(player => player.username != username);
                return prev;
            });
        });

        socket.on('game:ready', data => {
            setReady(() => true);
            setTimeout(() => {
                props.setPageMode('game');
            }, 1500);
        });

        socket.on('error', data => {
            if (data == `You didn't joined the game`) {
                return props.setPageMode('match');
            }
            alert(data);
        });
    }

    return (
        <div className="match">
            <div className="match--stat-box">
                <h4>{ready? '잠시 후 게임이 시작됩니다.': '플레이어를 기다리는 중...'} ({players.length}/{roomInfo.maxPlayers})</h4>
            </div>
            <ul className="match--player-list">
                {playerListEl}
            </ul>
        </div>
    );
}

export default Match;