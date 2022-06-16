import React from 'react';
import '../../styles/game/game.css';
import { Socket } from 'socket.io-client';
import * as game from '../../util/game';
import { useNavigate } from 'react-router-dom';

interface PropsType {
    socket: Socket,
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>
}
const BOARD_ROWS = 10;
const BOARD_COLS = 20;

const Game: React.FC<PropsType> = (props: PropsType) => {
    const { socket } = props;
    const navigate = useNavigate();
    const [start, setStart] = React.useState<boolean>(false);
    const [playerListEl, setPlayerListEl] = React.useState<JSX.Element[]>([]);
    const controllerRef = React.useRef<HTMLInputElement>(null);
    const canvasRefs = React.useRef<React.RefObject<HTMLCanvasElement>[]>([React.createRef<HTMLCanvasElement>()]);
    const [playerCanvasRef, setPlayerCanvasRef] = React.useState<{
        [index: string]: React.RefObject<HTMLCanvasElement>
    }>({});
    const playerCanvasCtx: {
        [index: string]: CanvasRenderingContext2D
    } = {};
    const playerBoards: {
        [index: string]: number[][];
    } = {};

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        playerCanvasRef[props.username] = canvasRefs.current[0];

        window.addEventListener('resize', () => {
            if (canvasRefs.current[0].current) {
                game.resize(
                    canvasRefs.current[0].current,
                    playerCanvasCtx[props.username],
                    playerBoards[props.username]
                );
            }
        });

        socket.on('game:info', data => {
            const users = data.users.filter((nickname: string) => nickname != props.username);
            setPlayerListEl(() => users.map((nickname: string, i: number) => {
                const newCanvasRef = React.createRef<HTMLCanvasElement>();
                canvasRefs.current[i+1] = newCanvasRef;
                setPlayerCanvasRef(prev => {
                    prev[nickname] = newCanvasRef;
                    return prev;
                });
                return (
                    <li key={i}>
                        <div className='game--other-player-screen'>
                            <canvas className='game--screen' ref={newCanvasRef}></canvas>
                            <p className='game--player-nickname'>{nickname}</p>
                        </div>
                    </li>
                );
            }));

            setTimeout(() => {
                Object.keys(playerCanvasRef).forEach(key => {
                    canvasRefs.current.forEach(ref => {
                        if (ref != playerCanvasRef[key]) {
                            return;
                        }
                        if (!ref.current?.parentElement?.clientWidth) {
                            return;
                        }
                        // 캔버스 컨텍스트 참조
                        const ctx = ref.current.getContext('2d');
                        if (ctx) {
                            // 보드 배열 초기화
                            playerBoards[key] = Array.from(
                                {length: BOARD_COLS}, () => Array.from(
                                    {length: BOARD_ROWS}, () => 0
                                )
                            );
                            game.resize(ref.current, ctx, playerBoards[key]);
                            playerCanvasCtx[key] = ctx;
                        }
                    })
                })
                setStart(() => true);
            }, 100);
        });

        socket.on('game:start', data => {
            console.log('start');
        });

        socket.on('game:spawn', data => {
            // console.log(data.nickname, data.tick, data.piece);
        });

        socket.on('game:softdrop', data => {
            const ctx = playerCanvasCtx[data.nickname];
            game.draw(ctx, data.board);
        });
        
        socket.on('game:move', data => {
            const ctx = playerCanvasCtx[data.nickname];
            game.draw(ctx, data.board);
        });

        socket.on('game:change', data => {
            const ctx = playerCanvasCtx[data.nickname];
            game.draw(ctx, data.board);
        });
        
        socket.on('error', data => {
            if (data == `You didn't joined the game`) {
                navigate('/');
            }
        });
    }

    React.useEffect(() => {
        if (!start) return;
        controllerRef.current?.focus();
    }, [start]);

    const gameKeyDownHandler = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowLeft': {
                socket.emit('game', {
                    action: 'move',
                    data: 'left'
                });
                break;
            }
            case 'ArrowRight': {
                socket.emit('game', {
                    action: 'move',
                    data: 'right'
                });
                break;
            }
            case 'ArrowDown': {
                socket.emit('game', {
                    action: 'move',
                    data: 'down'
                });
                break;
            }
            case 'z': {
                socket.emit('game', {
                    action: 'rotate',
                    data: 'left'
                });
                break;
            }
            case 'x': {
                socket.emit('game', {
                    action: 'rotate',
                    data: 'right'
                });
                break;
            }
            case 'c': {
                socket.emit('game', {
                    action: 'change'
                });
                break;
            }
        }
    }

    return (
        <div 
            className='game'
            onClick={() => {
                if (!start) return;
                controllerRef.current?.focus();
            }}>
            <div className='game--player-screen'>
                <div className='game--canvas-wrap'>
                    <canvas className='game--screen' ref={canvasRefs.current[0]}></canvas>
                </div>
                <input
                    readOnly 
                    ref={controllerRef} 
                    onKeyDown={gameKeyDownHandler}
                    className='game--controller'
                />
                <p className='game--player-nickname'>{props.username}</p>
            </div>
            <ul className='game--player-list'>{playerListEl}</ul>
        </div>
    );
}

export default Game;