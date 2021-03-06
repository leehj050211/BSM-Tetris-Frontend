import React from "react";
import { Socket } from "socket.io-client";
import { User } from "../../types/user";
import MyRanking from "../ranking/my-ranking";

interface PropsType {
    socket: Socket,
    user: User,
    setUser: React.Dispatch<React.SetStateAction<User>>,
    setPageMode: React.Dispatch<React.SetStateAction<string>>
}

const TitleScreen: React.FC<PropsType> = (props: PropsType) => {
    const { socket, user, setUser, setPageMode } = props;
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
        const username = user.isLogin? user.username: inputRef.current?.value;
        if (typeof username == 'undefined') {
            return alert('닉네임 설정 중에 문제가 발생하였습니다.');
        }
        socket.emit('join', {username: username});
        
        socket.on('room:join', (data: {username: string}) => {
            setUser(prev => ({
                ...prev,
                username: data.username
            }));
            setPageMode('match');
        });
    }

    return (
        <div className="title">
            <ul className="game-help-box">
                <li>Left: ←, Right: →</li>
                <li>Soft Drop: ↓</li>
                <li>Hard Drop: space</li>
                <li>Rotate Left: z</li>
                <li>Rotate Right: x</li>
                <li>Hold: c</li>
            </ul>
            <h1>BSM Tetris</h1>
            <br />
            <form onSubmit={confirmUsername}>
                {
                    user.isLogin?
                    null:
                    (<input
                        ref={inputRef}
                        name="username"
                        type="text"
                        placeholder="닉네임 입력"
                        required
                    />)
                }
                <button>게임 시작</button>
            </form>
            <MyRanking user={user} setUser={setUser} />
        </div>
    );
}

export default TitleScreen