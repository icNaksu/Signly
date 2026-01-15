// ================= HAMBURGER MENU =================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// ================= ACTIVE LINK & SMOOTH SCROLL =================
const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("section");
const header = document.querySelector(".header");
const navHeight = header.offsetHeight;
const aboutSection = document.getElementById("about");

// Smooth scroll on link click
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    const topPosition = targetSection.offsetTop - navHeight;

    window.scrollTo({
      top: topPosition,
      behavior: "smooth"
    });

    // Close mobile menu if open
    if (navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
    }
  });
});

// Highlight active link based on scroll position
window.addEventListener("scroll", () => {
  let current = "";
  const scrollPos = window.scrollY + navHeight + 10; // Add small buffer

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });

  // Toggle hamburger mode when in About section or below
  const aboutTop = aboutSection.offsetTop;
  if (window.scrollY >= aboutTop - navHeight) {
    navMenu.classList.add("mobile-mode");
    hamburger.style.display = "block";
  } else {
    navMenu.classList.remove("mobile-mode");
    navMenu.classList.remove("active"); // Close menu when returning to top
    hamburger.style.display = "none";
  }
});

// ================= TEAM CAROUSEL =================
class TeamCarousel {
  constructor() {
    this.currentSlide = 0;
    this.slides = document.querySelectorAll('.carousel-slide');
    this.dots = document.querySelectorAll('.dot');
    this.prevBtn = document.querySelector('.carousel-btn.prev');
    this.nextBtn = document.querySelector('.carousel-btn.next');
    this.track = document.querySelector('.carousel-track');
    this.container = document.querySelector('.carousel-wrapper');
    this.autoPlayInterval = null;
    this.autoPlayDelay = 4000; // 4 seconds
    
    // Touch/swipe support
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.init();
  }
  
  init() {
    // Button click events
    this.prevBtn.addEventListener('click', () => this.prevSlide());
    this.nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Dot click events
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToSlide(index));
    });
    
    // Touch events for swipe
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    });
    
    this.container.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
    
    // Mouse events for desktop swipe
    let mouseDown = false;
    let startX = 0;
    
    this.container.addEventListener('mousedown', (e) => {
      mouseDown = true;
      startX = e.clientX;
      this.container.style.cursor = 'grabbing';
    });
    
    this.container.addEventListener('mouseup', (e) => {
      if (!mouseDown) return;
      mouseDown = false;
      this.container.style.cursor = 'grab';
      const endX = e.clientX;
      const diff = startX - endX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    });
    
    this.container.addEventListener('mouseleave', () => {
      mouseDown = false;
      this.container.style.cursor = 'grab';
    });
    
    this.container.addEventListener('mouseenter', () => {
      this.container.style.cursor = 'grab';
    });
    
    // Pause on hover
    this.container.addEventListener('mouseenter', () => {
      this.stopAutoPlay();
    });
    
    this.container.addEventListener('mouseleave', () => {
      this.startAutoPlay();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Start auto-play
    this.startAutoPlay();
  }
  
  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }
  
  goToSlide(index) {
    // Remove active class from all
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current
    this.currentSlide = index;
    this.slides[this.currentSlide].classList.add('active');
    this.dots[this.currentSlide].classList.add('active');
    
    // Move track
    const translateX = -this.currentSlide * 100;
    this.track.style.transform = `translateX(${translateX}%)`;
    
    // Reset auto-play
    this.resetAutoPlay();
  }
  
  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next);
  }
  
  prevSlide() {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }
  
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }
  
  stopAutoPlay() {
    clearInterval(this.autoPlayInterval);
  }
  
  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

// Initialize carousel when DOM is ready
if (document.querySelector('.carousel-container')) {
  new TeamCarousel();
}
