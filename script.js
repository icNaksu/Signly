// ================= HAMBURGER MENU =================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const menuOverlay = document.getElementById("menu-overlay");
const menuNav = document.getElementById("menu-nav");
const header = document.querySelector(".header");
const navHeight = header.offsetHeight;

// Toggle hamburger menu overlay
hamburger.addEventListener("click", () => {
  const isActive = menuOverlay.classList.contains("active");
  
  if (isActive) {
    closeMenu();
  } else {
    openMenu();
  }
});

// Close menu when clicking on backdrop (outside menu-nav)
menuOverlay.addEventListener("click", (e) => {
  // Only close if clicking directly on the backdrop, not on menu-nav or its children
  if (e.target === menuOverlay) {
    closeMenu();
  }
});

// Prevent clicks inside menu-nav from closing the menu
menuNav.addEventListener("click", (e) => {
  e.stopPropagation();
});

// Close menu on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOverlay.classList.contains("active")) {
    closeMenu();
  }
});

function openMenu() {
  menuOverlay.classList.add("active");
  hamburger.classList.add("active");
  document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeMenu() {
  menuOverlay.classList.remove("active");
  hamburger.classList.remove("active");
  document.body.style.overflow = ""; // Restore scrolling
}

// ================= ACTIVE LINK & SMOOTH SCROLL =================
const navLinks = document.querySelectorAll(".nav-links a");
const menuLinks = document.querySelectorAll(".menu-nav a");
const allLinks = [...navLinks, ...menuLinks];
const sections = document.querySelectorAll("section");
const homeSection = document.getElementById("home");
const aboutSection = document.getElementById("about");

// Smooth scroll on link click
allLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      const topPosition = targetSection.offsetTop - navHeight;

      window.scrollTo({
        top: topPosition,
        behavior: "smooth"
      });

      // Close menu after clicking link
      closeMenu();
    }
  });
});

// Update active links in both navbar and menu
function updateActiveLinks() {
  let current = "";
  const scrollPos = window.scrollY + navHeight + 100; // Add buffer for better detection
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      current = section.getAttribute("id");
    }
  });

  // Check if we're at the bottom of the page - activate last section (contact)
  if (window.scrollY + windowHeight >= documentHeight - 10) {
    const lastSection = sections[sections.length - 1];
    current = lastSection.getAttribute("id");
  }

  // Update active state for all links (navbar and menu)
  allLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// Handle desktop navbar/hamburger switching based on scroll
function handleDesktopNavbar() {
  const isDesktop = window.innerWidth >= 881;
  const homeBottom = homeSection.offsetTop + homeSection.offsetHeight;
  
  if (isDesktop) {
    // On desktop: show full navbar on home section, hamburger after scrolling
    if (window.scrollY >= homeBottom - navHeight) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
      closeMenu(); // Close menu when returning to home section
    }
  }
}

// Highlight active link and handle navbar switching based on scroll position
window.addEventListener("scroll", () => {
  updateActiveLinks();
  handleDesktopNavbar();
});

// Handle on initial load
window.addEventListener("load", () => {
  updateActiveLinks();
  handleDesktopNavbar();
});

// Handle resize
window.addEventListener("resize", () => {
  handleDesktopNavbar();
  // Close menu on resize if switching to desktop with navbar visible
  const isDesktop = window.innerWidth >= 881;
  if (isDesktop && !header.classList.contains("scrolled")) {
    closeMenu();
  }
});

// ================= 3D DEPTH CAROUSEL =================
class DepthCarousel {
  constructor() {
    this.slides = Array.from(document.querySelectorAll('.carousel-slide'));
    this.prevBtn = document.querySelector('.depth-nav.prev');
    this.nextBtn = document.querySelector('.depth-nav.next');
    this.viewport = document.querySelector('.carousel-viewport');
    
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds
    this.isTransitioning = false;
    
    // Touch support
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.touchStartY = 0;
    this.touchEndY = 0;
    
    this.init();
  }
  
  init() {
    if (this.totalSlides < 3) {
      console.warn('Carousel needs at least 3 slides for optimal display');
    }
    
    // Set initial positions
    this.updateSlides();
    
    // Button events
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Click on side slides to navigate
    this.slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        if (slide.classList.contains('prev')) {
          this.prev();
        } else if (slide.classList.contains('next')) {
          this.next();
        }
      });
    });
    
    // Touch/swipe support
    this.viewport.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
      this.touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    this.viewport.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.touchEndY = e.changedTouches[0].screenY;
      this.handleSwipe();
    }, { passive: true });
    
    // Mouse drag support
    let isDragging = false;
    let startX = 0;
    
    this.viewport.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      this.viewport.style.cursor = 'grabbing';
    });
    
    this.viewport.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
    });
    
    this.viewport.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      this.viewport.style.cursor = 'default';
      
      const endX = e.clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 60) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    });
    
    this.viewport.addEventListener('mouseleave', () => {
      isDragging = false;
      this.viewport.style.cursor = 'default';
    });
    
    // Pause auto-play on hover
    this.viewport.addEventListener('mouseenter', () => {
      this.stopAutoPlay();
    });
    
    this.viewport.addEventListener('mouseleave', () => {
      this.startAutoPlay();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    // Start auto-play
    this.startAutoPlay();
  }
  
  handleSwipe() {
    const horizontalDiff = this.touchStartX - this.touchEndX;
    const verticalDiff = Math.abs(this.touchStartY - this.touchEndY);
    const swipeThreshold = 60;
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(horizontalDiff) > swipeThreshold && Math.abs(horizontalDiff) > verticalDiff) {
      if (horizontalDiff > 0) {
        this.next();
      } else {
        this.prev();
      }
    }
  }
  
  updateSlides() {
    // Calculate positions
    const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    const nextIndex = (this.currentIndex + 1) % this.totalSlides;
    
    // Remove all position classes
    this.slides.forEach(slide => {
      slide.classList.remove('active', 'prev', 'next', 'hidden');
    });
    
    // Assign new positions
    this.slides[this.currentIndex].classList.add('active');
    this.slides[prevIndex].classList.add('prev');
    this.slides[nextIndex].classList.add('next');
    
    // Hide all other slides
    this.slides.forEach((slide, index) => {
      if (index !== this.currentIndex && 
          index !== prevIndex && 
          index !== nextIndex) {
        slide.classList.add('hidden');
      }
    });
  }
  
  next() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    this.updateSlides();
    this.resetAutoPlay();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800); // Match CSS transition duration
  }
  
  prev() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlides();
    this.resetAutoPlay();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }
  
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    this.updateSlides();
    this.resetAutoPlay();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }
  
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.next();
    }, this.autoPlayDelay);
  }
  
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
  
  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

// Initialize carousel when DOM is ready
if (document.querySelector('.depth-carousel')) {
  new DepthCarousel();
}
