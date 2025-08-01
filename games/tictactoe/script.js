// ========================================
// 틱택토 게임 JavaScript 로직
// ========================================

// 게임 상태를 관리하는 클래스
class TicTacToe {
    constructor() {
        // 게임 보드 상태 (3x3 배열)
        // null: 빈 셀, 'X': 플레이어, 'O': 컴퓨터
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        
        // 현재 플레이어 ('X': 플레이어, 'O': 컴퓨터)
        this.currentPlayer = 'X';
        
        // 게임이 진행 중인지 여부
        this.gameActive = true;
        
        // 플레이어 정보 ('X': 플레이어, 'O': 컴퓨터)
        this.playerInfo = {
            'X': '플레이어',
            'O': '컴퓨터'
        };
        
        // 승리 조건 조합들 (가로, 세로, 대각선)
        this.winningCombinations = [
            // 가로 승리 조건
            [[0, 0], [0, 1], [0, 2]],
            [[1, 0], [1, 1], [1, 2]],
            [[2, 0], [2, 1], [2, 2]],
            
            // 세로 승리 조건
            [[0, 0], [1, 0], [2, 0]],
            [[0, 1], [1, 1], [2, 1]],
            [[0, 2], [1, 2], [2, 2]],
            
            // 대각선 승리 조건
            [[0, 0], [1, 1], [2, 2]],
            [[0, 2], [1, 1], [2, 0]]
        ];
        
        // 점수 저장소 (localStorage에서 불러오거나 기본값 사용)
        this.scores = this.loadScores();
        
        // 마지막 승자 (다음 게임 선공 결정용)
        this.lastWinner = null;
        
        // DOM 요소들
        this.gameBoard = document.getElementById('game-board');
        this.statusElement = document.getElementById('status');
        this.currentPlayerElement = document.getElementById('current-player');
        this.scoreXElement = document.getElementById('score-x');
        this.scoreOElement = document.getElementById('score-o');
        this.restartBtn = document.getElementById('restart-btn');
        this.resetScoreBtn = document.getElementById('reset-score-btn');
        
        // 게임 초기화
        this.initializeGame();
        
        // 창 크기 변경 시 셀 위치 재계산
        window.addEventListener('resize', () => {
            this.updateCellPositions();
        });
    }
    
    // 게임 초기화 함수
    initializeGame() {
        // 게임 보드 생성
        this.createBoard();
        
        // 이벤트 리스너 등록
        this.addEventListeners();
        
        // 점수 표시 업데이트
        this.updateScoreDisplay();
        
        // 상태 메시지 업데이트
        this.updateStatus();
    }
    
