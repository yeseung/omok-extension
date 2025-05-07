// main.js
import { GameBoard } from './game-logic.js';
import { AIPlayer } from './ai-player.js';
import { UIController } from './ui-controller.js';
import { PointsManager } from './points-manager.js';

document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수로 선언된 mb_id 사용
    const userId = '';
    
    // 모듈 인스턴스 생성
    const gameBoard = new GameBoard();
    const pointsManager = new PointsManager(userId);
    const aiPlayer = new AIPlayer(gameBoard);
    const uiController = new UIController(gameBoard, aiPlayer, pointsManager);
    
    // 게임 초기화
    uiController.initializeGame();
    
    // 디버깅을 위해 전역 객체에 인스턴스 할당 (선택 사항)
    window.gameApp = {
        gameBoard,
        aiPlayer,
        pointsManager,
        uiController
    };
});
