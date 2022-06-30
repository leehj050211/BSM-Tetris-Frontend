import React from 'react';
import '../../styles/game/game.css';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../util/game';
import PlayerScreen from './player';
import { User } from '../../types/user';

interface PropsType {
    socket: Socket,
    user: User,
    setUser: React.Dispatch<React.SetStateAction<User>>
}

interface GameInfo {
    level: number,
    tickRate: number,
    tick: number
}

const GameComponent: React.FC<PropsType> = (props: PropsType) => {
    const { user } = props;
    const game = new Game();
    const { socket } = props;
    const navigate = useNavigate();
    const [start, setStart] = React.useState<boolean>(false);
    const [gameInfo, setGameInfo] = React.useState<GameInfo>({
        level: 0,
        tickRate: 0,
        tick: 0
    });
    const [playerListEl, setPlayerListEl] = React.useState<JSX.Element[]>([]);
    const controllerRef = React.useRef<HTMLInputElement>(null);
    const canvasRefs = React.useRef<React.RefObject<HTMLCanvasElement>[]>([React.createRef<HTMLCanvasElement>()]);
    const [playerCanvasRef, setPlayerCanvasRef] = React.useState<{
        [index: string]: React.RefObject<HTMLCanvasElement>
    }>({});

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        playerCanvasRef[user.username] = canvasRefs.current[0];

        window.addEventListener('resize', () => {
            if (canvasRefs.current[0].current) {
                game.resizeScreen(canvasRefs.current[0].current, user.username);
            }
        });

        socket.on('game:info', data => {
            setGameInfo({
                level: data.level,
                tickRate: data.tickRate,
                tick: data.tick
            });

            const players = data.players.filter((username: string) => username !== user.username);
            setPlayerListEl(() => players.map((username: string, i: number) => {
                const newCanvasRef = React.createRef<HTMLCanvasElement>();
                canvasRefs.current[i+1] = newCanvasRef;
                setPlayerCanvasRef(prev => {
                    prev[username] = newCanvasRef;
                    return prev;
                });
                return <PlayerScreen 
                            key={username}
                            username={username}
                            ranking={0}
                            canvasRef={newCanvasRef}
                        />
            }));

            setTimeout(() => {
                Object.keys(playerCanvasRef).forEach(username => {
                    canvasRefs.current.forEach(ref => {
                        if (ref !== playerCanvasRef[username]) {
                            return;
                        }
                        if (!ref.current?.parentElement?.clientWidth) {
                            return;
                        }
                        // 캔버스 컨텍스트 참조
                        const ctx = ref.current.getContext('2d');
                        if (ctx) {
                            game.initData(username);
                            game.setCtx(username, ctx);
                            game.resizeScreen(ref.current, username);
                        }
                    })
                })
            }, 1);
        });

        socket.on('player:exit', (username: string) => {
            setPlayerListEl(prev => prev.filter(player => player.key != username));
            setPlayerCanvasRef(prev => {
                delete prev[username];
                return prev;
            });
            game.userExit(username);
        });
        
        socket.on('game:start', () => {
            setStart(() => true);
        });

        socket.on('game:spawn', data => {
            game.spawnPiece(data.username, data.pieceId, data.x, data.y);
        });
        
        socket.on('game:softdrop', data => {
            if (data.tick !== gameInfo.tick) {
                setGameInfo(prev => ({...prev, tick: data.tick}));
            }
            game.softdrop(data.username, data.y);
        });

        socket.on('game:stack', data => {
            if (data.tick !== gameInfo.tick) {
                setGameInfo(prev => ({...prev, tick: data.tick}));
            }
            game.stack(data.username, data.board);
        });
        
        socket.on('game:move', data => {
            game.move(data.username, data.x, data.y);
        });

        socket.on('game:rotate', data => {
            game.rotatePiece(data.username, data.direction);
        });

        socket.on('game:change', data => {
            game.changePiece(data.username, data.holdPieceId, data.pieceId, data.pieceX, data.pieceY);
        });

        socket.on('game:clear', data => {
            game.clear(data.username, data.y);
        });

        socket.on('game:gameover', data => {
            if (data.tick !== gameInfo.tick) {
                setGameInfo(prev => ({...prev, tick: data.tick}));
            }
            game.stack(data.username, data.board);
            game.ranking(data.username, data.ranking);
        });

        socket.on('game:level', data => {
            setGameInfo({
                level: data.level,
                tickRate: data.tickRate,
                tick: data.tick
            });
        });
        
        socket.on('error', data => {
            if (data === `You didn't joined the game`) {
                return navigate('/');
            }
            alert(data);
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
            case ' ': {
                socket.emit('game', {
                    action: 'harddrop'
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
            <ul className='game--info-box'>
                <li>Level: {gameInfo.level}</li>
                <li>Tick: {gameInfo.tick}</li>
                <li>TickRate: {gameInfo.tickRate}</li>
            </ul>
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
                <p className='game--player-username'>{user.username}</p>
            </div>
            <ul className='game--player-list'>{playerListEl}</ul>
        </div>
    );
}

export default GameComponent;