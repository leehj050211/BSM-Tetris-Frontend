import React from "react";
import { Socket } from "socket.io-client";
import * as game from '../util/game';
import { User } from "../types/user";
import { useNavigate } from "react-router-dom";

interface PropsType {
    socket: Socket,
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>
}
const BOARD_ROWS = 10;
const BOARD_COLS = 20;
const BLOCK_SIZE = 20;

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

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        playerCanvasRef[props.username] = canvasRefs.current[0];

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
                        <canvas ref={newCanvasRef}></canvas>
                        <p>{nickname}</p>
                    </li>
                );
            }));

            setTimeout(() => {
                Object.keys(playerCanvasRef).forEach(key => {
                    canvasRefs.current.forEach(ref => {
                        if (ref != playerCanvasRef[key]) {
                            return;
                        }
                        const ctx = ref.current?.getContext('2d');
                        if (ctx) {
                            // 캔버스 크기 계산
                            ctx.canvas.width = BOARD_ROWS * BLOCK_SIZE;
                            ctx.canvas.height = BOARD_COLS * BLOCK_SIZE;

                            // 블럭 크기 변경
                            ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
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
            console.log(data.nickname, data.tick);
            const ctx = playerCanvasCtx[data.nickname];
            game.draw(ctx, data.board);
        });

        socket.on('game:softdrop', data => {
            console.log(data.nickname, data.tick);
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
        console.log(event.key)
        switch (event.key) {
            case "ArrowLeft": {
                socket.emit('game', {
                    action: 'move',
                    data: 'left'
                });
                break;
            }
            case "ArrowRight": {
                socket.emit('game', {
                    action: 'move',
                    data: 'right'
                });
                break;
            }
            case "ArrowDown": {
                socket.emit('game', {
                    action: 'move',
                    data: 'down'
                });
                break;
            }
        }
    }

    return (
        <div className="game">
            <div>
                <canvas ref={canvasRefs.current[0]}></canvas>
                <input 
                    readOnly 
                    ref={controllerRef} 
                    onKeyDown={gameKeyDownHandler}
                />
                <p>{props.username}</p>
            </div>
            <ul className="game--player-list">{playerListEl}</ul>
        </div>
    );
}

export default Game;