class PuzzleGame {
    constructor() {
        this.grid = Array(16).fill(null);
        this.puzzlePieces = [];
        this.currentDragging = null;
        this.grabbedCellIndex = 0;
        this.dragPreview = null;
        this.updateDragPreviewPosition = null;
        this.stage = 1;
        
        // 그리드 드래그 관련 변수
        this.dragFromGrid = false;
        this.originalGridState = null;
        this.draggedPiecePositions = [];
        this.dropSuccessful = false;
        
        // 타이머 관련 변수
        this.remainingTime = 60; // 초 단위
        this.timerInterval = null;
        this.gameActive = true;

        // 이전 스테이지 퍼즐 조합 기억 (중복 방지용)
        this.previousPuzzleCombinations = new Set();

        this.init();
    }

    init() {
        this.setupGrid();
        this.setupEventListeners();
        this.generateRandomPuzzles();
        this.updateStageInfo();
        this.startTimer();
        this.setupPopupEventListeners();
    }

    setupGrid() {
        const grid = this.getElement('grid');
        if (grid) {
            // Fragment를 사용하여 DOM 조작 최적화
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < 16; i++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.index = i;
                fragment.appendChild(cell);
            }
            grid.innerHTML = '';
            grid.appendChild(fragment);
        }
    }

    setupEventListeners() {
        // 새 게임 버튼
        const newGameBtn = this.getElement('new-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }

        // 전역 드래그 이벤트들
        document.addEventListener('dragstart', (e) => this.onDragStart(e));
        document.addEventListener('dragover', (e) => this.onDragOver(e));
        document.addEventListener('dragenter', (e) => this.onDragEnter(e));
        document.addEventListener('dragleave', (e) => this.onDragLeave(e));
        document.addEventListener('drop', (e) => this.onDrop(e));
        document.addEventListener('dragend', (e) => this.onDragEnd(e));
    }

    setupPopupEventListeners() {
        // 다시하기 버튼
        const retryBtn = this.getElement('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.hideGameOverPopup();
                this.startNewGame();
            });
        }

        // 메인으로 가기 버튼
        const mainBtn = this.getElement('main-btn');
        if (mainBtn) {
            mainBtn.addEventListener('click', () => {
                this.hideGameOverPopup();
                this.goToMainPage();
            });
        }

        // 팝업 외부 클릭 시 닫기 (선택적)
        const popup = this.getElement('game-over-popup');
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target.id === 'game-over-popup') {
                    // 팝업 외부 클릭으로는 닫지 않음 (게임오버이므로 선택을 강제)
                }
            });
        }
    }



    // 기존 generateRandomPuzzles, createPuzzlePiece, displayPuzzlePieces 등 함수들...
    // ... existing code ...

    // 퍼즐 조각 생성 및 표시
    createPuzzlePiece(puzzle, id) {
        const colors = [
            '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', 
            '#F44336', '#00BCD4', '#795548', '#607D8B'
        ];
        
        const pieceColor = colors[id % colors.length];
        const bounds = this.calculateBounds(puzzle.shape);
        const container = document.createElement('div');
        container.className = 'puzzle-piece';
        container.dataset.puzzleId = id;

        // 퍼즐 정보 라벨 (숨김)
        const label = document.createElement('div');
        label.className = 'piece-label';
        label.style.display = 'none'; // 라벨 숨김
        label.draggable = false;

        // 퍼즐 그리드
        const pieceGrid = document.createElement('div');
        pieceGrid.className = 'piece-grid';
        pieceGrid.style.display = 'grid';
        pieceGrid.style.gridTemplateColumns = `repeat(${bounds.maxCol - bounds.minCol + 1}, 1fr)`;
        pieceGrid.style.gridTemplateRows = `repeat(${bounds.maxRow - bounds.minRow + 1}, 1fr)`;

        // 셀 생성
        for (let row = bounds.minRow; row <= bounds.maxRow; row++) {
            for (let col = bounds.minCol; col <= bounds.maxCol; col++) {
                const cell = document.createElement('div');
                cell.className = 'piece-cell';
                
                const hasCell = puzzle.shape.some(([r, c]) => r === row && c === col);
                
                if (hasCell) {
                    cell.style.opacity = '1';
                    cell.style.background = pieceColor;
                    cell.style.borderColor = pieceColor;
                    cell.textContent = '■';
                    cell.draggable = true;
                    cell.style.cursor = 'grab';
                    cell.dataset.puzzleId = id;
                    
                    const cellIndexInPuzzle = puzzle.shape.findIndex(([r, c]) => r === row && c === col);
                    cell.dataset.cellIndex = cellIndexInPuzzle;
                    
                    // 셀 드래그 이벤트
                    cell.addEventListener('dragstart', (e) => {
                        e.stopPropagation();
                        this.currentDragging = id;
                        this.grabbedCellIndex = cellIndexInPuzzle;
                        container.classList.add('dragging');
                        
                        // 클릭한 정확한 위치 계산 (셀 내에서의 상대 위치)
                        const cellRect = cell.getBoundingClientRect();
                        this.clickOffsetX = e.clientX - cellRect.left;
                        this.clickOffsetY = e.clientY - cellRect.top;
                        
                        this.createDragPreview(puzzle, id, pieceColor, e);
                        
                        const emptyImg = new Image();
                        emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
                        e.dataTransfer.setDragImage(emptyImg, 0, 0);
                        
                        e.dataTransfer.setData('text/plain', id);
                        e.dataTransfer.effectAllowed = 'move';
                    });
                    
                    cell.addEventListener('dragend', (e) => {
                        e.stopPropagation();
                        container.classList.remove('dragging');
                        this.currentDragging = null;
                        this.removeDragPreview();
                    });
                } else {
                    cell.style.opacity = '0';
                    cell.style.background = 'transparent';
                    cell.style.border = 'none';
                    cell.textContent = '';
                    cell.style.pointerEvents = 'none';
                    cell.draggable = false;
                }
                
                pieceGrid.appendChild(cell);
            }
        }

        // 라벨 드래그 이벤트 (제거됨 - 라벨이 숨겨져 있음)

        container.appendChild(label);
        container.appendChild(pieceGrid);

        return container;
    }





    // 4x4 그리드를 랜덤하게 쪼개서 퍼즐 생성
    generateRandomPuzzles() {
        // 스테이지에 따라 퍼즐 조각 개수 결정
        let pieceCount;
        if (this.stage <= 3) {
            pieceCount = 3 + this.stage; // 1스테이지=4개, 2스테이지=5개, 3스테이지=6개
        } else if (this.stage <= 4) {
            pieceCount = 6 + Math.floor(Math.random() * 3); // 4스테이지=6~8개 랜덤
        } else {
            pieceCount = 5 + Math.floor(Math.random() * 3); // 5스테이지 이후=5~7개 랜덤
        }
        
        // 성공적으로 퍼즐을 생성할 때까지 반복
        let pieces = null;
        let attempts = 0;
        const maxAttempts = 200; // 시도 횟수 증가
        
        while (pieces === null && attempts < maxAttempts) {
            pieces = this.generateGridPieces(pieceCount);
            attempts++;
        }
        
        // 만약 최대 시도 횟수만큼 시도해도 실패하면 다른 조각 개수로 시도
        if (pieces === null) {

            
            // 스테이지에 따른 대체 조각 개수들
            let alternativeCounts;
            if (this.stage <= 3) {
                alternativeCounts = [4, 5, 6].filter(count => count !== pieceCount);
            } else if (this.stage <= 4) {
                alternativeCounts = [6, 7, 8].filter(count => count !== pieceCount);
            } else {
                alternativeCounts = [5, 6, 7].filter(count => count !== pieceCount);
            }
            
            for (const altCount of alternativeCounts) {
                attempts = 0;
                while (pieces === null && attempts < 50) {
                    pieces = this.generateGridPieces(altCount);
                    attempts++;
                }
                if (pieces !== null) {

                    break;
                }
            }
        }
        
        // 여전히 실패하면 스테이지에 맞는 간단한 조합으로 대체
        if (pieces === null) {

            
            if (this.stage <= 3) {
                // 1-3스테이지: 4개 조각
                pieces = [
                    [[0,0], [0,1], [0,2], [0,3]], // 가로 1줄
                    [[1,0], [1,1], [1,2], [1,3]], // 가로 1줄
                    [[2,0], [2,1], [2,2], [2,3]], // 가로 1줄
                    [[3,0], [3,1], [3,2], [3,3]]  // 가로 1줄
                ];
            } else if (this.stage <= 4) {
                // 4스테이지: 6개 조각
                pieces = [
                    [[0,0], [0,1]], // 2칸
                    [[0,2], [0,3]], // 2칸
                    [[1,0], [1,1]], // 2칸
                    [[1,2], [1,3]], // 2칸
                    [[2,0], [2,1], [2,2], [2,3]], // 4칸
                    [[3,0], [3,1], [3,2], [3,3]]  // 4칸
                ];
            } else {
                // 5스테이지 이후: 5개 조각
                pieces = [
                    [[0,0], [0,1], [0,2]], // 3칸
                    [[0,3], [1,3]], // 2칸
                    [[1,0], [1,1], [1,2]], // 3칸
                    [[2,0], [2,1], [2,2], [2,3]], // 4칸
                    [[3,0], [3,1], [3,2], [3,3]]  // 4칸
                ];
            }
        }
        
        this.puzzlePieces = pieces.map((piece, index) => ({
            name: `조각${index + 1}`,
            shape: piece,
            id: index,
            placed: false,
            position: null
        }));
        
        // 성공적으로 생성된 퍼즐 조합을 사용된 것으로 기록 (스테이지 1부터 모든 조합 기록)
        this.markCombinationAsUsed(pieces);
        
        this.displayPuzzlePieces();
        this.updateStatus(`스테이지 ${this.stage}: ${this.puzzlePieces.length}개의 퍼즐 조각을 모두 배치하세요! (총 16칸)`);
    }

    // 4x4 그리드를 지정된 개수의 조각으로 분할 (최적화됨)
    generateGridPieces(pieceCount) {
        const maxAttempts = 200; // 시도 횟수 증가 (중복 체크로 인해 더 많은 시도 필요)
        let attempts = 0;
        
        // 캐시된 검증 함수들
        const hasSmallPieces = (sizes) => this.stage >= 5 && sizes.some(size => size === 1);
        const hasMultipleLinearPuzzles = (pieces) => {
            const linearCount = pieces.filter(piece => this.isLinearPuzzle(piece)).length;
            return linearCount > 2; // 1자 퍼즐 최대 2개까지 허용 (완화)
        };
        
        // 전체 조합 중복 체크 함수
        const isDuplicateCombination = (pieces) => {
            return this.isCombinationUsed(pieces);
        };
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // 16칸을 pieceCount개로 나누기
            const sizes = this.generatePieceSizes(pieceCount);
            
            // 5단계 이상에서 1칸짜리가 있으면 다시 시도
            if (hasSmallPieces(sizes)) {
                continue;
            }
            
            // 4x4 그리드에서 연결된 영역들 생성
            const pieces = this.createConnectedRegions(sizes);
            
            if (pieces && pieces.length === pieceCount) {
                // 생성된 조각들 크기 재검증
                const actualSizes = pieces.map(piece => piece.length);
                if (hasSmallPieces(actualSizes)) {
                    continue; // 1칸짜리가 있으면 다시 시도
                }
                
                // 1자 퍼즐 개수 확인 (최대 2개까지 허용)
                if (hasMultipleLinearPuzzles(pieces)) {
                    continue; // 1자 퍼즐이 3개 이상이면 다시 시도
                }
                
                // 전체 조합 중복 체크 (스테이지 2부터 이전 모든 스테이지와 비교)
                if (this.stage >= 2 && isDuplicateCombination(pieces)) {
                    continue; // 이전 스테이지들과 동일한 조합이면 다시 시도
                }
                
                return pieces;
            }
        }
        
        // 알고리즘이 실패하면 단순히 다시 시도
        return null;
    }

    // 16칸을 지정된 개수로 나누기 (각 조각 크기 제한)
    generatePieceSizes(pieceCount) {
        const sizes = [];
        let remaining = 16;
        const maxPieceSize = 8; // 하나의 조각 최대 8칸까지 허용 (증가)
        const minPieceSize = this.stage >= 5 ? 2 : 1; // 5단계 이상부터는 최소 2칸, 그 이전에는 1칸도 허용
        
        for (let i = 0; i < pieceCount - 1; i++) {
            const maxSize = Math.min(maxPieceSize, remaining - (pieceCount - i - 1) * minPieceSize); // 남은 조각들을 위해 최소 크기만큼 남겨둠
            const calculatedMinSize = Math.max(minPieceSize, Math.ceil(remaining / (pieceCount - i)) - 1); // 최소 크기, 균등 분배에서 ±1
            
            // 더 다양한 크기 생성 (최소~최소+4칸 사이)
            const randomVariation = Math.floor(Math.random() * 5); // 0~4
            const size = Math.min(maxSize, Math.max(calculatedMinSize, minPieceSize + randomVariation));
            sizes.push(size);
            remaining -= size;
        }
        
        // 마지막 조각도 크기 제한 확인
        if (remaining > 0) {
            if (remaining > maxPieceSize || remaining < minPieceSize) {
                // 마지막 조각이 너무 크거나 작으면 다시 분배
                return this.redistributePieceSizes(pieceCount);
            }
            sizes.push(remaining);
        }
        
        // 섞어서 랜덤하게 배치
        return this.shuffleArray(sizes);
    }

    // 조각 크기 재분배 (너무 큰 조각이 생겼을 때)
    redistributePieceSizes(pieceCount) {
        const sizes = [];
        let remaining = 16;
        const targetSize = Math.floor(16 / pieceCount); // 평균 크기
        const minPieceSize = this.stage >= 5 ? 2 : 1; // 5단계 이상부터는 최소 2칸
        
        for (let i = 0; i < pieceCount - 1; i++) {
            const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
            const size = Math.max(minPieceSize, Math.min(5, targetSize + variation)); // 최소크기~5칸 사이
            sizes.push(size);
            remaining -= size;
        }
        
        if (remaining > 0 && remaining <= 6 && remaining >= minPieceSize) {
            sizes.push(remaining);
        } else {
            // 여전히 문제가 있으면 균등 분배
            const equalSize = Math.floor(16 / pieceCount);
            const remainder = 16 % pieceCount;
            
            for (let i = 0; i < pieceCount; i++) {
                const baseSize = equalSize + (i < remainder ? 1 : 0);
                sizes[i] = Math.max(minPieceSize, baseSize);
            }
        }
        
        return this.shuffleArray(sizes);
    }

    // 4x4 그리드에서 연결된 영역들 생성
    createConnectedRegions(sizes) {
        const grid = Array(4).fill().map(() => Array(4).fill(-1));
        const pieces = [];
        
        for (let pieceIndex = 0; pieceIndex < sizes.length; pieceIndex++) {
            const size = sizes[pieceIndex];
            const piece = this.growConnectedRegion(grid, pieceIndex, size);
            
            if (piece.length !== size) {
                return null; // 실패
            }
            
            pieces.push(piece);
        }
        
        return pieces;
    }

    // 연결된 영역을 점진적으로 확장
    growConnectedRegion(grid, pieceId, targetSize) {
        // 빈 셀 찾기
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === -1) {
                    emptyCells.push([r, c]);
                }
            }
        }
        
        if (emptyCells.length === 0) return [];
        
        // 랜덤한 시작점 선택
        const startCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const piece = [startCell];
        grid[startCell[0]][startCell[1]] = pieceId;
        
        // 인접한 빈 셀들을 하나씩 추가
        while (piece.length < targetSize) {
            const candidates = [];
            
            // 현재 조각에 인접한 빈 셀들 찾기
            for (const [r, c] of piece) {
                const neighbors = [[r-1,c], [r+1,c], [r,c-1], [r,c+1]];
                
                for (const [nr, nc] of neighbors) {
                    if (nr >= 0 && nr < 4 && nc >= 0 && nc < 4 && grid[nr][nc] === -1) {
                        candidates.push([nr, nc]);
                    }
                }
            }
            
            if (candidates.length === 0) break; // 더 이상 확장할 수 없음
            
            // 중복 제거
            const uniqueCandidates = candidates.filter((candidate, index) => {
                return candidates.findIndex(c => c[0] === candidate[0] && c[1] === candidate[1]) === index;
            });
            
            // 랜덤하게 하나 선택
            const newCell = uniqueCandidates[Math.floor(Math.random() * uniqueCandidates.length)];
            piece.push(newCell);
            grid[newCell[0]][newCell[1]] = pieceId;
        }
        
        return piece;
    }

    // 배열 섞기
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // 퍼즐 조합을 문자열로 변환 (중복 체크용)
    combinationToString(pieces) {
        // 각 조각을 정규화하여 문자열로 변환
        const normalizedPieces = pieces.map(piece => this.normalizeShape(piece));
        
        // 조각들을 정렬하여 순서에 상관없이 같은 조합으로 인식
        const sortedPieces = normalizedPieces.sort((a, b) => {
            const aStr = JSON.stringify(a);
            const bStr = JSON.stringify(b);
            return aStr.localeCompare(bStr);
        });
        
        const result = JSON.stringify(sortedPieces);
        return result;
    }

    // 퍼즐 모양 정규화 (대칭만 고려)
    normalizeShape(shape) {
        if (shape.length === 0) return [];
        
        // 먼저 상대 좌표로 변환 (좌상단을 (0,0)으로)
        const relativeShape = this.toRelativeCoordinates(shape);
        
        // 모든 가능한 변형 생성 (대칭만)
        const variations = this.generateShapeVariations(relativeShape);
        
        // 사전순으로 가장 작은 것을 반환 (표준 형태)
        return variations.reduce((min, variation) => {
            const minStr = JSON.stringify(min);
            const varStr = JSON.stringify(variation);
            return varStr < minStr ? variation : min;
        });
    }

    // 절대 좌표를 상대 좌표로 변환
    toRelativeCoordinates(shape) {
        if (shape.length === 0) return [];
        
        // 최소 row, col 찾기
        const minRow = Math.min(...shape.map(([r, c]) => r));
        const minCol = Math.min(...shape.map(([r, c]) => c));
        
        // 모든 좌표를 최소값 기준으로 이동
        const relative = shape.map(([r, c]) => [r - minRow, c - minCol]);
        
        // 좌표 순서 정규화 (row 우선, col 차순으로 정렬)
        return relative.sort((a, b) => {
            if (a[0] !== b[0]) return a[0] - b[0]; // row 비교
            return a[1] - b[1]; // col 비교
        });
    }

    // 모양의 모든 변형 생성 (대칭만 고려)
    generateShapeVariations(shape) {
        if (shape.length === 0) return [[]];
        
        const variations = [];
        
        // 원본
        variations.push([...shape]);
        
        // 각 변형을 생성하고 상대 좌표로 정규화
        
        // 가로 대칭 (좌우 뒤집기)
        const maxCol = Math.max(...shape.map(([r, c]) => c));
        const horizontalFlip = shape.map(([r, c]) => [r, maxCol - c]);
        variations.push(this.toRelativeCoordinates(horizontalFlip));
        
        // 세로 대칭 (상하 뒤집기)
        const maxRow = Math.max(...shape.map(([r, c]) => r));
        const verticalFlip = shape.map(([r, c]) => [maxRow - r, c]);
        variations.push(this.toRelativeCoordinates(verticalFlip));
        
        // 가로+세로 대칭 (180도 회전과 동일)
        const bothFlip = shape.map(([r, c]) => [maxRow - r, maxCol - c]);
        variations.push(this.toRelativeCoordinates(bothFlip));
        
        return variations;
    }

    // 퍼즐 조합이 이전에 사용되었는지 확인
    isCombinationUsed(pieces) {
        const combinationStr = this.combinationToString(pieces);
        return this.previousPuzzleCombinations.has(combinationStr);
    }

    // 퍼즐 조합을 사용된 것으로 기록
    markCombinationAsUsed(pieces) {
        const combinationStr = this.combinationToString(pieces);
        this.previousPuzzleCombinations.add(combinationStr);
    }

    // 1자(일직선) 퍼즐인지 확인
    isLinearPuzzle(shape) {
        if (shape.length < 2) return false;
        
        const rows = shape.map(coord => coord[0]);
        const cols = shape.map(coord => coord[1]);
        
        // 가로 일직선 확인 (모든 row가 같고, col이 연속적)
        const allSameRow = rows.every(row => row === rows[0]);
        if (allSameRow) {
            const sortedCols = [...cols].sort((a, b) => a - b);
            const isConsecutive = sortedCols.every((col, index) => 
                index === 0 || col === sortedCols[index - 1] + 1
            );
            if (isConsecutive) return true;
        }
        
        // 세로 일직선 확인 (모든 col이 같고, row가 연속적)
        const allSameCol = cols.every(col => col === cols[0]);
        if (allSameCol) {
            const sortedRows = [...rows].sort((a, b) => a - b);
            const isConsecutive = sortedRows.every((row, index) => 
                index === 0 || row === sortedRows[index - 1] + 1
            );
            if (isConsecutive) return true;
        }
        
        return false;
    }

    // 타이머 관련 메서드들
    calculateTimeLimit() {
        // 3스테이지마다 5초씩 감소, 최소 30초
        const reductionSteps = Math.floor((this.stage - 1) / 3);
        const timeLimit = Math.max(30, 60 - (reductionSteps * 5));
        return timeLimit;
    }

    startTimer() {
        this.stopTimer(); // 기존 타이머 정지
        this.remainingTime = this.calculateTimeLimit();
        this.gameActive = true;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        if (!this.gameActive) return;
        
        this.remainingTime--;
        this.updateTimerDisplay();
        
        if (this.remainingTime <= 0) {
            this.onTimeUp();
        }
    }

    updateTimerDisplay() {
        const timerElement = this.getElement('timer');
        if (timerElement) {
            const formattedTime = this.formatTime(this.remainingTime);
            timerElement.textContent = `⏰ ${formattedTime}`;
            
            // 10초 이하일 때 경고 스타일 추가
            if (this.remainingTime <= 10) {
                timerElement.classList.add('warning');
            } else {
                timerElement.classList.remove('warning');
            }
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    onTimeUp() {
        this.gameActive = false;
        this.stopTimer();
        
        // 모든 드래그 중단
        this.cancelDragIfActive();
        this.finishDrag();
        
        // 타이머 표시를 빨간색으로
        const timerElement = this.getElement('timer');
        if (timerElement) {
            timerElement.textContent = '⏰ 00:00';
            timerElement.classList.add('warning');
        }
        
        // 게임오버 팝업 표시
        this.showGameOverPopup();
    }

    // 게임오버 팝업 표시
    showGameOverPopup() {
        // 팝업 정보 업데이트
        const stageElement = this.getElement('popup-stage');
        const completedElement = this.getElement('popup-completed');
        
        if (stageElement) stageElement.textContent = this.stage;

        
        // 팝업 표시
        const popup = this.getElement('game-over-popup');
        if (popup) {
            popup.style.display = 'flex';
            // 애니메이션을 위해 약간의 지연
            setTimeout(() => {
                popup.classList.add('show');
            }, 10);
        }
    }

    // 게임오버 팝업 숨기기
    hideGameOverPopup() {
        const popup = this.getElement('game-over-popup');
        if (popup) {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.style.display = 'none';
            }, 300); // 애니메이션 시간과 맞춤
        }
    }

    // 메인 페이지로 이동
    goToMainPage() {
        // 상위 디렉토리의 index.html로 이동
        window.location.href = '../../index.html';
    }

    // 4x4 그리드에 실제로 배치 가능한 검증된 조합들만
    getValidCombinations() {
        const shapes = this.getPolyominoShapes();
        
        return [
            // 안전한 테트로미노 조합들 (4x4에 확실히 배치 가능)
            [shapes.tetromino[1], shapes.tetromino[1], shapes.tetromino[1], shapes.tetromino[1]], // O형 4개 (2x2가 4개)
            [shapes.tetromino[2], shapes.tetromino[2], shapes.tetromino[1], shapes.tetromino[1]], // T형 2개, O형 2개
            [shapes.tetromino[3], shapes.tetromino[4], shapes.tetromino[1], shapes.tetromino[1]], // L형, J형, O형 2개
            [shapes.tetromino[5], shapes.tetromino[6], shapes.tetromino[1], shapes.tetromino[1]], // S형, Z형, O형 2개
            
            // 테트로미노 4개 (I형 제외, 배치 어려운 조합 제외)
            [shapes.tetromino[1], shapes.tetromino[2], shapes.tetromino[3], shapes.tetromino[4]], // O,T,L,J
            [shapes.tetromino[1], shapes.tetromino[2], shapes.tetromino[5], shapes.tetromino[6]], // O,T,S,Z
            [shapes.tetromino[2], shapes.tetromino[3], shapes.tetromino[4], shapes.tetromino[5]], // T,L,J,S
            
            // 작은 조각 많은 조합 (확실히 배치 가능)
            [shapes.tetromino[1], shapes.triomino[0], shapes.triomino[1], shapes.triomino[0], shapes.triomino[1]], // O형 + I3형 2개 + L3형 2개
            [shapes.tetromino[2], shapes.triomino[0], shapes.triomino[1], shapes.triomino[0], shapes.triomino[1]], // T형 + I3형 2개 + L3형 2개
        ];
    }

    // 퍼즐 조각들 화면에 표시 (좌우 분할: 왼쪽 2x2, 오른쪽 2x2)
    displayPuzzlePieces() {

        const leftContainer = this.getElement('puzzle-pieces-left');
        const rightContainer = this.getElement('puzzle-pieces-right');
        
        if (leftContainer && rightContainer) {
            leftContainer.innerHTML = '';
            rightContainer.innerHTML = '';
            
            this.puzzlePieces.forEach((puzzle, index) => {
                            const pieceElement = this.createPuzzlePiece(puzzle, index);
                
                // 처음 4개는 왼쪽(2x2), 나머지 4개는 오른쪽(2x2)에 배치
                if (index < 4) {
                    leftContainer.appendChild(pieceElement);
                } else {
                    rightContainer.appendChild(pieceElement);
                }
            });
    
        } else {
            console.error('퍼즐 컨테이너를 찾을 수 없습니다!');
        }
    }

    // 바운딩 박스 계산
    calculateBounds(shape) {
        const rows = shape.map(coord => coord[0]);
        const cols = shape.map(coord => coord[1]);
        
        return {
            minRow: Math.min(...rows),
            maxRow: Math.max(...rows),
            minCol: Math.min(...cols),
            maxCol: Math.max(...cols)
        };
    }

    // 그리드 드래그 시작
    startGridDrag(e, cell, index, pieceId, puzzle) {
        if (!this.gameActive) return; // 게임이 비활성화되면 드래그 차단
        
        // 드래그 상태 설정
        this.currentDragging = pieceId;
        this.dragFromGrid = true;
        this.dropSuccessful = false;
        this.originalGridState = [...this.grid];
        
        // grabbedCellIndex 계산
        this.calculateGridGrabbedCell(index, pieceId);
        
        // 클릭한 정확한 위치 계산 (셀 내에서의 상대 위치)
        const cellRect = cell.getBoundingClientRect();
        this.clickOffsetX = e.clientX - cellRect.left;
        this.clickOffsetY = e.clientY - cellRect.top;
        
        // 그리드에서 임시 제거
        this.temporarilyRemoveFromGrid(pieceId);
        
        // 프리뷰 생성
        const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#795548', '#607D8B'];
        const pieceColor = colors[pieceId % colors.length];
        this.createDragPreview(puzzle, pieceId, pieceColor, e);
        
        // 마우스 커서 변경
        cell.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';
        
        this.updateStatus('퍼즐 조각을 새로운 위치에 놓으세요!');
        
        // 마우스 이벤트 바인딩
        this.bindMouseDragEvents();
    }

    // 활성 드래그 취소
    cancelDragIfActive() {
        if (this.currentDragging !== null) {
            // 원래 위치로 복원
            this.restoreOriginalPosition();
            
            // 드래그 상태 정리
            this.finishDrag();
            
            // 커서 복원
            document.body.style.cursor = '';
        }
    }

    // 그리드 이벤트 다시 바인딩
    rebindGridEvents() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            // 기존 이벤트 리스너 제거
            cell.replaceWith(cell.cloneNode(true));
        });
        
        // 새로 선택된 셀들에 이벤트 바인딩 - 마우스 이벤트 기반으로 완전히 새로 구현
        const newCells = document.querySelectorAll('.grid-cell');
        newCells.forEach((cell, index) => {
            if (this.grid[index] !== null) {
                const pieceId = this.grid[index];
                const puzzle = this.puzzlePieces[pieceId];
                
                // 그리드 셀 스타일 설정
                cell.style.cursor = 'grab';
                cell.style.userSelect = 'none';
                
                // 클릭으로 드래그 시작
                cell.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.startGridDrag(e, cell, index, pieceId, puzzle);
                });
            }
        });
    }

    // 그리드에서 클릭한 셀의 grabbedCellIndex 계산
    calculateGridGrabbedCell(cellIndex, pieceId) {
        // 해당 퍼즐 조각이 차지하는 모든 위치 찾기
        this.draggedPiecePositions = [];
        for (let i = 0; i < 16; i++) {
            if (this.grid[i] === pieceId) {
                this.draggedPiecePositions.push(i);
            }
        }
        
        this.grabbedCellIndex = 0; // 기본값
        
        const puzzle = this.puzzlePieces[pieceId];
        if (puzzle && this.draggedPiecePositions.length > 0) {
            // 퍼즐이 차지하는 위치들의 최소 행/열 찾기 (왼쪽 위 모서리)
            const minGridRow = Math.min(...this.draggedPiecePositions.map(pos => Math.floor(pos / 4)));
            const minGridCol = Math.min(...this.draggedPiecePositions.map(pos => pos % 4));
            
            // 클릭한 셀의 행/열
            const clickedRow = Math.floor(cellIndex / 4);
            const clickedCol = cellIndex % 4;
            
            // 클릭한 셀이 퍼즐 시작점에서 얼마나 떨어져 있는지 계산
            const offsetRow = clickedRow - minGridRow;
            const offsetCol = clickedCol - minGridCol;
            
            // puzzle.shape에서 최소 행/열 찾기
            const minShapeRow = Math.min(...puzzle.shape.map(coord => coord[0]));
            const minShapeCol = Math.min(...puzzle.shape.map(coord => coord[1]));
            
            // 클릭한 위치에 해당하는 shape 좌표 계산
            const targetShapeRow = minShapeRow + offsetRow;
            const targetShapeCol = minShapeCol + offsetCol;
            
            // puzzle.shape에서 해당 좌표를 가진 셀의 인덱스 찾기
            for (let i = 0; i < puzzle.shape.length; i++) {
                const [shapeRow, shapeCol] = puzzle.shape[i];
                if (shapeRow === targetShapeRow && shapeCol === targetShapeCol) {
                    this.grabbedCellIndex = i;
                    break;
                }
            }
        }
    }

    // 마우스 드래그 이벤트 바인딩
    bindMouseDragEvents() {
        // 기존 이벤트 제거
        this.unbindMouseDragEvents();
        
        // 마우스 업 이벤트
        this.mouseUpHandler = (e) => {
            this.handleMouseUp(e);
        };
        
        // 마우스 무브 이벤트 (프리뷰 업데이트용)
        this.mouseMoveHandler = (e) => {
            if (this.updateDragPreviewPosition) {
                this.updateDragPreviewPosition(e);
            }
        };
        
        document.addEventListener('mouseup', this.mouseUpHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    // 마우스 드래그 이벤트 해제
    unbindMouseDragEvents() {
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler);
            this.mouseUpHandler = null;
        }
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler);
            this.mouseMoveHandler = null;
        }
    }

    // 마우스 업 처리
    handleMouseUp(e) {
        // 커서 복원
        document.body.style.cursor = '';
        
        if (!this.gameActive) {
            this.finishDrag();
            return; // 게임이 비활성화되면 처리 중단
        }
        
        // 드롭할 위치 찾기
        const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
        
        let targetCell = null;
        if (elementBelow && elementBelow.classList.contains('grid-cell')) {
            targetCell = elementBelow;
        } else if (elementBelow && elementBelow.closest('.grid-cell')) {
            targetCell = elementBelow.closest('.grid-cell');
        }
        
        if (targetCell) {
            const cellIndex = parseInt(targetCell.dataset.index);
            const puzzle = this.puzzlePieces[this.currentDragging];
            
            if (this.canPlacePuzzle(puzzle, cellIndex)) {
                this.placePuzzle(puzzle, cellIndex);
                this.dropSuccessful = true;
                this.updateStatus('퍼즐 조각이 배치되었습니다!');
                this.checkGameComplete();
            } else {
                this.restoreOriginalPosition();
                this.updateStatus('그 위치에는 놓을 수 없습니다. 원래 위치로 되돌렸습니다.');
            }
        } else {
            // 그리드 밖으로 드래그한 경우 - 배치 취소 (그리드에서 제거)
            if (this.dragFromGrid) {
                this.removePieceFromGrid(this.currentDragging);
                this.updateStatus('퍼즐 조각을 그리드에서 제거했습니다.');
            } else {
                this.updateStatus('원래 위치로 되돌렸습니다.');
            }
        }
        
        // 정리
        this.finishDrag();
    }

    // 드래그 완료 정리
    finishDrag() {
        this.removeDragPreview();
        this.unbindMouseDragEvents();
        
        this.currentDragging = null;
        this.dragFromGrid = false;
        this.originalGridState = null;
        this.draggedPiecePositions = [];
        this.dropSuccessful = false;
        this.clickOffsetX = undefined;
        this.clickOffsetY = undefined;
        this.clearHighlights();
    }

    onDragStart(e) {
        if (!this.gameActive) return; // 게임이 비활성화되면 드래그 차단
        
        // 퍼즐 조각 영역에서 드래그하는 경우만 처리 (그리드는 개별 이벤트에서 처리)
        if (e.target.classList.contains('puzzle-piece') || e.target.classList.contains('piece-cell')) {
            let puzzleElement = e.target;
            if (e.target.classList.contains('piece-cell')) {
                puzzleElement = e.target.closest('.puzzle-piece');
            }
            
            this.currentDragging = parseInt(puzzleElement.dataset.puzzleId);
            this.dragFromGrid = false;
            this.dropSuccessful = false;
            puzzleElement.classList.add('dragging');
            
            this.grabbedCellIndex = this.calculateGrabbedCell(e, puzzleElement);
            
            // 클릭한 정확한 위치 계산
            if (e.target.classList.contains('piece-cell')) {
                const cellRect = e.target.getBoundingClientRect();
                this.clickOffsetX = e.clientX - cellRect.left;
                this.clickOffsetY = e.clientY - cellRect.top;
            } else {
                // piece-cell이 아닌 경우 (라벨 등) 기본값 설정
                const cellSize = window.innerWidth <= 768 ? 55 : 70;
                this.clickOffsetX = cellSize / 2;
                this.clickOffsetY = cellSize / 2;
            }
            
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);
            
            e.dataTransfer.setData('text/plain', this.currentDragging);
            e.dataTransfer.effectAllowed = 'move';
            this.updateStatus('퍼즐 조각을 새로운 위치에 놓으세요!');
        }
    }

    calculateGrabbedCell(event, puzzleElement) {
        const puzzleId = parseInt(puzzleElement.dataset.puzzleId);
        const puzzle = this.puzzlePieces[puzzleId];
        const pieceGrid = puzzleElement.querySelector('.piece-grid');
        const rect = pieceGrid.getBoundingClientRect();
        
        const bounds = this.calculateBounds(puzzle.shape);
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const cellSize = window.innerWidth <= 768 ? 55 : 70;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        
        const absoluteRow = bounds.minRow + row;
        const absoluteCol = bounds.minCol + col;
        
        let closestIndex = 0;
        let minDistance = Infinity;
        
        puzzle.shape.forEach((coord, index) => {
            const [r, c] = coord;
            const distance = Math.abs(r - absoluteRow) + Math.abs(c - absoluteCol);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        
        return closestIndex;
    }

    onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    onDragEnter(e) {
        if (!e.target.classList.contains('grid-cell')) return;
        if (this.currentDragging === null) return;
        
        const cellIndex = parseInt(e.target.dataset.index);
        const puzzle = this.puzzlePieces[this.currentDragging];
        
        if (this.canPlacePuzzle(puzzle, cellIndex)) {
            this.highlightDropZone(cellIndex, puzzle, 'drop-zone');
        } else {
            this.highlightDropZone(cellIndex, puzzle, 'invalid-drop');
        }
    }

    onDragLeave(e) {
        if (!e.target.classList.contains('grid-cell')) return;
        this.clearHighlights();
    }

    onDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.gameActive) return; // 게임이 비활성화되면 드롭 차단
        
                if (!e.target.classList.contains('grid-cell')) {
            if (this.dragFromGrid) {
                this.restoreOriginalPosition();
                this.updateStatus('원래 위치로 되돌렸습니다.');
            }
            return;
        }
        
        const cellIndex = parseInt(e.target.dataset.index);
        const puzzleId = parseInt(e.dataTransfer.getData('text/plain'));
        const puzzle = this.puzzlePieces[puzzleId];
        

        
        this.clearHighlights();
        
        if (this.canPlacePuzzle(puzzle, cellIndex)) {

            this.placePuzzle(puzzle, cellIndex);
            
            if (!this.dragFromGrid) {
                this.showPuzzlePieceAsPlaced(puzzleId);
            }
            
            // 성공적으로 배치된 경우 플래그 설정 및 드래그 상태 완전 초기화
            this.dropSuccessful = true;
            this.removeDragPreview();
            const wasGridDrag = this.dragFromGrid;
            this.currentDragging = null;
            this.dragFromGrid = false;
            this.originalGridState = null;
            this.draggedPiecePositions = [];
            

            this.updateStatus('퍼즐 조각이 배치되었습니다! (드래그해서 다시 움직일 수 있습니다)');
            this.checkGameComplete();
            
            // 드래그 이벤트 전파 중단
            return false;
        } else {
            if (this.dragFromGrid) {
                this.restoreOriginalPosition();
                this.updateStatus('그 위치에는 놓을 수 없습니다. 원래 위치로 되돌렸습니다.');
            } else {
                this.updateStatus('여기에는 퍼즐 조각을 놓을 수 없습니다.');
            }
        }
    }

    onDragEnd(e) {

        
        if (e.target.classList.contains('puzzle-piece')) {
            e.target.classList.remove('dragging');
        }
        
        // 드래그 프리뷰 강제 제거
        this.removeDragPreview();
        
        // 성공적으로 배치된 경우는 복원하지 않음
        if (!this.dropSuccessful && this.dragFromGrid && this.currentDragging !== null) {
            
            this.restoreOriginalPosition();
            this.updateStatus('퍼즐 조각이 원래 위치로 되돌아갔습니다.');
        } else if (this.dropSuccessful) {

        }
        
        // 모든 드래그 상태 초기화
        this.currentDragging = null;
        this.dragFromGrid = false;
        this.originalGridState = null;
        this.draggedPiecePositions = [];
        this.dropSuccessful = false;  // 플래그 리셋
        this.clickOffsetX = undefined;
        this.clickOffsetY = undefined;
        this.clearHighlights();
    }

    // 드래그 프리뷰 생성 (클릭한 정확한 위치 반영)
    createDragPreview(puzzle, id, color, mouseEvent) {
        this.removeDragPreview();
        
        const cellSize = window.innerWidth <= 768 ? 55 : 70;
        const grabbedCell = puzzle.shape[this.grabbedCellIndex];
        const [grabbedRow, grabbedCol] = grabbedCell;
        
        this.previewCells = [];
        
        // 각 셀을 개별적으로 생성해서 정확한 위치에 배치
        puzzle.shape.forEach(([row, col], shapeIndex) => {
            const cell = document.createElement('div');
            cell.className = 'preview-cell';
            cell.style.position = 'fixed';
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.pointerEvents = 'none';
            cell.style.zIndex = '10000';
            cell.style.opacity = '0.8';
            
            const isGrabbedCell = shapeIndex === this.grabbedCellIndex;
            
            cell.style.background = color;
            cell.textContent = '';
            cell.style.border = `2px solid ${color}`;
            cell.style.borderRadius = '5px';
            cell.style.boxSizing = 'border-box';
            
            // 이 셀이 grabbedCell로부터 얼마나 떨어져 있는지 계산
            const offsetX = (col - grabbedCol) * cellSize;
            const offsetY = (row - grabbedRow) * cellSize;
            
            // 클릭한 정확한 위치 반영 (grabbedCell 내에서의 오프셋)
            let finalOffsetX = offsetX;
            let finalOffsetY = offsetY;
            
            if (isGrabbedCell && this.clickOffsetX !== undefined && this.clickOffsetY !== undefined) {
                // grabbedCell의 경우 클릭한 정확한 위치가 마우스에 오도록
                // 셀의 왼쪽 위 모서리가 마우스에서 클릭 오프셋만큼 떨어진 곳에 와야 함
                finalOffsetX = -this.clickOffsetX;
                finalOffsetY = -this.clickOffsetY;
            } else {
                // 다른 셀들은 grabbedCell 기준으로 상대 위치 + grabbedCell의 클릭 오프셋 적용
                if (this.clickOffsetX !== undefined && this.clickOffsetY !== undefined) {
                    finalOffsetX = offsetX - this.clickOffsetX;
                    finalOffsetY = offsetY - this.clickOffsetY;
                }
            }
            
            cell.dataset.offsetX = finalOffsetX;
            cell.dataset.offsetY = finalOffsetY;
            
            // 초기 위치 설정
            if (mouseEvent && mouseEvent.clientX && mouseEvent.clientY) {
                const cellX = mouseEvent.clientX + finalOffsetX;
                const cellY = mouseEvent.clientY + finalOffsetY;
                cell.style.left = `${cellX}px`;
                cell.style.top = `${cellY}px`;
            }
            
            document.body.appendChild(cell);
            this.previewCells.push(cell);
        });
        
        this.updateDragPreviewPosition = (e) => {
            if (this.previewCells) {
                this.previewCells.forEach(cell => {
                    const offsetX = parseFloat(cell.dataset.offsetX);
                    const offsetY = parseFloat(cell.dataset.offsetY);
                    
                    const cellX = e.clientX + offsetX;
                    const cellY = e.clientY + offsetY;
                    
                    cell.style.left = `${cellX}px`;
                    cell.style.top = `${cellY}px`;
                });
            }
        };
        
        // 마우스 이벤트와 드래그 이벤트 모두에 대응
        document.addEventListener('mousemove', this.updateDragPreviewPosition);
        document.addEventListener('dragover', this.updateDragPreviewPosition);
    }

    // 드래그 프리뷰 제거
    removeDragPreview() {
        // 새로운 방식의 preview cells 제거
        if (this.previewCells) {
            this.previewCells.forEach(cell => {
                if (cell.parentNode) {
                    cell.parentNode.removeChild(cell);
                }
            });
            this.previewCells = null;
        }
        
        // 기존 방식도 정리 (안전장치)
        const existingPreviews = document.querySelectorAll('.drag-preview, .preview-cell');
        existingPreviews.forEach(preview => {
            if (preview.parentNode) {
                preview.parentNode.removeChild(preview);
            }
        });
        
        if (this.dragPreview && this.dragPreview.parentNode) {
            this.dragPreview.parentNode.removeChild(this.dragPreview);
        }
        this.dragPreview = null;
        
        if (this.updateDragPreviewPosition) {
            document.removeEventListener('mousemove', this.updateDragPreviewPosition);
            document.removeEventListener('dragover', this.updateDragPreviewPosition);
            this.updateDragPreviewPosition = null;
        }
    }

    // 퍼즐 배치 가능 여부 확인
    canPlacePuzzle(puzzle, dropIndex) {
        const positions = this.getPuzzlePositions(dropIndex, puzzle);
        return positions.every(pos => {
            return pos !== -1 && this.grid[pos] === null;
        });
    }

    // 퍼즐이 차지할 위치들 계산
    getPuzzlePositions(dropIndex, puzzle) {
        const positions = [];
        const grabbedCoord = puzzle.shape[this.grabbedCellIndex];
        const [grabbedRow, grabbedCol] = grabbedCoord;
        
        const dropRow = Math.floor(dropIndex / 4);
        const dropCol = dropIndex % 4;
        
        const offsetRow = dropRow - grabbedRow;
        const offsetCol = dropCol - grabbedCol;
        
        puzzle.shape.forEach(([r, c]) => {
            const row = r + offsetRow;
            const col = c + offsetCol;
            
            if (row >= 4 || col >= 4 || row < 0 || col < 0) {
                positions.push(-1);
            } else {
                positions.push(row * 4 + col);
            }
        });
        
        return positions;
    }

    // 퍼즐 배치
    placePuzzle(puzzle, dropIndex) {
        const positions = this.getPuzzlePositions(dropIndex, puzzle);
        
        positions.forEach(pos => {
            if (pos !== -1) {
                this.grid[pos] = puzzle.id;
            }
        });
        
        puzzle.placed = true;
        puzzle.position = dropIndex;
        
        this.updateGridDisplay();
    }

    // 그리드 표시 업데이트
    updateGridDisplay() {
        const colors = [
            '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', 
            '#F44336', '#00BCD4', '#795548', '#607D8B'
        ];
        
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach((cell, index) => {
            if (this.grid[index] !== null) {
                const pieceId = this.grid[index];
                const pieceColor = colors[pieceId % colors.length];
                
                cell.classList.add('occupied');
                cell.textContent = '';
                cell.style.background = pieceColor;
                cell.style.borderColor = pieceColor;
                cell.style.color = 'white';
            } else {
                cell.classList.remove('occupied');
                cell.textContent = '';
                cell.style.background = '#f0f0f0';
                cell.style.borderColor = '#ddd';
                cell.style.color = '#666';
            }
        });
        
        this.rebindGridEvents();
    }

    // 퍼즐 조각 배치됨으로 표시
    showPuzzlePieceAsPlaced(puzzleId) {
        const pieceElement = document.querySelector(`[data-puzzle-id="${puzzleId}"]`);
        if (pieceElement) {
            pieceElement.style.opacity = '0.5';
            pieceElement.style.transform = 'scale(0.8)';
            pieceElement.style.pointerEvents = 'none';
            pieceElement.classList.add('placed');
        }
    }

    // 퍼즐 조각 재활성화
    showPuzzlePieceAsAvailable(puzzleId) {
        const pieceElement = document.querySelector(`[data-puzzle-id="${puzzleId}"]`);
        if (pieceElement) {
            pieceElement.style.opacity = '1';
            pieceElement.style.transform = 'scale(1)';
            pieceElement.style.pointerEvents = 'auto';
            pieceElement.classList.remove('placed');
        }
    }

    // 그리드에서 퍼즐 조각 제거
    removePieceFromGrid(pieceId) {
        if (pieceId === null || pieceId === undefined) return;
        
        for (let i = 0; i < 16; i++) {
            if (this.grid[i] === pieceId) {
                this.grid[i] = null;
            }
        }
        
        const puzzle = this.puzzlePieces[pieceId];
        if (puzzle) {
            puzzle.placed = false;
            puzzle.position = null;
        }
        
        this.updateGridDisplay();
        this.showPuzzlePieceAsAvailable(pieceId);
    }

    // 그리드에서 조각 임시 제거
    temporarilyRemoveFromGrid(pieceId) {
        for (let i = 0; i < 16; i++) {
            if (this.grid[i] === pieceId) {
                this.grid[i] = null;
            }
        }
        this.updateGridDisplay();
    }

    // 원래 위치로 복원
    restoreOriginalPosition() {
        if (this.originalGridState) {
            this.grid = [...this.originalGridState];
            this.updateGridDisplay();
        }
    }

    // 드롭 존 하이라이트
    highlightDropZone(dropIndex, puzzle, className) {
        this.clearHighlights();
        const positions = this.getPuzzlePositions(dropIndex, puzzle);
        
        positions.forEach(pos => {
            if (pos !== -1) {
                const cell = document.querySelector(`[data-index="${pos}"]`);
                if (cell) {
                    cell.classList.add(className);
                }
            }
        });
    }

    // 하이라이트 제거
    clearHighlights() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('drop-zone', 'invalid-drop');
        });
    }

    // 게임 완료 확인
    checkGameComplete() {
        if (!this.gameActive) return; // 게임이 비활성화되면 체크하지 않음
        
        // 최적화: every 대신 for 루프 사용 (더 빠른 종료 가능)
        let isGridFull = true;
        for (let i = 0; i < 16; i++) {
            if (this.grid[i] === null) {
                isGridFull = false;
                break;
            }
        }
        
        if (isGridFull) {
            this.gameActive = false; // 게임 완료 시 타이머 정지
            this.stopTimer();

            
            // 성공 액션 표시
            this.showSuccessAction();
            
            setTimeout(() => {
                this.updateStatus(`🎉 스테이지 ${this.stage} 완료! 다음 스테이지로...`);
                
                setTimeout(() => {
                    this.nextStage();
                }, 2000);
            }, 500);
        }
    }

    // 다음 스테이지로 진행
    nextStage() {
        this.stage++;
        this.grid = Array(16).fill(null);
        this.currentDragging = null;
        this.grabbedCellIndex = 0;
        
        this.dragFromGrid = false;
        this.originalGridState = null;
        this.draggedPiecePositions = [];
        this.dropSuccessful = false;
        
        this.unbindMouseDragEvents();
        this.updateGridDisplay();
        this.generateRandomPuzzles();
        
        // 스테이지 정보 업데이트
        this.updateStageInfo();
        
        // 새 스테이지에서 타이머 재시작
        this.startTimer();
        

    }

    // 상태 메시지 업데이트 (최적화됨)
    updateStatus(message) {
        // 상태 메시지는 로그만 기록 (UI 간소화를 위해)
    }

    // 스테이지 정보 업데이트
    updateStageInfo() {
        const stageElement = this.getElement('stage');
        
        if (stageElement) {
            stageElement.textContent = `스테이지 ${this.stage}`;
        }
    }

    // 성공 액션 표시
    showSuccessAction() {
        // 성공 메시지 요소 생성
        const successElement = document.createElement('div');
        successElement.className = 'success-action';
        successElement.innerHTML = `
            <div class="success-content">
                <div class="success-icon">🎉</div>
                <div class="success-text">스테이지 ${this.stage} 완료!</div>
            </div>
        `;
        
        // 게임 보드에 추가
        const gameBoard = document.querySelector('.game-board');
        if (gameBoard) {
            gameBoard.appendChild(successElement);
            
            // 애니메이션 후 제거
            setTimeout(() => {
                if (successElement.parentNode) {
                    successElement.parentNode.removeChild(successElement);
                }
            }, 2000);
        }
    }

    // 새 게임 시작
    startNewGame() {
        // 이전 게임 정리
        this.cleanup();
        
        // 게임 상태 초기화
        this.grid = Array(16).fill(null);
        this.currentDragging = null;
        this.grabbedCellIndex = 0;
        this.stage = 1;
        
        this.dragFromGrid = false;
        this.originalGridState = null;
        this.draggedPiecePositions = [];
        this.dropSuccessful = false;
        
        // 이전 퍼즐 조합 기록 초기화
        this.previousPuzzleCombinations.clear();
        
        // DOM 캐시 초기화 (새 게임에서 요소들이 재생성될 수 있으므로)
        this.clearElementCache();
        
        this.puzzlePieces.forEach(puzzle => {
            puzzle.placed = false;
            puzzle.position = null;
        });
        
        this.updateGridDisplay();
        this.generateRandomPuzzles();
        
        // 스테이지 정보 업데이트
        this.updateStageInfo();
        
        // 새 게임에서 타이머 재시작
        this.startTimer();
        
        this.updateStatus('새 게임이 시작되었습니다! 첫 번째 스테이지에 도전해보세요!');
    }

    // 메모리 정리 (게임 종료시 호출)
    cleanup() {
        // 타이머 정리
        this.stopTimer();
        
        // 마우스 이벤트 정리
        this.unbindMouseDragEvents();
        
        // 드래그 프리뷰 정리
        this.removeDragPreview();
        
        // 드래그 상태 초기화
        this.currentDragging = null;
        this.dragFromGrid = false;
        this.originalGridState = null;
        this.draggedPiecePositions = [];
        this.dropSuccessful = false;
        this.clickOffsetX = undefined;
        this.clickOffsetY = undefined;
        

    }

    // 최적화된 DOM 요소 조회 (캐싱)
    getElement(id) {
        if (!this._elementCache) {
            this._elementCache = {};
        }
        if (!this._elementCache[id]) {
            this._elementCache[id] = document.getElementById(id);
        }
        return this._elementCache[id];
    }

    // 캐시 초기화
    clearElementCache() {
        this._elementCache = {};
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
}); 