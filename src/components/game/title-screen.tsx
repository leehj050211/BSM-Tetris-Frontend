import React from "react";
import { Socket } from "socket.io-client";
import axios, { AxiosPromise, AxiosError } from 'axios';
import { ViewRankingType } from "../../types/view-ranking";

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
    const [myRanking, setMyRanking] = React.useState<ViewRankingType>();

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        (async () => {
            try {
                setMyRanking((await getMyRanking()).data);
                setIsLogin(true);
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status == 401) {
                    setIsLogin(false);
                }
            }
        })();


        socket.on('error', data => {
            if (data == 'Existing username') {
                return alert('해당 닉네임의 유저가 이미 있습니다.');
            }
            alert(data);
        });
    }

    const getMyRanking = (): AxiosPromise<ViewRankingType> => {
        return axios.get('/api/ranking/my', {withCredentials: true}); 
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

    const getMyRankingEl = (): JSX.Element => {
        if (myRanking?.rank) {
            return (
                <div>
                    <p>{myRanking?.rank}위 {myRanking?.nickname}</p>
                    <p>Tick: {myRanking?.tick} Level: {myRanking?.level}</p>
                </div>
            );
        } else {
            return (
                <div>
                    <p>랭킹 기록이 없습니다</p>
                </div>
            );
        }
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
            <div className="my-rank">{
                isLogin?
                getMyRankingEl():
                (<div>
                    <p>랭킹서비스를 이용하기위해 로그인이 필요합니다</p>
                    <a className="oauth-bsm" href="https://bssm.kro.kr/oauth/login?clientId=e2ea87b3&redirectURI=https://tetris.bssm.kro.kr/api/user/oauth/bsm">
                        <img src="/images/bsm-icon.png" alt="bsm-icon"/>
                        <span>BSM 계정으로 계속</span>
                    </a>
                </div>)
            }</div>
        </div>
    );
}

export default TitleScreen