    // 게임 보드 생성 함수
    createBoard() {
        // 기존 보드 내용 제거
        this.gameBoard.innerHTML = '';
        
        // 3x3 그리드 생성
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                // 각 셀을 위한 버튼 요소 생성
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // 셀 위치 설정 (절대 위치로 배치)
                cell.style.position = 'absolute';
                
                // 셀 클릭 이벤트 추가
                cell.addEventListener('click', (e) => this.handleCellClick(e));
                
                // 게임 보드에 셀 추가
                this.gameBoard.appendChild(cell);
            }
        }
        
        // 셀 위치 업데이트
        this.updateCellPositions();
    }
    
    // 셀 위치 업데이트 함수
    updateCellPositions() {
        const cells = this.gameBoard.querySelectorAll('.cell');
        const isMobile = window.innerWidth <= 600;
        const cellSize = isMobile ? 80 : 100;
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            cell.style.left = `${col * cellSize}px`;
            cell.style.top = `${row * cellSize}px`;
        });
    }
    
    // 이벤트 리스너 등록 함수
    addEventListeners() {
        // 재시작 버튼 이벤트
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // 점수 초기화 버튼 이벤트
        this.resetScoreBtn.addEventListener('click', () => this.resetScores());
    }
    
    // 셀 클릭 처리 함수
    handleCellClick(event) {
        // 게임이 비활성화되어 있으면 클릭 무시
        if (!this.gameActive) {
            return;
        }
        
        // 컴퓨터 턴이면 플레이어 클릭 무시
        if (this.currentPlayer === 'O') {
            return;
        }
        
        // 클릭된 셀의 위치 정보 가져오기
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        // 이미 채워진 셀이면 클릭 무시
        if (this.board[row][col] !== null) {
            return;
        }
        
        // 플레이어의 표시를 보드에 기록
        this.board[row][col] = this.currentPlayer;
        
        // 클릭된 셀에 플레이어 표시 업데이트
        event.target.textContent = this.currentPlayer;
        event.target.classList.add(this.currentPlayer.toLowerCase());
        
        // 승리 조건 확인
        if (this.checkWin(row, col)) {
            // 승리한 경우
            this.handleWin();
        } else if (this.checkDraw()) {
            // 무승부인 경우
            this.handleDraw();
        } else {
            // 게임 계속 진행 - 컴퓨터 턴으로 전환
            this.switchPlayer();
            
            // 컴퓨터 턴 시작 (약간의 지연을 두어 자연스럽게)
            setTimeout(() => {
                this.makeComputerMove();
            }, 500);
        }
    }
    
    // 승리 조건 확인 함수
    checkWin(row, col) {
        const player = this.board[row][col];
        
        // 모든 승리 조합을 확인
        for (const combination of this.winningCombinations) {
            // 현재 조합이 승리 조건을 만족하는지 확인
            const isWinning = combination.every(([r, c]) => {
                return this.board[r][c] === player;
            });
            
            if (isWinning) {
                // 승리한 셀들을 하이라이트
                this.highlightWinningCells(combination);
                return true;
            }
        }
        
        return false;
    }
    
    // 승리한 셀들 하이라이트 함수
    highlightWinningCells(combination) {
        combination.forEach(([row, col]) => {
            const cell = this.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winner');
        });
    }
    
    // 무승부 확인 함수
    checkDraw() {
        // 모든 셀이 채워졌는지 확인
        return this.board.every(row => row.every(cell => cell !== null));
    }
    
    // 승리 처리 함수
    handleWin() {
        // 게임 상태를 비활성화
        this.gameActive = false;
        
        // 승리한 플레이어의 점수 증가
        this.scores[this.currentPlayer]++;
        
        // 마지막 승자 기록 (다음 게임 선공 결정용)
        this.lastWinner = this.currentPlayer;
        
        // 점수 저장
        this.saveScores();
        
        // 점수 표시 업데이트
        this.updateScoreDisplay();
        
        // 승리 메시지 표시
        const winnerName = this.playerInfo[this.currentPlayer];
        this.statusElement.innerHTML = `<span style="color: #22543d; font-weight: bold;">${winnerName}</span>가 승리했습니다!`;
        
        // 게임 보드 비활성화
        this.gameBoard.classList.add('game-over');
    }
    
    // 무승부 처리 함수
    handleDraw() {
        // 게임 상태를 비활성화
        this.gameActive = false;
        
        // 무승부 메시지 표시
        this.statusElement.innerHTML = '<span style="color: #744210; font-weight: bold;">무승부입니다!</span>';
        
        // 게임 보드 비활성화
        this.gameBoard.classList.add('game-over');
    }
    
    // 플레이어 전환 함수
    switchPlayer() {
        // X와 O를 번갈아가며 전환
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        
        // 상태 메시지 업데이트
        this.updateStatus();
    }
    
    // 상태 메시지 업데이트 함수
    updateStatus() {
        const playerName = this.playerInfo[this.currentPlayer];
        this.currentPlayerElement.textContent = playerName;
        this.currentPlayerElement.className = this.currentPlayer.toLowerCase();
    }
    
    // 점수 표시 업데이트 함수
    updateScoreDisplay() {
        this.scoreXElement.textContent = this.scores.X;
        this.scoreOElement.textContent = this.scores.O;
    }
    
    // 게임 재시작 함수
    restartGame() {
        // 보드 상태 초기화
        this.board = [
            [null, null, null],
            [null, null, null],
            [null, null, null]
        ];
        
        // 게임 상태 초기화 (첫 게임이거나 플레이어가 이겼으면 플레이어가 선공)
        // 컴퓨터가 이겼으면 컴퓨터가 선공
        if (this.lastWinner === 'O') {
            this.currentPlayer = 'O'; // 컴퓨터가 선공
        } else {
            this.currentPlayer = 'X'; // 플레이어가 선공
        }
        
        this.gameActive = true;
        
        // 게임 보드 재생성
        this.createBoard();
        
        // 상태 메시지 초기화
        this.updateStatus();
        
        // 게임 보드 활성화
        this.gameBoard.classList.remove('game-over');
        
        // 컴퓨터가 선공이면 컴퓨터 턴 시작
        if (this.currentPlayer === 'O') {
            setTimeout(() => {
                this.makeComputerMove();
            }, 500);
        }
    }
    
    // 점수 초기화 함수
    resetScores() {
        // 점수 초기화
        this.scores = { X: 0, O: 0 };
        
        // 마지막 승자도 초기화 (다음 게임은 플레이어가 선공)
        this.lastWinner = null;
        
        // localStorage에서 점수 삭제
        localStorage.removeItem('tictactoe-scores');
        
        // 점수 표시 업데이트
        this.updateScoreDisplay();
    }
    
    // 점수 저장 함수 (localStorage 사용)
    saveScores() {
        try {
            localStorage.setItem('tictactoe-scores', JSON.stringify(this.scores));
        } catch (error) {
            console.error('점수 저장 중 오류 발생:', error);
        }
    }
    
    // 점수 불러오기 함수 (localStorage에서)
    loadScores() {
        try {
            const savedScores = localStorage.getItem('tictactoe-scores');
            if (savedScores) {
                return JSON.parse(savedScores);
            }
        } catch (error) {
            console.error('점수 불러오기 중 오류 발생:', error);
        }
        
        // 기본 점수 반환
        return { X: 0, O: 0 };
    }
    
    // ========================================
    // 컴퓨터 AI 로직
    // ========================================
    
    // 컴퓨터 턴 처리 함수
    makeComputerMove() {
        // 게임이 비활성화되어 있으면 무시
        if (!this.gameActive || this.currentPlayer !== 'O') {
            return;
        }
        
        // 최적의 수를 찾기
        const bestMove = this.findBestMove();
        
        if (bestMove) {
            const { row, col } = bestMove;
            
            // 컴퓨터의 수를 보드에 기록
            this.board[row][col] = 'O';
            
            // 해당 셀에 컴퓨터 표시 업데이트
            const cell = this.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.textContent = 'O';
            cell.classList.add('o');
            
            // 승리 조건 확인
            if (this.checkWin(row, col)) {
                // 승리한 경우
                this.handleWin();
            } else if (this.checkDraw()) {
                // 무승부인 경우
                this.handleDraw();
            } else {
                // 게임 계속 진행 - 플레이어 턴으로 전환
                this.switchPlayer();
            }
        }
    }
    
    // 최적의 수 찾기 함수 (미니맥스 알고리즘)
    findBestMove() {
        let bestScore = -Infinity;
        let bestMove = null;
        
        // 모든 빈 셀을 확인
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board[row][col] === null) {
                    // 이 위치에 컴퓨터가 수를 둬봄
                    this.board[row][col] = 'O';
                    
                    // 미니맥스 알고리즘으로 점수 계산
                    const score = this.minimax(this.board, 0, false);
                    
                    // 수를 되돌림
                    this.board[row][col] = null;
                    
                    // 더 좋은 점수를 찾으면 업데이트
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { row, col };
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    // 미니맥스 알고리즘 (재귀적)
    minimax(board, depth, isMaximizing) {
        // 승리 조건 확인
        const winner = this.checkWinner(board);
        if (winner === 'O') {
            return 10 - depth; // 컴퓨터 승리 (깊이를 고려하여 빠른 승리 선호)
        } else if (winner === 'X') {
            return depth - 10; // 플레이어 승리 (깊이를 고려하여 늦은 패배 선호)
        } else if (this.isBoardFull(board)) {
            return 0; // 무승부
        }
        
        if (isMaximizing) {
            // 컴퓨터 턴 (최대화)
            let bestScore = -Infinity;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board[row][col] === null) {
                        board[row][col] = 'O';
                        const score = this.minimax(board, depth + 1, false);
                        board[row][col] = null;
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            // 플레이어 턴 (최소화)
            let bestScore = Infinity;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (board[row][col] === null) {
                        board[row][col] = 'X';
                        const score = this.minimax(board, depth + 1, true);
                        board[row][col] = null;
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }
    
    // 보드에서 승자 확인 함수 (미니맥스용)
    checkWinner(board) {
        // 모든 승리 조합 확인
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            const [rowA, colA] = a;
            const [rowB, colB] = b;
            const [rowC, colC] = c;
            
            if (board[rowA][colA] && 
                board[rowA][colA] === board[rowB][colB] && 
                board[rowA][colA] === board[rowC][colC]) {
                return board[rowA][colA];
            }
        }
        return null;
    }
    
    // 보드가 가득 찼는지 확인 함수 (미니맥스용)
    isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== null));
    }
}

