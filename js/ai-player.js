// ai-player.js
export class AIPlayer {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
    }
    
    findBestMove() {
        // 빈 칸 찾기
        const emptyCells = this.gameBoard.getEmptyCells();
        
        if (emptyCells.length === 0) return null;
        
        // 첫 수: 중앙 또는 중앙 근처에 착수
        if (this.gameBoard.moveHistory.length === 1) {
            const center = Math.floor(this.gameBoard.BOARD_SIZE / 2);
            if (this.gameBoard.board[center][center] === this.gameBoard.EMPTY) {
                return {row: center, col: center};
            }
            
            // 중앙이 이미 차있으면 근처에 착수
            const nearCenter = [
                {row: center-1, col: center},
                {row: center+1, col: center},
                {row: center, col: center-1},
                {row: center, col: center+1}
            ].filter(pos =>
                pos.row >= 0 && pos.row < this.gameBoard.BOARD_SIZE &&
                pos.col >= 0 && pos.col < this.gameBoard.BOARD_SIZE &&
                this.gameBoard.board[pos.row][pos.col] === this.gameBoard.EMPTY
            );
            
            if (nearCenter.length > 0) {
                return nearCenter[Math.floor(Math.random() * nearCenter.length)];
            }
        }
        
        // 각 빈 칸의 점수 계산
        const cellScores = emptyCells.map(cell => {
            return {
                row: cell.row,
                col: cell.col,
                score: this.evaluateMove(cell.row, cell.col)
            };
        });
        
        // 최고 점수 찾기
        cellScores.sort((a, b) => b.score - a.score);
        
        // 최고 점수가 여러 개인 경우 무작위로 선택
        const bestScore = cellScores[0].score;
        const bestMoves = cellScores.filter(move => move.score === bestScore);
        
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    
    evaluateMove(row, col) {
        // 임시로 착수해보고 평가
        this.gameBoard.board[row][col] = this.gameBoard.WHITE;
        
        // 승리하는 수라면 최고 점수
        if (this.gameBoard.checkWin(row, col)) {
            this.gameBoard.board[row][col] = this.gameBoard.EMPTY;
            return 10000;
        }
        
        // 상대방 승리 방지하는 수 체크
        this.gameBoard.board[row][col] = this.gameBoard.BLACK;
        if (this.gameBoard.checkWin(row, col)) {
            this.gameBoard.board[row][col] = this.gameBoard.EMPTY;
            return 9000;
        }
        
        // 원상복구
        this.gameBoard.board[row][col] = this.gameBoard.EMPTY;
        
        // 주변 상황 평가
        let score = 0;
        const directions = [
            {dr: 0, dc: 1},  // 가로
            {dr: 1, dc: 0},  // 세로
            {dr: 1, dc: 1},  // 대각선 /
            {dr: 1, dc: -1}  // 대각선 \
        ];
        
        for (const player of [this.gameBoard.WHITE, this.gameBoard.BLACK]) {
            const playerScore = player === this.gameBoard.WHITE ? 1 : 0.9; // AI는 공격에 약간 더 가중치
            
            for (const dir of directions) {
                // 각 방향으로 연속된 돌 수 확인
                this.gameBoard.board[row][col] = player;
                let myStones = 1;
                let blocked = 0;
                
                // 한쪽 방향
                for (let i = 1; i < 5; i++) {
                    const r = row + dir.dr * i;
                    const c = col + dir.dc * i;
                    
                    if (r < 0 || r >= this.gameBoard.BOARD_SIZE || c < 0 || c >= this.gameBoard.BOARD_SIZE) {
                        blocked++;
                        break;
                    }
                    
                    if (this.gameBoard.board[r][c] === player) {
                        myStones++;
                    } else if (this.gameBoard.board[r][c] !== this.gameBoard.EMPTY) {
                        blocked++;
                        break;
                    } else {
                        break;
                    }
                }
                
                // 반대 방향
                for (let i = 1; i < 5; i++) {
                    const r = row - dir.dr * i;
                    const c = col - dir.dc * i;
                    
                    if (r < 0 || r >= this.gameBoard.BOARD_SIZE || c < 0 || c >= this.gameBoard.BOARD_SIZE) {
                        blocked++;
                        break;
                    }
                    
                    if (this.gameBoard.board[r][c] === player) {
                        myStones++;
                    } else if (this.gameBoard.board[r][c] !== this.gameBoard.EMPTY) {
                        blocked++;
                        break;
                    } else {
                        break;
                    }
                }
                
                this.gameBoard.board[row][col] = this.gameBoard.EMPTY;
                
                // 점수 계산
                if (myStones >= 5) {
                    score += 5000 * playerScore;
                } else if (myStones === 4 && blocked < 2) {
                    score += (blocked === 0 ? 1000 : 500) * playerScore;
                } else if (myStones === 3 && blocked < 2) {
                    score += (blocked === 0 ? 200 : 100) * playerScore;
                } else if (myStones === 2 && blocked < 2) {
                    score += (blocked === 0 ? 50 : 20) * playerScore;
                }
            }
        }
        
        // 중앙에 가까울수록 약간의 보너스 점수
        const center = Math.floor(this.gameBoard.BOARD_SIZE / 2);
        const distToCenter = Math.abs(row - center) + Math.abs(col - center);
        score += (this.gameBoard.BOARD_SIZE - distToCenter) * 0.5;
        
        return score;
    }
}
