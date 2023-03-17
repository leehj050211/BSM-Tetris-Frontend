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

const keyInterval: {
  [index: string]: {
    interval: NodeJS.Timer,
    isPress: boolean
  }
} = {};

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
    (() => {
      playerCanvasRef[user.username] = canvasRefs.current[0];
      const playerCanvas = playerCanvasRef[user.username].current;
      if (!playerCanvas) return;
      // 캔버스 컨텍스트 참조
      const ctx = playerCanvas.getContext('2d');
      if (ctx) {
        game.initData(user.username);
        game.setCtx(user.username, ctx);
        game.resizeScreen(playerCanvas, user.username);
      }
      game.resizeScreen(playerCanvas, user.username);
    })();

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
      setPlayerListEl(() => {
        return players.map((username: string, i: number) => {
          return createPlayerScreen(username, i);
        });
      });
    });

    socket.on('room:player-join', (username: string) => {
      setPlayerListEl(prev => [
        ...prev,
        createPlayerScreen(username, canvasRefs.current.length - 1)
      ]);
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
      game.resetScreen(user.username);
    });

    socket.on('game:spawn', data => {
      game.spawnPiece(data.username, data.pieceId, data.x, data.y);
    });

    socket.on('game:softdrop', data => {
      if (data.tick !== gameInfo.tick) {
        setGameInfo(prev => ({ ...prev, tick: data.tick }));
      }
      game.softdrop(data.username, data.y);
    });

    socket.on('game:stack', data => {
      if (data.tick !== gameInfo.tick) {
        setGameInfo(prev => ({ ...prev, tick: data.tick }));
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
        setGameInfo(prev => ({ ...prev, tick: data.tick }));
      }
      if (data.username == user.username) {
        setStart(false);
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
      alert(data);
      return navigate('/');
    });
  }

  const createPlayerScreen = (username: string, i: number): JSX.Element => {
    const newCanvasRef = React.createRef<HTMLCanvasElement>();
    canvasRefs.current[i + 1] = newCanvasRef;
    setPlayerCanvasRef(prev => {
      prev[username] = newCanvasRef;
      return prev;
    });

    setTimeout(() => {
      if (!newCanvasRef.current?.parentElement?.clientWidth) {
        return;
      }
      // 캔버스 컨텍스트 참조
      const ctx = newCanvasRef.current.getContext('2d');
      if (ctx) {
        game.initData(username);
        game.setCtx(username, ctx);
        game.resizeScreen(newCanvasRef.current, username);
      }
    }, 10);

    return (
      <PlayerScreen
        key={username}
        username={username}
        ranking={0}
        canvasRef={newCanvasRef}
      />
    );
  }

  React.useEffect(() => {
    if (!start) return;
    controllerRef.current?.focus();
  }, [start]);

  const gameControll = (key: string): boolean => {
    switch (key) {
      case 'ArrowLeft': {
        socket.emit('game', {
          action: 'move',
          data: 'left'
        });
        return true;
      }
      case 'ArrowRight': {
        socket.emit('game', {
          action: 'move',
          data: 'right'
        });
        return true;
      }
      case 'ArrowDown': {
        socket.emit('game', {
          action: 'move',
          data: 'down'
        });
        return true;
      }
      case 'z': {
        socket.emit('game', {
          action: 'rotate',
          data: 'left'
        });
        return true;
      }
      case 'x': {
        socket.emit('game', {
          action: 'rotate',
          data: 'right'
        });
        return true;
      }
      case 'c': {
        socket.emit('game', {
          action: 'change'
        });
        return true;
      }
      case ' ': {
        socket.emit('game', {
          action: 'harddrop'
        });
        return true;
      }
    }
    return false;
  }

  const keyDownHandler = (event: React.KeyboardEvent) => {
    if (keyInterval[event.key]?.isPress) return;
    if (!gameControll(event.key)) return;
    keyInterval[event.key] = {
      interval: setTimeout(() => { }, 0),
      isPress: true
    }
    const [delay, interval] = [
      'ArrowLeft', 'ArrowRight', 'ArrowDown'
    ].includes(event.key) ? [75, 25] : [150, 200];

    setTimeout(() => {
      if (!keyInterval[event.key]?.isPress) {
        return;
      }
      keyInterval[event.key] = {
        interval: setInterval(() => {
          if (!keyInterval[event.key]?.isPress) {
            return clearInterval(keyInterval[event.key].interval);
          }
          gameControll(event.key);
        }, interval),
        isPress: true
      }
    }, delay);
  }

  const keyUpHandler = (event: React.KeyboardEvent) => {
    if (keyInterval[event.key]?.isPress) {
      keyInterval[event.key].isPress = false;
      clearInterval(keyInterval[event.key].interval);
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
          <p className='game--player-username'>{user.username}</p>
        </div>
        <input
          readOnly
          ref={controllerRef}
          onKeyDown={keyDownHandler}
          onKeyUp={keyUpHandler}
          className='game--controller'
        />
      </div>
      <ul className='game--player-list'>{playerListEl}</ul>
    </div>
  );
}

export default GameComponent;