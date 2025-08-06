// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    // debounce 함수 정의 (누락된 함수 추가)
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 테마 토글 기능
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleMobile = document.getElementById('themeToggleMobile');
    const html = document.documentElement;
    
    // 저장된 테마 불러오기 (기본값: 다크 모드)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    
    // 테마 토글 함수
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    // PC 테마 토글 이벤트
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // 모바일 테마 토글 이벤트
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', toggleTheme);
    }

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
        
        // 슬라이더 높이를 화면 크기에 따라 설정
        const gamesSlider = document.querySelector('.games-slider');
        if (gamesSlider) {
            if (window.innerWidth <= 900) { // Mobile landscape
                if (window.innerHeight > window.innerWidth) { // Portrait mode
                    gamesSlider.style.height = '520px'; // Height for a single card in portrait (481px card + 39px indicators)
                } else { // Landscape mode
                    gamesSlider.style.height = '432px'; // Height for 3 cards + indicators (390px cards + 42px indicators)
                }
            } else { // Desktop
                gamesSlider.style.height = '520px';
            }
        }
        
        // 스와이프 리스너 재설정
        addSwipeListeners();
    }

    // 슬라이드 변경 함수
    function changeSlide(slideIndex) {
        const slides = document.querySelectorAll('.game-slide');
        const indicators = document.querySelectorAll('.indicator');
        const totalSlides = slides.length;
        
        if (slideIndex === currentSlide) return;
        
        // 현재 활성 슬라이드와 인디케이터에서 active 클래스 제거
        if (slides[currentSlide] && indicators[currentSlide]) {
            slides[currentSlide].classList.remove('active');
            indicators[currentSlide].classList.remove('active');
        }
        
        // 슬라이드 방향 결정 (순환 고려)
        let isNextDirection = false;
        
        // 순환 경계 처리 먼저 확인
        if (currentSlide === totalSlides - 1 && slideIndex === 0) {
            // 마지막에서 첫 번째로 (오른쪽 버튼) - 오른쪽으로 이동
            isNextDirection = true;
        } else if (currentSlide === 0 && slideIndex === totalSlides - 1) {
            // 첫 번째에서 마지막으로 (왼쪽 버튼) - 왼쪽으로 이동
            isNextDirection = false;
        } else {
            // 일반적인 경우
            if (slideIndex > currentSlide) {
                isNextDirection = true;
            } else if (slideIndex < currentSlide) {
                isNextDirection = false;
            }
        }
        
        // 슬라이드 방향에 따라 애니메이션 적용
        if (isNextDirection) {
            // 다음 슬라이드로 이동 (오른쪽 버튼 클릭)
            // 현재 슬라이드는 왼쪽으로 사라지고, 새 슬라이드는 오른쪽에서 나타남
            if (slides[currentSlide]) {
                slides[currentSlide].style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slides[currentSlide].style.transform = 'translateX(-100%)';
                slides[currentSlide].style.opacity = '0';
            }
            if (slides[slideIndex]) {
                // 새 슬라이드를 오른쪽 끝에 위치시킴
                slides[slideIndex].style.transition = 'none';
                slides[slideIndex].style.transform = 'translateX(100%)';
                slides[slideIndex].style.opacity = '0';
                slides[slideIndex].style.display = 'block';
                slides[slideIndex].style.zIndex = '10';
                
                // 강제로 리플로우를 발생시켜 초기 위치가 적용되도록 함
                slides[slideIndex].offsetHeight;
                
                // 이제 transition을 활성화하고 동시에 움직임
                slides[slideIndex].style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slides[slideIndex].style.transform = 'translateX(0)';
                slides[slideIndex].style.opacity = '1';
                slides[slideIndex].classList.add('active');
            }
        } else {
            // 이전 슬라이드로 이동 (왼쪽 버튼 클릭)
            // 현재 슬라이드는 오른쪽으로 사라지고, 새 슬라이드는 왼쪽에서 나타남
            if (slides[currentSlide]) {
                slides[currentSlide].style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slides[currentSlide].style.transform = 'translateX(100%)';
                slides[currentSlide].style.opacity = '0';
            }
            if (slides[slideIndex]) {
                // 새 슬라이드를 왼쪽 끝에 위치시킴
                slides[slideIndex].style.transition = 'none';
                slides[slideIndex].style.transform = 'translateX(-100%)';
                slides[slideIndex].style.opacity = '0';
                slides[slideIndex].style.display = 'block';
                slides[slideIndex].style.zIndex = '10';
                
                // 강제로 리플로우를 발생시켜 초기 위치가 적용되도록 함
                slides[slideIndex].offsetHeight;
                
                // 이제 transition을 활성화하고 동시에 움직임
                slides[slideIndex].style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                slides[slideIndex].style.transform = 'translateX(0)';
                slides[slideIndex].style.opacity = '1';
                slides[slideIndex].classList.add('active');
            }
        }
        
        // 애니메이션 완료 후 스타일 초기화
        setTimeout(() => {
            slides.forEach(slide => {
                slide.style.transform = '';
                slide.style.opacity = '';
                slide.style.transition = '';
                slide.style.display = '';
                slide.style.zIndex = '';
            });
        }, 500);
        
        // 새로운 슬라이드와 인디케이터에 active 클래스 추가
        if (slides[slideIndex] && indicators[slideIndex]) {
            slides[slideIndex].classList.add('active');
            indicators[slideIndex].classList.add('active');
        }
        
        currentSlide = slideIndex;
    }

    // 다음 슬라이드로 이동
    function nextSlide() {
        const slides = document.querySelectorAll('.game-slide');
        const totalSlides = slides.length;
        const nextIndex = (currentSlide + 1) % totalSlides;
        changeSlide(nextIndex);
    }

    // 이전 슬라이드로 이동
    function prevSlide() {
        const slides = document.querySelectorAll('.game-slide');
        const totalSlides = slides.length;
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

    // 모바일 스와이프 기능
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    // 터치 시작
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        isSwiping = false;
    }

    // 터치 이동
    function handleTouchMove(e) {
        if (!isSwiping) {
            const touchX = e.touches[0].clientX;
            const diffX = Math.abs(touchX - touchStartX);
            
            // 수평 스와이프 감지 (최소 30px 이동)
            if (diffX > 30) {
                isSwiping = true;
                e.preventDefault(); // 수직 스크롤 방지
            }
        }
    }

    // 터치 종료
    function handleTouchEnd(e) {
        if (!isSwiping) return;
        
        touchEndX = e.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;
        const minSwipeDistance = 50; // 최소 스와이프 거리
        
        if (Math.abs(diffX) > minSwipeDistance) {
            if (diffX > 0) {
                // 왼쪽으로 스와이프 (다음 슬라이드)
                nextSlide();
            } else {
                // 오른쪽으로 스와이프 (이전 슬라이드)
                prevSlide();
            }
        }
        
        isSwiping = false;
    }

    // 모바일에서만 스와이프 이벤트 추가
    function addSwipeListeners() {
        const gamesSlider = document.querySelector('.games-slider');
        if (gamesSlider && (window.innerWidth <= 768 || window.innerHeight <= 500)) {
            gamesSlider.addEventListener('touchstart', handleTouchStart, { passive: false });
            gamesSlider.addEventListener('touchmove', handleTouchMove, { passive: false });
            gamesSlider.addEventListener('touchend', handleTouchEnd, { passive: false });
        }
    }

    // 페이지 로드 시 스와이프 리스너 추가
    addSwipeListeners();

    // 화면 크기 변경 시 스와이프 리스너 재설정
    window.addEventListener('resize', function() {
        const gamesSlider = document.querySelector('.games-slider');
        if (gamesSlider) {
            // 기존 이벤트 리스너 제거
            gamesSlider.removeEventListener('touchstart', handleTouchStart);
            gamesSlider.removeEventListener('touchmove', handleTouchMove);
            gamesSlider.removeEventListener('touchend', handleTouchEnd);
            
            // 새로운 이벤트 리스너 추가
            addSwipeListeners();
        }
    });



    // 광고 슬라이더 기능
    function getVisibleAdSlides() {
        // 현재 화면 크기에 따라 보이는 광고 슬라이드만 선택
        if (window.innerWidth <= 768 && window.innerHeight > 500) {
            // 모바일 세로 모드
            return document.querySelectorAll('.mobile-portrait-ad');
        } else if (window.innerWidth <= 900 && window.innerHeight <= 500) {
            // 모바일 가로 모드
            return document.querySelectorAll('.mobile-landscape-ad');
        } else {
            // 데스크톱/태블릿 모드
            return document.querySelectorAll('.desktop-ad');
        }
    }

    let currentAdSlide = 0;
    let adSlideInterval;

    function changeAdSlide() {
        const visibleAdSlides = getVisibleAdSlides();
        const totalAdSlides = visibleAdSlides.length;
        
        if (totalAdSlides === 0) return;
        
        // 현재 활성 광고 슬라이드에서 active 클래스 제거
        visibleAdSlides[currentAdSlide].classList.remove('active');
        
        // 다음 슬라이드로 이동
        currentAdSlide = (currentAdSlide + 1) % totalAdSlides;
        
        // 새로운 슬라이드에 active 클래스 추가
        visibleAdSlides[currentAdSlide].classList.add('active');
    }

    function startAdSlider() {
        // 기존 인터벌 정리
        if (adSlideInterval) {
            clearInterval(adSlideInterval);
        }
        
        // 첫 번째 보이는 광고를 활성화
        const visibleAdSlides = getVisibleAdSlides();
        if (visibleAdSlides.length > 0) {
            // 모든 광고 슬라이드에서 active 제거
            document.querySelectorAll('.ad-slide').forEach(slide => {
                slide.classList.remove('active');
            });
            
            // 첫 번째 보이는 광고를 활성화
            visibleAdSlides[0].classList.add('active');
            currentAdSlide = 0;
            
            // 모바일에서 GIF 이미지 사전 로딩
            preloadMobileGifImages();
            
            // 5초마다 광고 슬라이드 자동 변경
            adSlideInterval = setInterval(changeAdSlide, 5000);
        }
    }
    
    // 모바일 GIF 이미지 사전 로딩 함수
    function preloadMobileGifImages() {
        // 모든 화면 크기에서 GIF 로딩 처리 (PC에서도 GIF가 보이도록)
        const gifImages = document.querySelectorAll('.ad-image[src*=".gif"]');
        
        gifImages.forEach((img) => {
            // 이미지가 로드되지 않은 경우에만 사전 로딩
            if (!img.complete) {
                const newImg = new Image();
                newImg.src = img.src;
                newImg.onload = function() {
                    // GIF 로드 완료 후 원본 이미지에 적용
                    img.classList.add('loaded');
                };
            } else {
                // 이미 로드된 경우 바로 표시
                img.classList.add('loaded');
            }
        });
        
        // PC에서 GIF가 보이지 않는 경우를 위한 추가 처리
        if (window.innerWidth > 768 && window.innerHeight > 500) {
            // PC 환경에서는 즉시 모든 GIF를 표시
            setTimeout(() => {
                gifImages.forEach((img) => {
                    img.classList.add('loaded');
                });
            }, 100);
        }
    }

    // 페이지 로드 시 광고 슬라이더 시작
    startAdSlider();

    // 화면 크기 변경 시 광고 슬라이더 재시작
    window.addEventListener('resize', debounce(() => {
        startAdSlider();
    }, 250));

    // 카테고리 필터링 기능
    const categoryLinks = document.querySelectorAll('.nav-link[data-category]');
    
    const sliderControls = document.querySelector('.slider-controls');
    const slideIndicators = document.querySelector('.slide-indicators');



    // 원본 게임 데이터 저장 (페이지 로드 시 한 번만)
    let originalGameData = null;
    
    // 원본 게임 데이터 초기화
    function initializeOriginalGameData() {
        if (!originalGameData) {
            const originalGameCards = document.querySelectorAll('.game-card[data-category]');
            originalGameData = {
                all: [],
                puzzle: [],
                casual: [],
                arcade: [],
                strategy: []
            };
            
            originalGameCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const gameTitle = card.querySelector('.game-title').textContent;
                const gameInfo = {
                    category: cardCategory,
                    title: gameTitle,
                    html: card.outerHTML
                };
                
                // 각 카테고리별 배열에 추가
                if (originalGameData.hasOwnProperty(cardCategory)) {
                    originalGameData[cardCategory].push(gameInfo);
                }
                
                // all 카테고리에는 중복 방지를 위해 한 번만 추가
                const isAlreadyInAll = originalGameData.all.some(game => game.title === gameTitle);
                if (!isAlreadyInAll) {
                    originalGameData.all.push(gameInfo);
                }
            });
        }
    }
    
    // 카테고리 필터링 함수
    function filterGamesByCategory(category) {
        
        // 원본 게임 데이터 초기화
        initializeOriginalGameData();

        if (category === 'all') {
            // 모든게임 모드: 슬라이더 형태
            sliderControls.style.display = 'flex';
            slideIndicators.style.display = 'flex';
            reorganizeGamesIntoSlides(originalGameData.all);
        } else {
            // 카테고리 모드: 스크롤 가능한 그리드 형태
            sliderControls.style.display = 'none';
            slideIndicators.style.display = 'none';
            const selectedGames = originalGameData[category] || [];
            reorganizeGamesIntoGrid(selectedGames);
        }
    }

    // 게임들을 3개씩 슬라이드로 재배치 (모든게임 모드)
    function reorganizeGamesIntoSlides(games) {
        const gamesSection = document.querySelector('.games-section');
        
        // 기존의 모든 게임 관련 요소들 제거
        const existingCategoryGrid = gamesSection.querySelector('.category-grid');
        if (existingCategoryGrid) {
            existingCategoryGrid.remove();
        }
        
        // 기존 게임 카드들도 모두 제거 (혹시 남아있을 경우)
        const existingGameCards = gamesSection.querySelectorAll('.game-card');
        existingGameCards.forEach(card => card.remove());
        
        // games-container가 없으면 다시 생성
        let gamesContainer = gamesSection.querySelector('.games-container');
        if (!gamesContainer) {
            gamesContainer = document.createElement('div');
            gamesContainer.className = 'games-container';
            gamesSection.appendChild(gamesContainer);
        }
        
        // games-slider가 없으면 다시 생성
        let gamesSlider = gamesContainer.querySelector('.games-slider');
        if (!gamesSlider) {
            gamesSlider = document.createElement('div');
            gamesSlider.className = 'games-slider';
            gamesContainer.appendChild(gamesSlider);
        }
        
        // 기존 슬라이드 제거
        const existingSlides = gamesSlider.querySelectorAll('.game-slide');
        existingSlides.forEach(slide => slide.remove());

        // 화면 크기에 따라 동적으로 슬라이드 구성
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let gamesPerSlide;
        
        // 모바일 세로 모드 감지 (가로보다 세로가 긴 경우)
        const isMobilePortrait = screenWidth <= 768 && screenHeight > screenWidth;
        
        if (isMobilePortrait) {
            // 모바일 세로 모드: 1개씩
            gamesPerSlide = 1;
        } else if (screenWidth <= 480) {
            // 작은 모바일: 1개씩
            gamesPerSlide = 1;
        } else if (screenWidth <= 768 && screenHeight <= screenWidth) {
            // 모바일 가로 모드: 2개씩
            gamesPerSlide = 2;
        } else if (screenWidth <= 600) {
            // 작은 화면: 2개씩
            gamesPerSlide = 2;
        } else if (screenWidth <= 1100) {
            // 중간 태블릿: 3개씩 (600~1100px 구간)
            gamesPerSlide = 3;
        } else if (screenWidth <= 1024) {
            // 태블릿: 3개씩
            gamesPerSlide = 3;
        } else {
            // 데스크톱: 3개씩
            gamesPerSlide = 3;
        }
        
        for (let i = 0; i < games.length; i += gamesPerSlide) {
            const slide = document.createElement('div');
            slide.className = 'game-slide';
            if (i === 0) slide.classList.add('active');

            const gameCardsContainer = document.createElement('div');
            gameCardsContainer.className = 'game-cards';

            // gamesPerSlide 개수만큼 게임 추가
            for (let j = i; j < Math.min(i + gamesPerSlide, games.length); j++) {
                const gameElement = document.createElement('div');
                gameElement.innerHTML = games[j].html;
                gameCardsContainer.appendChild(gameElement.firstElementChild);
            }

            slide.appendChild(gameCardsContainer);
            gamesSlider.appendChild(slide);
        }

        // 슬라이더 컨트롤 버튼들이 없으면 다시 생성
        let sliderControls = gamesContainer.querySelector('.slider-controls');
        if (!sliderControls) {
            sliderControls = document.createElement('div');
            sliderControls.className = 'slider-controls';
            gamesContainer.appendChild(sliderControls);
            
            // 이전 버튼 생성
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slider-btn prev-btn';
            prevBtn.id = 'prevBtn';
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            sliderControls.appendChild(prevBtn);
            
            // 다음 버튼 생성
            const nextBtn = document.createElement('button');
            nextBtn.className = 'slider-btn next-btn';
            nextBtn.id = 'nextBtn';
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            sliderControls.appendChild(nextBtn);
        }

        // 슬라이더 인디케이터가 없으면 다시 생성
        let slideIndicators = gamesContainer.querySelector('.slide-indicators');
        if (!slideIndicators) {
            slideIndicators = document.createElement('div');
            slideIndicators.className = 'slide-indicators';
            gamesContainer.appendChild(slideIndicators);
        }

        // 슬라이더 인디케이터 업데이트
        updateSlideIndicators();
        
        // 슬라이더 요소들 업데이트
        updateSliderElements();
        
        // 이벤트 리스너 재등록
        const newNextBtn = gamesContainer.querySelector('#nextBtn');
        const newPrevBtn = gamesContainer.querySelector('#prevBtn');
        
        if (newNextBtn) {
            // 기존 이벤트 리스너 제거 후 새로 등록
            newNextBtn.removeEventListener('click', nextSlide);
            newNextBtn.addEventListener('click', nextSlide);
        }
        if (newPrevBtn) {
            // 기존 이벤트 리스너 제거 후 새로 등록
            newPrevBtn.removeEventListener('click', prevSlide);
            newPrevBtn.addEventListener('click', prevSlide);
        }
    }

    // 게임들을 스크롤 가능한 그리드로 재배치 (카테고리 모드)
    function reorganizeGamesIntoGrid(games) {
        const gamesSection = document.querySelector('.games-section');
        
        // 기존의 모든 게임 관련 요소들 제거
        const existingGamesContainer = gamesSection.querySelector('.games-container');
        if (existingGamesContainer) {
            existingGamesContainer.remove();
        }
        
        const existingCategoryGrid = gamesSection.querySelector('.category-grid');
        if (existingCategoryGrid) {
            existingCategoryGrid.remove();
        }
        
        // 기존 게임 카드들도 모두 제거 (혹시 남아있을 경우)
        const existingGameCards = gamesSection.querySelectorAll('.game-card');
        existingGameCards.forEach(card => card.remove());
        
        // 카테고리 그리드 직접 생성
        const gameCardsContainer = document.createElement('div');
        gameCardsContainer.className = 'game-cards category-grid';

        // 모든 게임을 그리드에 추가
        games.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.innerHTML = game.html;
            gameCardsContainer.appendChild(gameElement.firstElementChild);
        });

        // games-section에 직접 추가
        gamesSection.appendChild(gameCardsContainer);
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

    // 페이지 로드 시 모든게임 모드로 초기화 (일관성 유지)
    filterGamesByCategory('all');

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

    // 화면 크기 변경 시 슬라이더 높이 조정 및 구조 재구성
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            updateSliderElements();
            
            // 현재 'all' 카테고리가 활성화되어 있다면 슬라이드 구조 재구성
            if (document.querySelector('.games-slider') && !document.querySelector('.category-grid')) {
                filterGamesByCategory('all');
            }
        }, 250); // 디바운싱으로 성능 최적화
    });

    // 화면 방향 변경 시 슬라이더 높이 조정 및 구조 재구성
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            updateSliderElements();
            
            // 현재 'all' 카테고리가 활성화되어 있다면 슬라이드 구조 재구성
            if (document.querySelector('.games-slider') && !document.querySelector('.category-grid')) {
                filterGamesByCategory('all');
            }
        }, 300); // 방향 변경 후 안정화 시간 증가
    });

}); 