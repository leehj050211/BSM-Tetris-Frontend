import React from "react";

interface PropsType {
    username: string
    ranking: number
    canvasRef: React.RefObject<HTMLCanvasElement>
}

const PlayerScreen: React.FC<PropsType> = (props: PropsType) => {
    return (
        <li key={props.username}>
            <div className='game--other-player-screen'>
                <div className='game--canvas-wrap'>
                    <canvas className='game--screen' ref={props.canvasRef}></canvas>
                    <p className='game--player-username'>{props.username}</p>
                </div>
            </div>
        </li>
    );
}

export default PlayerScreen;