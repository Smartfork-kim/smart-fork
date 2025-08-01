// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // 테마 토글 기능
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // 저장된 테마 불러오기 (기본값: 다크 모드)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    
    // 테마 토글 이벤트
    themeToggle.addEventListener('click', function() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // 슬라이더 관련 요소들
    let slides = document.querySelectorAll('.game-slide');
    let prevBtn = document.getElementById('prevBtn');
    let nextBtn = document.getElementById('nextBtn');
    let indicators = document.querySelectorAll('.indicator');
    
    let currentSlide = 0;
    let totalSlides = slides.length;

    // 슬라이더 요소 업데이트 함수
    function updateSliderElements() {
        slides = document.querySelectorAll('.game-slide');
        prevBtn = document.getElementById('prevBtn');
        nextBtn = document.getElementById('nextBtn');
        indicators = document.querySelectorAll('.indicator');
        totalSlides = slides.length;
        currentSlide = 0;
    }

    // 슬라이드 변경 함수
    function changeSlide(slideIndex) {
        // 현재 활성 슬라이드와 인디케이터에서 active 클래스 제거
        if (slides[currentSlide] && indicators[currentSlide]) {
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].classList.remove('active');
        }
        
        // 새로운 슬라이드와 인디케이터에 active 클래스 추가
        currentSlide = slideIndex;
        if (slides[currentSlide] && indicators[currentSlide]) {
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
        }
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

    // 키보드 네비게이션 (좌우 방향키)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });

    // 광고 슬라이더 기능
    const adSlides = document.querySelectorAll('.ad-slide');
    let currentAdSlide = 0;
    const totalAdSlides = adSlides.length;

    function changeAdSlide() {
        // 현재 활성 광고 슬라이드에서 active 클래스 제거
        adSlides[currentAdSlide].classList.remove('active');
        
        // 다음 슬라이드로 이동
        currentAdSlide = (currentAdSlide + 1) % totalAdSlides;
        
        // 새로운 슬라이드에 active 클래스 추가
        adSlides[currentAdSlide].classList.add('active');
    }

    // 5초마다 광고 슬라이드 자동 변경
    if (totalAdSlides > 0) {
        setInterval(changeAdSlide, 5000);
    }

    // 카테고리 필터링 기능
    const categoryLinks = document.querySelectorAll('.nav-link[data-category]');
    const allGameCards = document.querySelectorAll('.game-card');
    const gamesSliderContainer = document.querySelector('.games-slider');
    const sliderControls = document.querySelector('.slider-controls');
    const slideIndicators = document.querySelector('.slide-indicators');

    // 카테고리별 게임 분류
    const gamesByCategory = {
        all: Array.from(allGameCards),
        puzzle: Array.from(allGameCards).filter(card => card.dataset.category === 'puzzle'),
        casual: Array.from(allGameCards).filter(card => card.dataset.category === 'casual'),
        arcade: Array.from(allGameCards).filter(card => card.dataset.category === 'arcade'),
        strategy: Array.from(allGameCards).filter(card => card.dataset.category === 'strategy')
    };

    // 카테고리 필터링 함수
    function filterGamesByCategory(category) {
        // 모든 게임 카드 숨기기
        allGameCards.forEach(card => {
            card.style.display = 'none';
        });

        // 선택된 카테고리의 게임들만 보이기
        const selectedGames = gamesByCategory[category] || gamesByCategory.all;
        selectedGames.forEach(card => {
            card.style.display = 'block';
        });

        if (category === 'all') {
            // 모든게임 모드: 슬라이더 형태
            sliderControls.style.display = 'flex';
            slideIndicators.style.display = 'flex';
            reorganizeGamesIntoSlides(selectedGames);
        } else {
            // 카테고리 모드: 스크롤 가능한 그리드 형태
            sliderControls.style.display = 'none';
            slideIndicators.style.display = 'none';
            reorganizeGamesIntoGrid(selectedGames);
        }
    }

    // 게임들을 3개씩 슬라이드로 재배치 (모든게임 모드)
    function reorganizeGamesIntoSlides(games) {
        const gamesSlider = document.querySelector('.games-slider');
        
        // 기존 슬라이드 제거
        const existingSlides = gamesSlider.querySelectorAll('.game-slide');
        existingSlides.forEach(slide => slide.remove());

        // 3개씩 그룹으로 나누기
        for (let i = 0; i < games.length; i += 3) {
            const slide = document.createElement('div');
            slide.className = 'game-slide';
            if (i === 0) slide.classList.add('active');

            const gameCardsContainer = document.createElement('div');
            gameCardsContainer.className = 'game-cards';

            // 3개 게임 추가
            for (let j = i; j < Math.min(i + 3, games.length); j++) {
                gameCardsContainer.appendChild(games[j].cloneNode(true));
            }

            slide.appendChild(gameCardsContainer);
            gamesSlider.appendChild(slide);
        }

        // 슬라이더 인디케이터 업데이트
        updateSlideIndicators();
        
        // 슬라이더 요소들 업데이트
        updateSliderElements();
        
        // 이벤트 리스너 재등록
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
    }

    // 게임들을 스크롤 가능한 그리드로 재배치 (카테고리 모드)
    function reorganizeGamesIntoGrid(games) {
        const gamesSlider = document.querySelector('.games-slider');
        
        // 기존 슬라이드 제거
        const existingSlides = gamesSlider.querySelectorAll('.game-slide');
        existingSlides.forEach(slide => slide.remove());

        // 단일 슬라이드 생성 (그리드용)
        const slide = document.createElement('div');
        slide.className = 'game-slide active category-mode';

        const gameCardsContainer = document.createElement('div');
        gameCardsContainer.className = 'game-cards category-grid';

        // 모든 게임을 그리드에 추가
        games.forEach(game => {
            gameCardsContainer.appendChild(game.cloneNode(true));
        });

        slide.appendChild(gameCardsContainer);
        gamesSlider.appendChild(slide);
    }

    // 슬라이더 인디케이터 업데이트
    function updateSlideIndicators() {
        const slides = document.querySelectorAll('.game-slide');
        const indicatorsContainer = document.querySelector('.slide-indicators');
        
        // 기존 인디케이터 제거
        indicatorsContainer.innerHTML = '';
        
        // 새로운 인디케이터 생성
        slides.forEach((_, index) => {
            const indicator = document.createElement('span');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.dataset.slide = index;
            
            indicator.addEventListener('click', () => {
                changeSlide(index);
            });
            
            indicatorsContainer.appendChild(indicator);
        });
    }

    // 카테고리 링크 클릭 이벤트
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 모든 링크에서 active 클래스 제거
            categoryLinks.forEach(l => l.classList.remove('active'));
            
            // 클릭된 링크에 active 클래스 추가
            this.classList.add('active');
            
            // 카테고리 필터링 실행
            const category = this.dataset.category;
            filterGamesByCategory(category);
            
            // 카테고리 모드일 때 body에 클래스 추가
            if (category !== 'all') {
                document.body.classList.add('category-mode-active');
            } else {
                document.body.classList.remove('category-mode-active');
            }
        });
    });

    // 헤더 스크롤 숨김/표시 기능
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        // 스크롤이 최상단에 있을 때는 항상 헤더 표시
        if (currentScrollY <= 0) {
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
            return;
        }

        // 스크롤 방향 감지
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // 아래로 스크롤 (100px 이상일 때만)
            header.classList.add('header-hidden');
            header.classList.remove('header-visible');
        } else if (currentScrollY < lastScrollY) {
            // 위로 스크롤
            header.classList.remove('header-hidden');
            header.classList.add('header-visible');
        }

        lastScrollY = currentScrollY;
    }

    // 스크롤 이벤트 리스너 (throttling 적용)
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScroll, 10);
    });

    // 초기 헤더 상태 설정
    header.classList.add('header-visible');

    // 모달 기능
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalClose = document.getElementById('modalClose');
    const adInquiry = document.getElementById('adInquiry');
    const improvementRequest = document.getElementById('improvementRequest');

    // 모달 열기 함수
    function openModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // 스크롤 방지
    }

    // 모달 닫기 함수
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto'; // 스크롤 복원
    }

    // 광고문의 버튼 클릭
    adInquiry.addEventListener('click', function() {
        openModal('광고문의', '광고 관련 문의사항이 있으시면\n아래 이메일로 연락주세요.');
    });

    // 개선요청 버튼 클릭
    improvementRequest.addEventListener('click', function() {
        openModal('개선요청', '사이트 개선 및 기능 요청사항이 있으시면\n아래 이메일로 연락주세요.');
    });

    // 모달 닫기 버튼 클릭
    modalClose.addEventListener('click', closeModal);

    // 모달 배경 클릭 시 닫기
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

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

        // 카드 클릭 시 게임 시작
        card.addEventListener('click', function(e) {
            // 만약 클릭된 요소가 <a> 태그(play-btn)이면 아무 동작도 하지 않음
            if (e.target.tagName && e.target.tagName.toLowerCase() === 'a') return;
            // 내부에 <a class='play-btn'>가 있으면 해당 링크로 바로 이동
            const playLink = this.querySelector('a.play-btn');
            if (playLink && playLink.href) {
                window.location.href = playLink.href;
                return;
            }
            // 그 외에는 기존대로 모달
            const gameTitle = this.querySelector('.game-title').textContent;
            showGameModal(gameTitle);
        });
    });

    // 게임 시작 버튼 클릭 이벤트
    playButtons.forEach(button => {
        // <a> 태그면 이벤트 등록하지 않음 (링크 이동만)
        if (button.tagName.toLowerCase() === 'a') return;
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
        '솔리테어': 'games/solitaire/index.html',
        '프리셀': 'games/freecell/index.html',
        '원카드': 'games/onecard/index.html'
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
            background: var(--bg-card);
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            transform: scale(0.8);
            transition: transform 0.3s ease;
            color: var(--text-card);
            border: 1px solid var(--border-light);
        `;

        const modalHeader = modal.querySelector('.modal-header');
        modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid var(--border-light);
            padding-bottom: 15px;
        `;

        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--text-meta);
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
            background: var(--gradient-secondary);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
        `;

        const cancelBtn = modal.querySelector('.cancel-btn');
        cancelBtn.style.cssText = `
            background: var(--bg-secondary);
            color: var(--text-card);
            border: 1px solid var(--border-light);
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
    let isDragging = false;

    // 터치 이벤트 리스너
    const slider = document.querySelector('.games-slider');
    
    if (slider) {
        slider.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
        });

        slider.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // 수평 스와이프가 수직 스와이프보다 클 때만 슬라이드 변경
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                isDragging = false;
            }
        });

        slider.addEventListener('touchend', function() {
            isDragging = false;
        });
    }
}); 