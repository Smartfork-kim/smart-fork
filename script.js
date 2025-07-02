// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 슬라이더 관련 요소들
    const slides = document.querySelectorAll('.game-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    const totalSlides = slides.length;

    // 슬라이드 변경 함수
    function changeSlide(slideIndex) {
        // 현재 활성 슬라이드와 인디케이터에서 active 클래스 제거
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        
        // 새로운 슬라이드와 인디케이터에 active 클래스 추가
        currentSlide = slideIndex;
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }

    // 다음 슬라이드로 이동
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % totalSlides;
        changeSlide(nextIndex);
    }

    // 이전 슬라이드로 이동
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides;
        changeSlide(prevIndex);
    }

    // 이벤트 리스너 등록
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // 인디케이터 클릭 이벤트
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            changeSlide(index);
        });
    });

    // 키보드 네비게이션
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // 자동 슬라이드 (선택사항)
    let autoSlideInterval;
    
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // 5초마다 자동 이동
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    // 마우스가 슬라이더 위에 있을 때 자동 슬라이드 정지
    const sliderContainer = document.querySelector('.games-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoSlide);
        sliderContainer.addEventListener('mouseleave', startAutoSlide);
    }

    // 자동 슬라이드 시작
    startAutoSlide();

    // 게임 카드 클릭 이벤트
    const gameCards = document.querySelectorAll('.game-card');
    const playButtons = document.querySelectorAll('.play-btn');

    // 게임 카드 호버 효과
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });

        // 카드 클릭 시 게임 시작 (현재는 알림창으로 대체)
        card.addEventListener('click', function() {
            const gameTitle = this.querySelector('.game-title').textContent;
            showGameModal(gameTitle);
        });
    });

    // 게임 시작 버튼 클릭 이벤트
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지
            const gameTitle = this.closest('.game-card').querySelector('.game-title').textContent;
            showGameModal(gameTitle);
        });
    });

    // 게임 경로 매핑
    const gameRoutes = {
        '넘버패드 메모리': 'games/numberpad-memory/index.html',
        '스페이스 슈터': 'games/space-shooter/index.html',
        '미스터리 퀘스트': 'games/mystery-quest/index.html',
        '솔리테어 클래식': 'games/solitaire/index.html',
        '축구 챔피언': 'games/soccer-champion/index.html',
        '스피드 레이서': 'games/speed-racer/index.html'
    };

    // 게임 모달 표시 함수
    function showGameModal(gameTitle) {
        const gameUrl = gameRoutes[gameTitle];
        
        if (!gameUrl) {
            alert('이 게임은 아직 개발 중입니다!');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'game-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${gameTitle}</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${gameTitle} 게임을 시작하시겠습니까?</p>
                    <div class="modal-buttons">
                        <button class="start-game-btn">게임 시작</button>
                        <button class="cancel-btn">취소</button>
                    </div>
                </div>
            </div>
        `;

        // 모달 스타일 추가
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        const modalHeader = modal.querySelector('.modal-header');
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
        `;

        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        `;

        const modalButtons = modal.querySelector('.modal-buttons');
        modalButtons.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 20px;
            justify-content: center;
        `;

        const startBtn = modal.querySelector('.start-game-btn');
        startBtn.style.cssText = `
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
        `;

        const cancelBtn = modal.querySelector('.cancel-btn');
        cancelBtn.style.cssText = `
            background: #f0f0f0;
            color: #333;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
        `;

        // 모달 이벤트 리스너
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        startBtn.addEventListener('click', function() {
            // 게임 페이지로 이동
            window.location.href = gameUrl;
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        function closeModal() {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        }

        // 모달을 DOM에 추가하고 애니메이션 시작
        document.body.appendChild(modal);
        
        // 애니메이션을 위한 작은 지연
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
    }

    // 터치 스와이프 지원 (모바일)
    let startX = null;
    let startY = null;

    sliderContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    sliderContainer.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;

        // 수평 스와이프가 수직 스와이프보다 클 때만 처리
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) { // 최소 스와이프 거리
                if (diffX > 0) {
                    nextSlide(); // 왼쪽으로 스와이프 = 다음 슬라이드
                } else {
                    prevSlide(); // 오른쪽으로 스와이프 = 이전 슬라이드
                }
            }
        }

        startX = null;
        startY = null;
    });

    // 페이지 로드 완료 후 애니메이션 시작
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 페이지 로드 시 부드러운 페이드인 효과
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease'; 