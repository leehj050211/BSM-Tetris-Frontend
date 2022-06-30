import React from "react";
import { Socket } from "socket.io-client";
import MyRanking from "../ranking/myranking";

interface PropsType {
    socket: Socket,
    isLogin: boolean,
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>,
    setPageMode: React.Dispatch<React.SetStateAction<string>>,
    setUsername: React.Dispatch<React.SetStateAction<string>>
}

const TitleScreen: React.FC<PropsType> = (props: PropsType) => {
    const { socket, isLogin, setIsLogin, setPageMode, setUsername } = props;
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        socket.on('error', data => {
            if (data == 'Existing username') {
                return alert('해당 닉네임의 유저가 이미 있습니다.');
            }
            alert(data);
        });
    }

    const confirmUsername = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const username = inputRef.current?.value;
        if (typeof username == 'undefined') {
            return alert('닉네임 설정 중에 문제가 발생하였습니다.');
        }
        socket.emit('join', {username: username});
        
        socket.on('room:join', (data: {username: string}) => {
            setUsername(() => data.username);
            setPageMode('match');
        });
    }

    return (
        <div className="title">
            <h1>BSM Tetris</h1>
            <form onSubmit={confirmUsername}>
                <input
                    ref={inputRef}
                    name="username"
                    type="text"
                    placeholder=""
                    required
                />
                <button>게임 시작</button>
            </form>
            <MyRanking isLogin={isLogin} setIsLogin={setIsLogin} />
        </div>
    );
}

export default TitleScreen