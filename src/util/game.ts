const BOARD_ROWS = 10;
const BOARD_COLS = 20;
let BLOCK_SIZE = 20;

const draw = (ctx: CanvasRenderingContext2D, board: number[][]) => {
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

const resize = (ref: HTMLCanvasElement, ctx: CanvasRenderingContext2D, board: number[][]) => {
    if (!ref.parentElement?.clientWidth) {
        return;
    }
    ctx.canvas.width = ref.parentElement.clientWidth;
    BLOCK_SIZE = ctx.canvas.width / BOARD_ROWS;
    ctx.canvas.height = BOARD_COLS * BLOCK_SIZE;
    // 캔버스 크기 계산
    // 블럭 크기 변경
    ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
    draw(ctx, board);
    console.log(BLOCK_SIZE, ctx.canvas.width, ctx.canvas.height)
}

export {
    draw,
    resize
}