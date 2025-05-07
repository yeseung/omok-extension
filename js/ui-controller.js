// ui-controller.js
export class UIController {
    constructor(gameBoard, aiPlayer, pointsManager) {
        this.gameBoard = gameBoard;
        this.aiPlayer = aiPlayer;
        this.pointsManager = pointsManager;
        
        // DOM 요소
        this.boardElement = document.getElementById('board');
        this.gameStatusElement = document.getElementById('game-status');
        this.restartButton = document.getElementById('restart-btn');
        this.undoButton = document.getElementById('undo-btn');
        
        // 효과음 객체 생성
this.blackStoneSound = new Audio("sounds/black-stone.mp3");
this.whiteStoneSound = new Audio("sounds/white-stone.mp3");
this.gameOverSound = new Audio("sounds/game-over.mp3");
        
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 재시작 버튼 클릭 이벤트
        this.restartButton.addEventListener('click', () => this.handleRestartClick());
        
        // 무르기 버튼 클릭 이벤트
        this.undoButton.addEventListener('click', () => this.handleUndoClick());
        
        // 브라우저 종료/새로고침 시 이벤트
        window.addEventListener('beforeunload', (event) => this.handleBeforeUnload(event));
    }
    
    initializeGame() {
        // DOM 보드 생성
        this.boardElement.innerHTML = '';
        
        for (let i = 0; i < this.gameBoard.BOARD_SIZE; i++) {
            for (let j = 0; j < this.gameBoard.BOARD_SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', (event) => this.cellClickHandler(event));
                this.boardElement.appendChild(cell);
                
                // 화점(오목판의 특정 점) 표시
                if ((i === 3 && j === 3) || (i === 3 && j === 11) ||
                    (i === 7 && j === 7) || (i === 11 && j === 3) ||
                    (i === 11 && j === 11)) {
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    dot.style.top = '50%';
                    dot.style.left = '50%';
                    cell.appendChild(dot);
                }
            }
        }
        
        this.gameBoard.reset();
        this.updateGameStatus();
    }
    
    cellClickHandler(event) {
        if (this.gameBoard.gameOver || this.gameBoard.currentPlayer === this.gameBoard.WHITE) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (isNaN(row) || isNaN(col) || this.gameBoard.board[row][col] !== this.gameBoard.EMPTY) return;
        
        this.makeMove(row, col);
        
        if (!this.gameBoard.gameOver) {
            // AI 턴
            setTimeout(() => {
                const aiMove = this.aiPlayer.findBestMove();
                if (aiMove) {
                    this.makeMove(aiMove.row, aiMove.col);
                }
            }, 500);
        }
    }
    
makeMove(row, col) {
    if (!this.gameBoard.makeMove(row, col)) return;
    
    // 효과음 재생
    this.playSound(this.gameBoard.currentPlayer === this.gameBoard.BLACK ? 
        this.blackStoneSound : this.whiteStoneSound);
    
    // 마지막 수 표시 제거
    if (this.gameBoard.lastMove) {
        const lastMoveMarker = document.querySelector('.last-move');
        if (lastMoveMarker) {
            lastMoveMarker.remove();
        }
    }
    
    // 돌 추가
    const cell = this.boardElement.children[row * this.gameBoard.BOARD_SIZE + col];
    const stone = document.createElement('div');
    stone.className = `stone ${this.gameBoard.board[row][col] === this.gameBoard.BLACK ? 'black' : 'white'}`;
    cell.appendChild(stone);
    
    // 마지막 수 표시
    const lastMoveMarker = document.createElement('div');
    lastMoveMarker.className = 'last-move';
    lastMoveMarker.style.top = '50%';
    lastMoveMarker.style.left = '50%';
    cell.appendChild(lastMoveMarker);
    
    // 승리 확인
    if (this.gameBoard.gameOver) {
        const isPlayerWin = this.gameBoard.board[row][col] === this.gameBoard.BLACK;
        this.gameStatusElement.textContent = `${this.gameBoard.board[row][col] === this.gameBoard.BLACK ? '흑돌' : '백돌'}이 승리했습니다!`;
        
        // 중요: setTimeout을 사용하여 마지막 돌이 화면에 표시된 후 알림 표시
        setTimeout(() => {
            // 로그인한 사용자만 포인트 업데이트
            const mb_id = document.getElementById('user-id')?.value || '';
            if (mb_id && mb_id.trim() !== '') {
                this.pointsManager.updatePoints(isPlayerWin);
            } else {
                // 비로그인 사용자(손님)는 단순 알림만 표시
                const resultText = isPlayerWin ? '승리' : '패배';
                alert(`게임 ${resultText}!`);
            }
        }, 100); // 100ms 지연 (필요에 따라 조정 가능)
        
        return;
    }
    
    this.updateGameStatus();
}

    
    updateGameStatus() {
        if (!this.gameBoard.gameOver) {
            this.gameStatusElement.textContent = `${this.gameBoard.currentPlayer === this.gameBoard.BLACK ? '당신' : 'AI'}의 차례입니다 (${this.gameBoard.currentPlayer === this.gameBoard.BLACK ? '흑돌' : '백돌'})`;
        }
    }
    
