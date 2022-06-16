import React from 'react';
import '../../styles/game/game.css';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../util/game';

interface PropsType {
    socket: Socket,
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>
}

const GameComponent: React.FC<PropsType> = (props: PropsType) => {
    const game = new Game();
    const { socket } = props;
    const navigate = useNavigate();
    const [start, setStart] = React.useState<boolean>(false);
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
        playerCanvasRef[props.username] = canvasRefs.current[0];

        window.addEventListener('resize', () => {
            if (canvasRefs.current[0].current) {
                game.resizeScreen(canvasRefs.current[0].current, props.username);
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
                Object.keys(playerCanvasRef).forEach(username => {
                    canvasRefs.current.forEach(ref => {
                        if (ref != playerCanvasRef[username]) {
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
        
        socket.on('game:start', data => {
            setStart(() => true);
        });

        socket.on('game:spawn', data => {
            game.spawnPiece(data.username, data.pieceId, data.x, data.y);
        });
        
        socket.on('game:softdrop', data => {
            game.softdrop(data.username, data.y);
        });

        socket.on('game:stack', data => {
            game.stack(data.username, data.y);
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

export default GameComponent;