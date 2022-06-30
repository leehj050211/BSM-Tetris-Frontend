import axios, { AxiosError, AxiosPromise } from "axios";
import React from "react";
import { Link } from 'react-router-dom';
import '../styles/header.css';
import { User } from "../types/user";
import { ReactComponent as GibHubSVG } from '../svg/github.svg';

interface PropsType {
    user: User,
    setUser: React.Dispatch<React.SetStateAction<User>>
}

const Header: React.FC<PropsType> = (props: PropsType)  => {
    const { user, setUser } = props;

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        (async () => {
            try {
                const userInfo = (await getUserInfo()).data;
                if (!userInfo.nickname) return;
                setUser({
                    usercode: userInfo.usercode,
                    username: userInfo.nickname,
                    isLogin: true
                });
            } catch (error) {
                if (error instanceof AxiosError && error.response?.status == 401) {
                    setUser(prev => ({...prev, isLogin: false}));
                }
            }
        })();
    }

    const getUserInfo = (): AxiosPromise<User> => {
        return axios.get('/api/user', {withCredentials: true}); 
    }

    return (
        <header>
            <nav>
                <div className="left-wrap">
                    <Link to="/">BSM Tetris</Link>
                </div>
                <div className="right-wrap">
                    <a href="https://github.com/leehj050211/BSM-Tetris-Frontend"><GibHubSVG className="header--github"/></a>
                    <Link to="/ranking">랭킹</Link>
                    {
                        user.isLogin?
                        (<a className="user-profile" href={`https://bssm.kro.kr/user/${user.usercode}`}>{user.username}</a>):
                        null
                    }
                </div>
            </nav>
        </header>
    );
}

export default Header;