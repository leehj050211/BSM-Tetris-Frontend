import { Piece } from "./piece";

export class UserGameData {
    board: number[][] = [];
    piece: Piece | null = null;
    holdPieceId: number | null = null;
    pieceChange: boolean = false;
}