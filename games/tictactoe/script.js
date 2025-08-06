// ========================================
// 틱택토 게임 JavaScript 로직 (최적화 버전)
// ========================================

class TicTacToe {
    constructor() {
        // 게임 상태 초기화
        this.board = Array(3).fill(null).map(() => Array(3).fill(null));
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.lastWinner = null;
        this.gameMode = 'computer';
        
        // 플레이어 정보
        this.playerInfo = {
            'X': '플레이어',
            'O': '컴퓨터'
        };
        
        // 승리 조건 조합들 (가로, 세로, 대각선)
        this.winningCombinations = [
            // 가로
            [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]],
            // 세로
            [[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]],
            // 대각선
            [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]
        ];
        
        // DOM 요소 캐싱
        this.elements = {
            gameBoard: document.getElementById('game-board'),
            status: document.getElementById('status'),
            currentPlayer: document.getElementById('current-player'),
            scoreX: document.getElementById('score-x'),
            scoreO: document.getElementById('score-o'),
            restartBtn: document.getElementById('restart-btn'),
            resetScoreBtn: document.getElementById('reset-score-btn'),
            computerModeBtn: document.getElementById('computer-mode-btn'),
            pvpModeBtn: document.getElementById('pvp-mode-btn'),
            mainMenuBtn: document.getElementById('main-menu-btn')
        };
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.createBoard();
        this.addEventListeners();
        this.updateScoreboardLabels();
        this.updateScoreDisplay();
        this.updateStatus();
    }
    
    createBoard() {
        this.elements.gameBoard.innerHTML = '';
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'game-board-grid';
        
        // 3x3 그리드 생성 (최적화된 루프)
        for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', (e) => this.handleCellClick(e));
            
            gridContainer.appendChild(cell);
        }
        
        this.elements.gameBoard.appendChild(gridContainer);
    }
    
    addEventListeners() {
        // 버튼 이벤트 리스너
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        this.elements.resetScoreBtn.addEventListener('click', () => this.resetScores());
        this.elements.computerModeBtn.addEventListener('click', () => this.setGameMode('computer'));
        this.elements.pvpModeBtn.addEventListener('click', () => this.setGameMode('pvp'));
        
        // 메인 메뉴 버튼
        if (this.elements.mainMenuBtn) {
            this.elements.mainMenuBtn.addEventListener('click', () => {
                window.location.href = '../../index.html';
            });
        }
        
        // 키보드 단축키
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (key === 'r') this.restartGame();
            if (key === 's') this.resetScores();
        });
    }
    
    handleCellClick(event) {
        if (!this.gameActive || (this.gameMode === 'computer' && this.currentPlayer === 'O')) {
            return;
        }
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (this.board[row][col] !== null) return;
        
        this.makeMove(row, col);
    }
    
    makeMove(row, col) {
        // 보드에 표시 기록
        this.board[row][col] = this.currentPlayer;
        
        // UI 업데이트
        const cell = this.elements.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // 게임 상태 확인
        if (this.checkWin(row, col)) {
            this.handleWin();
        } else if (this.checkDraw()) {
            this.handleDraw();
        } else {
            this.switchPlayer();
            
            // 컴퓨터 턴 처리
            if (this.gameMode === 'computer' && this.currentPlayer === 'O') {
                setTimeout(() => this.makeComputerMove(), 500);
            }
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        
        return this.winningCombinations.some(combination => {
            const isWinning = combination.every(([r, c]) => this.board[r][c] === player);
            if (isWinning) {
                this.highlightWinningCells(combination);
                return true;
            }
            return false;
        });
    }
    
    highlightWinningCells(combination) {
        combination.forEach(([row, col]) => {
            const cell = this.elements.gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('winner');
        });
    }
    
    checkDraw() {
        return this.board.every(row => row.every(cell => cell !== null));
    }
    
    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.lastWinner = this.currentPlayer;
        
        this.updateScoreDisplay();
        this.elements.status.innerHTML = `<span style="color: #22543d; font-weight: bold;">${this.playerInfo[this.currentPlayer]}</span>가 승리했습니다!`;
        this.elements.gameBoard.classList.add('game-over');
    }
    
    handleDraw() {
        this.gameActive = false;
        this.elements.status.innerHTML = '<span style="color: #744210; font-weight: bold;">무승부입니다!</span>';
        this.elements.gameBoard.classList.add('game-over');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateStatus();
    }
    
    updateStatus() {
        this.elements.currentPlayer.textContent = this.playerInfo[this.currentPlayer];
        this.elements.currentPlayer.className = this.currentPlayer.toLowerCase();
    }
    
    updateScoreDisplay() {
        this.elements.scoreX.textContent = this.scores.X;
        this.elements.scoreO.textContent = this.scores.O;
    }
    
    restartGame() {
        // 보드 초기화
        this.board = Array(3).fill(null).map(() => Array(3).fill(null));
        
        // 선공 결정
        this.currentPlayer = this.lastWinner === 'O' ? 'O' : 'X';
        this.gameActive = true;
        
        this.createBoard();
        this.updateStatus();
        this.elements.gameBoard.classList.remove('game-over');
        
        // 컴퓨터 선공 처리
        if (this.currentPlayer === 'O') {
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }
    
    resetScores() {
        this.scores = { X: 0, O: 0 };
        this.lastWinner = null;
        this.updateScoreDisplay();
    }
    
    makeComputerMove() {
        if (!this.gameActive || this.currentPlayer !== 'O') return;
        
        const emptyCells = this.getEmptyCells();
        if (emptyCells.length === 0) {
            this.handleDraw();
            return;
        }
        
        const selectedCell = this.selectComputerMove(emptyCells);
        this.makeMove(selectedCell.row, selectedCell.col);
    }
    
    getEmptyCells() {
        const emptyCells = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }
        return emptyCells;
    }
    
    selectComputerMove(emptyCells) {
        // X의 개수 계산
        const xCount = this.board.flat().filter(cell => cell === 'X').length;
        
        // 처음 2번째 수까지만 막기
        const blockingMove = xCount <= 2 ? this.findBlockingMove() : null;
        
        return blockingMove || emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    findBlockingMove() {
        for (const combination of this.winningCombinations) {
            const [a, b, c] = combination;
            const cells = [
                this.board[a[0]][a[1]],
                this.board[b[0]][b[1]],
                this.board[c[0]][c[1]]
            ];
            
            const xCount = cells.filter(cell => cell === 'X').length;
            const emptyCount = cells.filter(cell => cell === null).length;
            
            if (xCount === 2 && emptyCount === 1) {
                // 빈 셀 위치 찾기
                for (let i = 0; i < 3; i++) {
                    if (cells[i] === null) {
                        return { row: combination[i][0], col: combination[i][1] };
                    }
                }
            }
        }
        return null;
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        
        // 버튼 상태 업데이트
        this.elements.computerModeBtn.classList.toggle('active', mode === 'computer');
        this.elements.pvpModeBtn.classList.toggle('active', mode === 'pvp');
        
        // 플레이어 정보 업데이트
        this.playerInfo = mode === 'pvp' 
            ? { 'X': '플레이어 1', 'O': '플레이어 2' }
            : { 'X': '플레이어', 'O': '컴퓨터' };
        
        // 점수 초기화
        this.scores = { X: 0, O: 0 };
        this.lastWinner = null;
        
        this.updateScoreboardLabels();
        this.updateScoreDisplay();
        this.updateStatus();
        this.restartGame();
    }
    
    updateScoreboardLabels() {
        const player1Label = document.querySelector('.score-item:first-child .player');
        const player2Label = document.querySelector('.score-item:last-child .player');
        
        if (this.gameMode === 'pvp') {
            player1Label.textContent = '플레이어 1';
            player2Label.textContent = '플레이어 2';
        } else {
            player1Label.textContent = '플레이어';
            player2Label.textContent = '컴퓨터';
        }
    }
}

// ========================================
// 게임 시작 및 전역 함수
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    window.tictactoeGame = new TicTacToe();
    console.log('틱택토 게임이 성공적으로 시작되었습니다!');
});

// 디버깅용 전역 함수
window.getGameStats = function() {
    if (window.tictactoeGame) {
        return {
            currentPlayer: window.tictactoeGame.currentPlayer,
            gameActive: window.tictactoeGame.gameActive,
            scores: window.tictactoeGame.scores,
            board: window.tictactoeGame.board
        };
    }
    return null;
}; 