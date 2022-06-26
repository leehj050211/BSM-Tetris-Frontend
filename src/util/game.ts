import { Piece } from "../types/piece";
import { UserGameData } from "../types/user-game-data";

export class Game {
    private gameDatas: {
        [index: string]: UserGameData;
    } = {};
    private playerCanvas: {
        [index: string]: {
            ctx: CanvasRenderingContext2D,
            BlockSize: number;
        }
    } = {};
    
    private readonly BOARD_ROWS = 10;
    private readonly BOARD_COLS = 20;

    resizeScreen(ref: HTMLCanvasElement, username: string) {
        if (!ref.parentElement?.clientWidth) {
            return;
        }
        const canvas = this.playerCanvas[username];
        const { ctx } = canvas;
        // 캔버스 크기 계산
        ctx.canvas.width = ref.parentElement.clientWidth;
        canvas.BlockSize = ctx.canvas.width / this.BOARD_ROWS;
        ctx.canvas.height = this.BOARD_COLS * canvas.BlockSize;
        // 블럭 크기 변경
        this.draw(canvas, this.renderPiece(this.gameDatas[username]));
    }

    initData(username: string) {
        this.gameDatas[username] = new UserGameData();
        // 게임 보드 배열 초기화
        this.gameDatas[username].board = Array.from(
            {length: this.BOARD_COLS}, () => Array.from(
                {length: this.BOARD_ROWS}, () => 0
            )
        );
    }

    // 캔버스 컨텍스트 저장
    setCtx(username: string, ctx: CanvasRenderingContext2D) {
        this.playerCanvas[username] = {
            ctx,
            BlockSize: 0
        };
    }

    private renderPiece(userGameData: UserGameData): number[][] {
        const { piece } = userGameData;
        if (!piece) return [];
        const board = this.copyArray(userGameData.board);
        for (let i=piece.y; (i-piece.y < (piece.shape.length) && i<this.BOARD_COLS); i++) {
            for (let j=piece.x; (j-piece.x < (piece.shape[0].length) && j<this.BOARD_ROWS); j++) {
                // 블록이 보드 한 칸 위에서 내려오는 중이라면
                if (i < 0) {
                    continue;
                }
                if (piece.shape[i-piece.y][j-piece.x] !== 0) {
                    board[i][j] = piece.id;
                }
            }
        }
        return board;
    }
    
    private draw (canvas: {
        ctx: CanvasRenderingContext2D,
        BlockSize: number
    }, board: number[][]) {
        const { ctx, BlockSize } = canvas;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const colors = [
            '#40E0D0',
            '#F4D03F',
            '#9B59B6',
            '#2980B9',
            '#E67E22',
            '#27AE60',
            '#E74C3C'
        ];
        board.forEach((data, y) => {
            data.forEach((value, x) => {
                if (value > 0) {
                    ctx.fillStyle = colors[value-1];
                    ctx.fillRect(
                        x * BlockSize,
                        y * BlockSize,
                        BlockSize,
                        BlockSize
                    );
                }
            });
        });
    }

    // 깊은 복사
    private copyArray(array: number[][]): number[][] {
        return array.map(rows => [...rows]);
    }

    softdrop(username: string, y: number) {
        const canvas = this.playerCanvas[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.piece.y = y;
        this.draw(canvas, this.renderPiece(gameData));
    }
    
    // 블록이 쌓였으면 서버와 데이터를 동기화하여 무결성 체크
    stack(username: string, board: number[][]) {
        const canvas = this.playerCanvas[username];
        const gameData = this.gameDatas[username];
        gameData.board = board;
        this.draw(canvas, board);
    }

    move(username: string, x: number, y: number) {
        const canvas = this.playerCanvas[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.piece.x = x;
        gameData.piece.y = y;
        this.draw(canvas, this.renderPiece(gameData));
    }

    spawnPiece(username: string, pieceId: number, x: number, y: number) {
        const canvas = this.playerCanvas[username];
        const newPiece = new Piece(pieceId, x, y);
        const gameData = this.gameDatas[username];
        gameData.piece = newPiece;
        this.draw(canvas, this.renderPiece(gameData));
    }

    rotatePiece(username: string, direction: string) {
        const canvas = this.playerCanvas[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.piece.rotate(direction);
        this.draw(canvas, this.renderPiece(gameData));
    }

    changePiece(username: string, holdPieceId: number, pieceId: number, pieceX: number, pieceY: number) {
        const canvas = this.playerCanvas[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.holdPieceId = holdPieceId;
        gameData.piece = new Piece(pieceId, pieceX, pieceY);
        const board = this.renderPiece(gameData);
        this.draw(canvas, board);
    }

    clear(username: string, y: number) {
        const canvas = this.playerCanvas[username];
        const gameData = this.gameDatas[username];
        const { board } = gameData;
        board.splice(y, 1);
        board.unshift(Array.from({length: this.BOARD_ROWS}, () => 0));
        this.draw(canvas, board);
    }

    ranking(username: string, ranking: number) {
        const canvas = this.playerCanvas[username];
        const { ctx, BlockSize } = canvas;
        ctx.font = `bold ${BlockSize * 0.75}pt 맑은고딕`;
        ctx.fillStyle = 'rgba(0, 0, 0, .5)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${ranking} 위`, ctx.canvas.width / 2, ctx.canvas.height / 2);
    }

    userExit(username: string) {
        delete this.gameDatas[username];
        delete this.playerCanvas[username];
    }
}