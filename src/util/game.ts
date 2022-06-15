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

export {
    draw
}