// ========================================
// 게임 시작
// ========================================

// DOM이 완전히 로드된 후 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 새로운 틱택토 게임 인스턴스 생성
    const game = new TicTacToe();
    
    // 전역 변수로 게임 인스턴스 저장 (디버깅용)
    window.tictactoeGame = game;
    
    console.log('틱택토 게임이 성공적으로 시작되었습니다!');
    console.log('게임 인스턴스:', game);
});

// ========================================
// 추가 기능 및 유틸리티
// ========================================

// 키보드 단축키 지원
document.addEventListener('keydown', (event) => {
    // R 키: 게임 재시작
    if (event.key.toLowerCase() === 'r') {
        if (window.tictactoeGame) {
            window.tictactoeGame.restartGame();
        }
    }
    
    // S 키: 점수 초기화
    if (event.key.toLowerCase() === 's') {
        if (window.tictactoeGame) {
            window.tictactoeGame.resetScores();
        }
    }
});

// 게임 통계 함수 (디버깅용)
function getGameStats() {
    if (window.tictactoeGame) {
        return {
            currentPlayer: window.tictactoeGame.currentPlayer,
            gameActive: window.tictactoeGame.gameActive,
            scores: window.tictactoeGame.scores,
            board: window.tictactoeGame.board
        };
    }
    return null;
}

// 전역 함수로 노출 (콘솔에서 사용 가능)
window.getGameStats = getGameStats; 