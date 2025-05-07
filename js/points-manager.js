// points-manager.js
export class PointsManager {
    constructor(userId = null) {
        this.pointsElement = document.getElementById('current-points');
        this.userId = userId || document.getElementById('user-id')?.value || '';
    }
    
    /**
     * 게임 결과에 따라 포인트를 업데이트
     * @param {boolean|null} isWin - 승리 여부 (true: 승리, false: 패배, null: 무르기 등 기타)
     * @param {number} pointChange - 변경할 포인트 (기본값: 승리 시 100, 패배 시 -100)
     * @param {string} resultText - 결과 텍스트 (기본값: 승리 또는 패배)
     * @returns {Promise<boolean>} 업데이트 성공 여부
     */
updatePoints(isWin, pointChange = null, resultText = null) {
    console.log('updatePoints called with isWin:', isWin);
    
    // 포인트 변경 및 결과 텍스트 설정
    if (pointChange === null) {
        pointChange = isWin ? 100 : -100;
    }
    
    if (resultText === null) {
        resultText = isWin ? '승리' : '패배';
    }
    
    // 로그인하지 않은 사용자(손님) 처리
    // if (!this.userId || this.userId.trim() === '') {
    //     // 로그인하지 않은 경우 포인트 업데이트 요청을 보내지 않고 알림만 표시
    //     if (resultText !== '무르기') {
    //         alert(`게임 ${resultText}! 로그인 후 플레이하시면 포인트를 ${pointChange > 0 ? '획득' : '차감'}할 수 있습니다.`);
    //     } else {
    //         alert('무르기 기능을 사용했습니다. 로그인 후 플레이하시면 포인트 시스템을 이용할 수 있습니다.');
    //     }
    //     return true; // 성공으로 처리
    // }
    
    const timestamp = new Date().getTime();

    return;
    // 서버에 포인트 업데이트 요청
    // return fetch('update_points.php', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: `mb_id=${this.userId}&point_change=${pointChange}&result=${resultText}&timestamp=${timestamp}`
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Response data:', data);
    //     if (data.success) {
    //         // 화면에 포인트 업데이트
    //         if (this.pointsElement) {
    //             this.pointsElement.textContent = data.new_points.toLocaleString();
    //         }
    //
    //         // 결과 알림 (무르기가 아닌 경우만)
    //         if (resultText !== '무르기') {
    //             alert(`게임 ${resultText}! ${Math.abs(pointChange)}포인트가 ${pointChange > 0 ? '적립' : '차감'}되었습니다.`);
    //         }
    //         return true;
    //     } else {
    //         alert('포인트 업데이트 중 오류가 발생했습니다: ' + data.message);
    //         return false;
    //     }
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    //     alert('서버 통신 중 오류가 발생했습니다.');
    //     return false;
    // });
}

// 브라우저 종료/새로고침 시에도 동일한 로직 적용
updatePointsBeforeUnload() {
    // 로그인하지 않은 사용자는 처리하지 않음
    if (!this.userId || this.userId.trim() === '') {
        return;
    }
    
    // navigator.sendBeacon('update_points.php', new URLSearchParams({
    //     mb_id: this.userId,
    //     point_change: -100,
    //     result: '패배',
    //     timestamp: new Date().getTime()
    // }));
}

    
    /**
     * 현재 사용자의 포인트를 가져옴
     * @returns {Promise<number>} 현재 포인트
     */
    async getCurrentPoints() {
        // try {
        //     // 서버 API 호출 방식
        //     const response = await fetch(`get_points.php?mb_id=${this.userId}`);
        //     const data = await response.json();
        //
        //     if (data.success) {
        //         return data.points;
        //     } else {
        //         console.error('포인트 조회 실패:', data.message);
        //         return this.getPointsFromDOM();
        //     }
        // } catch (error) {
        //     console.error('포인트 조회 중 오류 발생:', error);
        //     return this.getPointsFromDOM();
        // }
    }
    
    /**
     * DOM에서 현재 포인트 값을 가져옴 (API 호출 실패 시 대체 방법)
     * @returns {number} 현재 포인트
     */
    getPointsFromDOM() {
        if (this.pointsElement) {
            const pointsText = this.pointsElement.textContent.replace(/,/g, '');
            const points = parseInt(pointsText);
            return isNaN(points) ? 0 : points;
        }
        return 0;
    }
    
    /**
     * 포인트가 충분한지 확인
     * @param {number} requiredPoints - 필요한 포인트
     * @returns {Promise<boolean>} 포인트 충분 여부
     */
    async hasEnoughPoints(requiredPoints) {
        const currentPoints = await this.getCurrentPoints();
        return currentPoints >= requiredPoints;
    }
}
