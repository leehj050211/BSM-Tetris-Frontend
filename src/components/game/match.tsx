import React from "react";
import '../../styles/game/match.css';
import { Socket } from "socket.io-client";
import { User } from "../../types/user";

interface PropsType {
    socket: Socket,
    username: string,
    setPageMode: React.Dispatch<React.SetStateAction<string>>
}

const Match: React.FC<PropsType> = (props: PropsType) => {
    const { socket } = props;
    const [users, setUsers] = React.useState<User[]>([]);
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
        setPlayerListEl(() => users.map((user, i) => (<li key={i}><span className="match--player-name">{user.username}</span></li>)));
    }, [users]);
    
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
            setUsers(data.players.map((user: string) => ({username: user})));
        });
        
        socket.on('room:player-join', username => {
            setUsers((prev) => [
                ...prev,
                {username}
            ]);
        });
        
        socket.on('player:exit', username => {
            setUsers((prev) => {
                prev = prev.filter(user => user.username != username);
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
                <h4>{ready? '잠시 후 게임이 시작됩니다.': '플레이어를 기다리는 중...'} ({users.length}/{roomInfo.maxPlayers})</h4>
            </div>
            <ul className="match--player-list">
                {playerListEl}
            </ul>
        </div>
    );
}

export default Match;