// game-logic.js
export class GameBoard {
    constructor(size = 15) {
        this.BOARD_SIZE = size;
        this.EMPTY = 0;
        this.BLACK = 1;
        this.WHITE = 2;
        this.WINNING_LENGTH = 5;
        this.board = this.createEmptyBoard();
        this.currentPlayer = this.BLACK;
        this.gameOver = false;
        this.moveHistory = [];
        this.lastMove = null;
    }
    
    createEmptyBoard() {
        return Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(this.EMPTY));
    }
    
    makeMove(row, col) {
        if (this.gameOver || row < 0 || row >= this.BOARD_SIZE || col < 0 || col >= this.BOARD_SIZE || this.board[row][col] !== this.EMPTY) {
            return false;
        }
        
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({row, col, player: this.currentPlayer});
        this.lastMove = {row, col};
        
        // 승리 확인
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            return true;
        }
        
        // 다음 플레이어
        this.currentPlayer = this.currentPlayer === this.BLACK ? this.WHITE : this.BLACK;
        return true;
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            {dr: 0, dc: 1},  // 가로
            {dr: 1, dc: 0},  // 세로
            {dr: 1, dc: 1},  // 대각선 /
            {dr: 1, dc: -1}  // 대각선 \
        ];
        
        for (const dir of directions) {
            let count = 1;
            
            // 한쪽 방향으로 확인
            for (let i = 1; i < this.WINNING_LENGTH; i++) {
                const r = row + dir.dr * i;
                const c = col + dir.dc * i;
                
                if (r < 0 || r >= this.BOARD_SIZE || c < 0 || c >= this.BOARD_SIZE || this.board[r][c] !== player) {
                    break;
                }
                
                count++;
            }
            
            // 반대 방향으로 확인
            for (let i = 1; i < this.WINNING_LENGTH; i++) {
                const r = row - dir.dr * i;
                const c = col - dir.dc * i;
                
                if (r < 0 || r >= this.BOARD_SIZE || c < 0 || c >= this.BOARD_SIZE || this.board[r][c] !== player) {
                    break;
                }
                
                count++;
            }
            
            if (count >= this.WINNING_LENGTH) {
                return true;
            }
        }
        
        return false;
    }
    
    undo() {
        if (this.moveHistory.length === 0) {
            return false;
        }
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = this.EMPTY;
        
        if (this.moveHistory.length > 0) {
            const prevMove = this.moveHistory[this.moveHistory.length - 1];
            this.lastMove = {row: prevMove.row, col: prevMove.col};
            this.currentPlayer = prevMove.player === this.BLACK ? this.WHITE : this.BLACK;
        } else {
            this.lastMove = null;
            this.currentPlayer = this.BLACK;
        }
        
        this.gameOver = false;
        return true;
    }
    
    getEmptyCells() {
        const emptyCells = [];
        for (let i = 0; i < this.BOARD_SIZE; i++) {
            for (let j = 0; j < this.BOARD_SIZE; j++) {
                if (this.board[i][j] === this.EMPTY) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        return emptyCells;
    }
    
    reset() {
        this.board = this.createEmptyBoard();
        this.currentPlayer = this.BLACK;
        this.gameOver = false;
        this.moveHistory = [];
        this.lastMove = null;
    }
    
    evaluateMove(row, col, player) {
        // 임시로 착수해보고 평가
        const originalValue = this.board[row][col];
        this.board[row][col] = player;
        
        // 승리하는 수라면 최고 점수
        if (this.checkWin(row, col)) {
            this.board[row][col] = originalValue;
            return 10000;
        }
        
        // 원상복구
        this.board[row][col] = originalValue;
        
        // 주변 상황 평가
        let score = 0;
        const directions = [
            {dr: 0, dc: 1},  // 가로
            {dr: 1, dc: 0},  // 세로
            {dr: 1, dc: 1},  // 대각선 /
            {dr: 1, dc: -1}  // 대각선 \
        ];
        
        for (const otherPlayer of [this.WHITE, this.BLACK]) {
            const playerScore = otherPlayer === player ? 1 : 0.9; // 자신의 돌에 약간 더 가중치
            
            for (const dir of directions) {
                // 각 방향으로 연속된 돌 수 확인
                this.board[row][col] = otherPlayer;
                let myStones = 1;
                let blocked = 0;
                
                // 한쪽 방향
                for (let i = 1; i < 5; i++) {
                    const r = row + dir.dr * i;
                    const c = col + dir.dc * i;
                    
                    if (r < 0 || r >= this.BOARD_SIZE || c < 0 || c >= this.BOARD_SIZE) {
                        blocked++;
                        break;
                    }
                    
                    if (this.board[r][c] === otherPlayer) {
                        myStones++;
                    } else if (this.board[r][c] !== this.EMPTY) {
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
                    
                    if (r < 0 || r >= this.BOARD_SIZE || c < 0 || c >= this.BOARD_SIZE) {
                        blocked++;
                        break;
                    }
                    
                    if (this.board[r][c] === otherPlayer) {
                        myStones++;
                    } else if (this.board[r][c] !== this.EMPTY) {
                        blocked++;
                        break;
                    } else {
                        break;
                    }
                }
                
                // 원상복구
                this.board[row][col] = originalValue;
                
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
        const center = Math.floor(this.BOARD_SIZE / 2);
        const distToCenter = Math.abs(row - center) + Math.abs(col - center);
        score += (this.BOARD_SIZE - distToCenter) * 0.5;
        
        return score;
    }
}
