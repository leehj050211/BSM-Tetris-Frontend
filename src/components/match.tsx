import React from "react";
import {useNavigate} from "react-router-dom";
import { Socket } from "socket.io-client";
import { User } from "../types/user";

interface PropsType {
    socket: Socket,
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>
}

const Match: React.FC<PropsType> = (props: PropsType) => {
    const { socket } = props;
    const navigate = useNavigate();
    const [users, setUsers] = React.useState<User[]>([]);
    const [ready, setReady] = React.useState<boolean>(false);
    const [playerListEl, setPlayerListEl] = React.useState<JSX.Element[]>([]);

    React.useEffect(() => {
        setPlayerListEl(() => users.map((user, i) => (<li key={i}>{user.nickname}</li>)));
    }, [users]);
    
    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        const nickname = String(prompt('닉네임을 입력해주세요'));
        props.setUsername(() => nickname);
        socket.emit('join', {nickname});

        socket.on('join', data => {
            setUsers(() => data.users.map((user: string) => ({nickname: user})));
        });
        
        socket.on('user:join', nickname => {
            setUsers((prev) => [
                ...prev,
                {nickname}
            ]);
        });
        
        socket.on('user:exit', nickname => {
            setUsers((prev) => {
                prev = prev.filter(user => user.nickname != nickname);
                return prev;
            });
        });

        socket.on('game:ready', data => {
            setReady(() => true);
            setTimeout(() => {
                navigate('game');
            }, 1500);
        });
    }

    return (
        <div className="match">
            <div className="match--stat-box">
                <p>{ready? '잠시 후 게임이 시작됩니다.': '플레이어를 기다리는 중...'} ({users.length}/4)</p>
                <ul className="match--player-list">
                    {playerListEl}
                </ul>
            </div>
        </div>
    );
}

export default Match;