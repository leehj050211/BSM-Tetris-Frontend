import React from "react";
import axios, { AxiosPromise, AxiosError } from 'axios';
import { ViewRankingType } from "../../types/view-ranking";
import MyRanking from "./myranking";
import '../../styles/ranking/ranking.css';

const RankingScreen: React.FC = () => {
    const [isLogin, setIsLogin] = React.useState<boolean>(false);
    const [rankingList, setRankingList] = React.useState<ViewRankingType[]>();

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        (async () => {
            try {
                setRankingList((await getRankingList()).data);
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status == 401) {
                    setIsLogin(false);
                }
            }
        })();
    }

    const getRankingList = (): AxiosPromise<ViewRankingType[]> => {
        return axios.get('/api/ranking', {withCredentials: true}); 
    }

    const rankingEl = (): JSX.Element[] | JSX.Element => {
        if (rankingList?.length) {
            return rankingList?.map((ranking: ViewRankingType, i: number) => (
                <li>
                    <span className="ranking--rank">{i+1}위</span>
                    <span className="ranking--username">{ranking.nickname}</span>
                    <span>{ranking.level} Level</span>
                    <span>{ranking.tick} Tick</span>
                </li>
            ));
        } else {
            return (
                <li>
                    <p>랭킹 기록이 없습니다</p>
                </li>
            );
        }
    }

    return (
        <div className="ranking-main">
            <ul className="ranking-list">
                {rankingEl()}
            </ul>
            <MyRanking isLogin={isLogin} setIsLogin={setIsLogin} />
        </div>
    );
}

export default RankingScreen;