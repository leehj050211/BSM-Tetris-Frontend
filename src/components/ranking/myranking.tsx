import React from "react";
import axios, { AxiosPromise, AxiosError } from 'axios';
import { ViewRankingType } from "../../types/view-ranking";

interface PropsType {
    isLogin: boolean,
    setIsLogin: React.Dispatch<React.SetStateAction<boolean>>
}


const MyRanking: React.FC<PropsType> = (props: PropsType) => {
    const { isLogin, setIsLogin } = props;
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
    }

    const getMyRanking = (): AxiosPromise<ViewRankingType> => {
        return axios.get('/api/ranking/my', {withCredentials: true}); 
    }

    const myRankingEl = (): JSX.Element => {
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
        <div className="my-rank">{
            isLogin?
            myRankingEl():
            (<div>
                <p>랭킹서비스를 이용하기위해 로그인이 필요합니다</p>
                <a className="oauth-bsm" href="https://bssm.kro.kr/oauth/login?clientId=e2ea87b3&redirectURI=https://tetris.bssm.kro.kr/api/user/oauth/bsm">
                    <img src="/images/bsm-icon.png" alt="bsm-icon"/>
                    <span>BSM 계정으로 계속</span>
                </a>
            </div>)
        }</div>
    );
}

export default MyRanking;