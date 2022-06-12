import React from "react";
import { Socket } from "socket.io-client";
import * as game from '../util/game';
import { User } from "../types/user";

interface PropsType {
    socket: Socket
}
const BOARD_ROWS = 10;
const BOARD_COLS = 20;
const BLOCK_SIZE = 20;

const Game: React.FC<PropsType> = (props: PropsType) => {
    const { socket } = props;
    const [start, setStart] = React.useState<boolean>(false);
    const [playerListEl, setPlayerListEl] = React.useState<JSX.Element[]>([]);
    const canvasRefs = React.useRef<React.RefObject<HTMLCanvasElement>[]>([React.createRef()]);
    const [playerCanvasRef, setPlayerCanvasRef] = React.useState<{
        [index: string]: React.RefObject<HTMLCanvasElement>
    }>({});
    const playerCanvasCtx: {
        [index: string]: CanvasRenderingContext2D
    } = {};

    // React.useEffect(() => {
    //     setPlayerListEl((prev) => [
    //         ...prev,
    //         ...users.filter(user => !playerCanvasRef[user.nickname])
    //             .map((user: User, i: React.Key) => {
    //                 if (playerCanvasRef[user.nickname]) {
                        
    //                 }
    //                 const newCanvasRef = React.useRef<HTMLCanvasElement>(null);
    //                 setPlayerCanvasRef(prev => {
    //                     prev[user.nickname] = newCanvasRef;
    //                     return prev;
    //                 });
    //                 return (
    //                     <li key={i}>
    //                         <canvas ref={newCanvasRef}></canvas>
    //                         <p>{user.nickname}</p>
    //                     </li>
    //                 );
    //             })
    //     ])
    // }, users);

    React.useEffect(() => {
        init();
    }, []);
    const init = () => {
        socket.on('game:info', data => {
            setPlayerListEl(() => data.users.map((nickname: string, i: number) => {
                const newCanvasRef = React.createRef<HTMLCanvasElement>();
                canvasRefs.current[i] = newCanvasRef;
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
                            ctx.canvas.width = BOARD_COLS * BLOCK_SIZE;
                            ctx.canvas.height = BOARD_ROWS * BLOCK_SIZE;

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
            console.log('start')
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
    }

    return (
        <div className="game">
            <ul className="game--player-list">{playerListEl}</ul>
        </div>
    );
}

export default Game;