import { Piece } from "../types/piece";
import { UserGameData } from "../types/user-game-data";

export class Game {
    private gameDatas: {
        [index: string]: UserGameData;
    } = {};
    private playerCanvasCtx: {
        [index: string]: CanvasRenderingContext2D
    } = {};
    
    private readonly BOARD_ROWS = 10;
    private readonly BOARD_COLS = 20;
    private BLOCK_SIZE = 20;

    resizeScreen(ref: HTMLCanvasElement, username: string) {
        if (!ref.parentElement?.clientWidth) {
            return;
        }
        const ctx = this.playerCanvasCtx[username];
        // 캔버스 크기 계산
        ctx.canvas.width = ref.parentElement.clientWidth;
        this.BLOCK_SIZE = ctx.canvas.width / this.BOARD_ROWS;
        ctx.canvas.height = this.BOARD_COLS * this.BLOCK_SIZE;
        // 블럭 크기 변경
        ctx.scale(this.BLOCK_SIZE, this.BLOCK_SIZE);
        this.draw(ctx, this.renderPiece(this.gameDatas[username]));
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
        this.playerCanvasCtx[username] = ctx;
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
                if (piece.shape[i-piece.y][j-piece.x] != 0) {
                    board[i][j] = piece.id;
                }
            }
        }
        return board;
    }
    
    private draw (ctx: CanvasRenderingContext2D, board: number[][]) {
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
                    ctx.fillRect(x, y, 1, 1);
                }
            });
        });
    }

    // 깊은 복사
    private copyArray(array: number[][]): number[][] {
        return array.map(rows => [...rows]);
    }

    softdrop(username: string, y: number) {
        const ctx = this.playerCanvasCtx[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.piece.y = y;
        this.draw(ctx, this.renderPiece(gameData));
    }
    
    // 블록이 쌓였으면 서버와 데이터를 동기화하여 무결성 체크
    stack(username: string, board: number[][]) {
        const ctx = this.playerCanvasCtx[username];
        const gameData = this.gameDatas[username];
        gameData.board = board;
        this.draw(ctx, board);
    }

    move(username: string, x: number, y: number) {
        const ctx = this.playerCanvasCtx[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.piece.x = x;
        gameData.piece.y = y;
        this.draw(ctx, this.renderPiece(gameData));
    }

    spawnPiece(username: string, pieceId: number, x: number, y: number) {
        const ctx = this.playerCanvasCtx[username];
        const newPiece = new Piece(pieceId, x, y);
        const gameData = this.gameDatas[username];
        gameData.piece = newPiece;
        this.draw(ctx, this.renderPiece(gameData));
    }

    rotatePiece(username: string, direction: string) {
        const ctx = this.playerCanvasCtx[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.piece.rotate(direction);
        this.draw(ctx, this.renderPiece(gameData));
    }

    changePiece(username: string, holdPieceId: number, pieceId: number, pieceX: number, pieceY: number) {
        const ctx = this.playerCanvasCtx[username];
        const gameData = this.gameDatas[username];
        if (!gameData.piece) return;
        gameData.holdPieceId = holdPieceId;
        gameData.piece = new Piece(pieceId, pieceX, pieceY);
        const board = this.renderPiece(gameData);
        this.draw(ctx, board);
    }

    clear(username: string, y: number) {
        const ctx = this.playerCanvasCtx[username];
        const gameData = this.gameDatas[username];
        const { board } = gameData;
        board.splice(y, 1);
        board.unshift(Array.from({length: this.BOARD_ROWS}, () => 0));
        this.draw(ctx, board);
    }
}