    handleRestartClick() {
        // if (!this.gameBoard.gameOver) {
        //     const userConfirm = confirm("게임 도중 재시작을 하면 패배로 인정되며, 100포인트가 차감됩니다. 계속하시겠습니까?");
        //     if (userConfirm) {
        //         this.playSound(this.gameOverSound);
        //         alert("게임이 종료되었습니다. 패배로 처리되며 100포인트가 차감됩니다.");
        //         this.pointsManager.updatePoints(false);
        //         this.initializeGame();
        //     } else {
        //         alert("게임을 계속 진행합니다.");
        //     }
        // } else {
        //     this.initializeGame();
        // }
        this.initializeGame();
    }
    
async handleUndoClick() {
    if (this.gameBoard.moveHistory.length < 2 || this.gameBoard.gameOver) return;
    
    // 무르기에 필요한 포인트
    const requiredPoints = 50;

    // 포인트 충분한지 확인
    // const hasEnoughPoints = await this.pointsManager.hasEnoughPoints(requiredPoints);
    // if (!hasEnoughPoints) {
    //     alert('포인트가 부족하여 무르기를 사용할 수 없습니다.');
    //     return;
    // }
    
    // 플레이어와 AI 모두 무르기
    for (let i = 0; i < 2; i++) {
        // 게임 보드 상태 업데이트
        const lastMoveBeforeUndo = this.gameBoard.lastMove;
        if (!this.gameBoard.undo()) break;
        
        // DOM 업데이트 - 마지막 수 제거
        if (lastMoveBeforeUndo) {
            const cell = this.boardElement.children[lastMoveBeforeUndo.row * this.gameBoard.BOARD_SIZE + lastMoveBeforeUndo.col];
            
            // 돌 제거
            const stone = cell.querySelector('.stone');
            if (stone) {
                cell.removeChild(stone);
            }
            
            // 마지막 수 표시 제거
            const lastMoveMarker = cell.querySelector('.last-move');
            if (lastMoveMarker) {
                cell.removeChild(lastMoveMarker);
            }
        }
    }
    
    // 마지막 수 표시 업데이트
    if (this.gameBoard.lastMove) {
        const cell = this.boardElement.children[this.gameBoard.lastMove.row * this.gameBoard.BOARD_SIZE + this.gameBoard.lastMove.col];
        const lastMoveMarker = document.createElement('div');
        lastMoveMarker.className = 'last-move';
        lastMoveMarker.style.top = '50%';
        lastMoveMarker.style.left = '50%';
        cell.appendChild(lastMoveMarker);
    }
    
    // 포인트 차감 로직
    //this.pointsManager.updatePoints(null, -requiredPoints, '무르기');
    //alert(`무르기를 사용하여 ${requiredPoints}포인트가 차감되었습니다.`);
    
    this.updateGameStatus();
}

    
    handleBeforeUnload(event) {
        if (!this.gameBoard.gameOver) {
            this.pointsManager.updatePointsBeforeUnload();
        }
    }
    
    playSound(sound) {
        sound.currentTime = 0;
        sound.play();
    }
}
