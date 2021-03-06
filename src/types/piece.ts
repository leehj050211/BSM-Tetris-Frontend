export class Piece {
    x: number = 0;
    y: number = 0;
    id: number = 0;
    shape: number[][] = [];

    constructor(id: number, x: number, y: number) {
      this.init(id, x, y);
    }
    
    init(id: number, x: number, y: number) {
        const shapes = [
            [
                [1, 1, 1, 1]
            ],
            [
                [2, 2],
                [2, 2]
            ],
            [
                [3, 3, 3],
                [0, 3, 0]
            ],
            [
                [4, 4, 4],
                [0, 0, 4]
            ],
            [
                [5, 5, 5],
                [5, 0, 0]
            ],
            [
                [0, 6, 6],
                [6, 6, 0]
            ],
            [
                [7, 7, 0],
                [0, 7, 7]
            ]
        ];

        this.id = id;
        this.shape = shapes[this.id-1];
        this.x = x;
        this.y = y;
    }

    rotate(direction: string) {
        // 가로 세로 배열 길이 변경
        const newShape: number[][] = Array.from(
            {length: this.shape[0].length}, () => Array.from(
                {length: this.shape.length}, () => 0
            )
        );
        // 새로운 배열에 기존 모양을 회전해서 채워 넣음
        for (let i=0; i<this.shape.length; i++) {
            for (let j=0; j<this.shape[0].length; j++) {
                if (this.shape[i][j] === 0) continue;
                // 방향
                switch (direction) {
                    case 'left': {
                        newShape[(this.shape[0].length - 1) - j][i] = this.shape[i][j];
                        break;
                    }
                    case 'right': {
                        newShape[j][(this.shape.length - 1) - i] = this.shape[i][j];
                        break;
                    }
                }
            }
        }
        this.shape = newShape;
    }
}