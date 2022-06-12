const draw = (ctx: CanvasRenderingContext2D, board: number[][]) => {
    console.table(board)
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = 'black';
    board.forEach((data, y) => {
        data.forEach((value, x) => {
            if (value > 0) {
                ctx.fillRect(x, y, 1, 1);
            }
        });
    });
}

export {
    draw
}