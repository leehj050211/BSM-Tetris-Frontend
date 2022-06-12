import React from "react";
import { Socket } from "socket.io-client";
import { User } from "../types/user";

interface PropsType {
    socket: Socket
}

const Match: React.FC<PropsType> = (props: PropsType) => {
    const { socket } = props;
    const [users, setUsers] = React.useState<User[]>([]);
    const [ready, setReady] = React.useState<boolean>(false);
    const [playerListEl, setPlayerListEl] = React.useState<JSX.Element[]>([]);
    React.useEffect(() => {
        init();
    }, []);

    React.useEffect(() => {
        setPlayerListEl(() => users.map((user, i) => (<li key={i}>{user.nickname}</li>)));
    }, [users]);

    const init = () => {
        const nickname = String(prompt('닉네임을 입력해주세요'));
        socket.emit('join', {nickname});

        socket.on('join', data => {
            console.log(data.users.map((user: string) => ({nickname: user})));
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