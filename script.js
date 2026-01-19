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
    this.backBtn = document.querySelector('.depth-nav.back');
    this.viewport = document.querySelector('.carousel-viewport');
    this.carousel = document.querySelector('.depth-carousel');
    
    this.currentIndex = 0;
    this.totalSlides = this.slides.length;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds
    this.isTransitioning = false;
    this.isExpanded = false;
    
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
    this.prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isExpanded) this.prev();
    });
    this.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isExpanded) this.next();
    });
    this.backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.collapse();
    });
    
    // Only active slide is clickable - expand when clicked
    this.slides.forEach((slide, index) => {
      slide.addEventListener('click', (e) => {
        // Only handle clicks on active slide
        if (slide.classList.contains('active') && !this.isExpanded) {
          e.stopPropagation();
          this.expand();
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
    
    // Mouse drag support - only when not expanded
    let isDragging = false;
    let startX = 0;
    
    this.viewport.addEventListener('mousedown', (e) => {
      if (this.isExpanded) return;
      isDragging = true;
      startX = e.clientX;
      this.viewport.style.cursor = 'grabbing';
    });
    
    this.viewport.addEventListener('mousemove', (e) => {
      if (!isDragging || this.isExpanded) return;
    });
    
    this.viewport.addEventListener('mouseup', (e) => {
      if (!isDragging || this.isExpanded) return;
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
      if (this.isExpanded) {
        if (e.key === 'Escape') {
          this.collapse();
        }
        return;
      }
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });
    
    // Start auto-play
    this.startAutoPlay();
  }
  
  expand() {
    if (this.isExpanded || this.isTransitioning) return;
    this.isExpanded = true;
    this.stopAutoPlay();
    this.carousel.classList.add('expanded');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Explicitly hide prev/next buttons and show back button
    if (this.prevBtn) {
      this.prevBtn.style.display = 'none';
      this.prevBtn.style.visibility = 'hidden';
      this.prevBtn.style.opacity = '0';
      this.prevBtn.style.pointerEvents = 'none';
    }
    if (this.nextBtn) {
      this.nextBtn.style.display = 'none';
      this.nextBtn.style.visibility = 'hidden';
      this.nextBtn.style.opacity = '0';
      this.nextBtn.style.pointerEvents = 'none';
    }
    if (this.backBtn) {
      this.backBtn.style.display = 'flex';
      this.backBtn.style.visibility = 'visible';
      this.backBtn.style.opacity = '1';
      this.backBtn.style.pointerEvents = 'auto';
    }
    
    // Scroll to carousel if needed
    const carouselRect = this.carousel.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    if (carouselRect.top < 0 || carouselRect.bottom > viewportHeight) {
      this.carousel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  collapse() {
    if (!this.isExpanded) return;
    this.isExpanded = false;
    this.carousel.classList.remove('expanded');
    document.body.style.overflow = ''; // Restore scrolling
    
    // Explicitly show prev/next buttons and hide back button
    if (this.prevBtn) {
      this.prevBtn.style.display = '';
      this.prevBtn.style.visibility = '';
      this.prevBtn.style.opacity = '';
      this.prevBtn.style.pointerEvents = '';
    }
    if (this.nextBtn) {
      this.nextBtn.style.display = '';
      this.nextBtn.style.visibility = '';
      this.nextBtn.style.opacity = '';
      this.nextBtn.style.pointerEvents = '';
    }
    if (this.backBtn) {
      this.backBtn.style.display = 'none';
      this.backBtn.style.visibility = '';
      this.backBtn.style.opacity = '';
      this.backBtn.style.pointerEvents = '';
    }
    
    this.startAutoPlay();
  }
  
  handleSwipe() {
    const horizontalDiff = this.touchStartX - this.touchEndX;
    const verticalDiff = Math.abs(this.touchStartY - this.touchEndY);
    const swipeThreshold = 50;
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(horizontalDiff) > swipeThreshold && Math.abs(horizontalDiff) > verticalDiff) {
      // Hide hint on first swipe
      if (this.swipeHint && !this.hintShown) {
        this.hideSwipeHint();
        this.hintShown = true;
      }
      
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
    if (this.isTransitioning || this.isExpanded) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    this.updateSlides();
    this.resetAutoPlay();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800); // Match CSS transition duration
  }
  
  prev() {
    if (this.isTransitioning || this.isExpanded) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
    this.updateSlides();
    this.resetAutoPlay();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800);
  }
  
  goToSlide(index) {
    if (this.isTransitioning || index === this.currentIndex || this.isExpanded) return;
    
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

// ================= IMAGE LIGHTBOX MODAL =================
class ImageLightbox {
  constructor() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImage = document.getElementById('lightbox-image');
    this.lightboxCounter = document.getElementById('lightbox-counter');
    this.backBtn = document.getElementById('lightbox-back');
    this.prevBtn = document.getElementById('lightbox-prev');
    this.nextBtn = document.getElementById('lightbox-next');
    this.lightboxContent = document.querySelector('.lightbox-content');
    
    this.images = [];
    this.currentIndex = 0;
    this.gallerySource = null; // Track if gallery is from 'services' or 'team'
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.lastTouchDistance = 0;
    this.minScale = 1;
    this.maxScale = 5;
    this.swipeHint = null;
    this.hintTimeout = null;
    this.hintShown = false;
    this.mobileBreakpoint = 768; // Device width breakpoint for mobile/desktop
    
    // Image galleries for services
    // TODO: Replace placeholder images with your actual service images
    // Place images in the same directory as index.html and update the paths below
    this.imageGalleries = {
      android: [
        // Add your Android application images here (e.g., 'android1.jpg', 'android2.jpg', 'android3.jpg')
        // Currently using placeholder images - replace with actual Android app screenshots
        'app1.jpg', 'app2.jpg', 'app3.jpg', 'app4.jpg', 'app5.jpg','app6.jpg', 'app7.jpg', 'app8.jpg', 'app9.jpg'
      ],
      signly: [
        // Add your Signly prototype images here (e.g., 'signly1.jpg', 'signly2.jpg', 'signly3.jpg')
        // Currently using placeholder images - replace with actual Signly prototype screenshots
        'car5.jpg','car1.jpg'
      ]
    };
    
    this.init();
  }
  
  init() {
    // Service card clicks - show prev/next buttons
    document.querySelectorAll('.clickable-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const gallery = card.getAttribute('data-gallery');
        if (gallery && this.imageGalleries[gallery]) {
          this.openGallery(this.imageGalleries[gallery], 0, 'services');
        }
      });
    });
    
    // Carousel image clicks - hide prev/next buttons (Our Team section)
    document.querySelectorAll('.clickable-image').forEach(img => {
      img.addEventListener('click', (e) => {
        // Prevent carousel navigation
        e.stopPropagation();
        const imageSrc = img.getAttribute('data-image') || img.getAttribute('src');
        
        // Get all carousel images
        const allCarouselImages = Array.from(document.querySelectorAll('.clickable-image'))
          .map(i => i.getAttribute('data-image') || i.getAttribute('src'))
          .filter((src, index, arr) => arr.indexOf(src) === index); // Remove duplicates
        
        const startIndex = allCarouselImages.indexOf(imageSrc);
        if (startIndex !== -1) {
          this.openGallery(allCarouselImages, startIndex, 'team');
        }
      });
    });
    
    // Navigation buttons
    this.backBtn.addEventListener('click', () => this.close());
    this.prevBtn.addEventListener('click', () => {
      if (this.gallerySource === 'services') {
        this.prev();
      }
    });
    this.nextBtn.addEventListener('click', () => {
      if (this.gallerySource === 'services') {
        this.next();
      }
    });
    
    // Initially hide prev/next buttons (will be shown for Services)
    if (this.prevBtn) {
      this.prevBtn.style.display = 'none';
      this.prevBtn.style.visibility = 'hidden';
      this.prevBtn.style.pointerEvents = 'none';
    }
    if (this.nextBtn) {
      this.nextBtn.style.display = 'none';
      this.nextBtn.style.visibility = 'hidden';
      this.nextBtn.style.pointerEvents = 'none';
    }
    
    // Create swipe hint element
    this.createSwipeHint();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      
      switch(e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          if (this.gallerySource === 'services') {
            this.prev();
          }
          break;
        case 'ArrowRight':
          if (this.gallerySource === 'services') {
            this.next();
          }
          break;
      }
    });
    
    // Close on backdrop click
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.close();
      }
    });
    
    // Prevent closing when clicking on image container
    this.lightboxContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Zoom with mouse wheel
    this.lightboxContent.addEventListener('wheel', (e) => {
      if (!this.lightbox.classList.contains('active')) return;
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoom(this.scale + delta, e.offsetX, e.offsetY);
    }, { passive: false });
    
    // Drag to pan when zoomed
    this.lightboxContent.addEventListener('mousedown', (e) => {
      if (this.scale > 1) {
        this.isDragging = true;
        this.dragStartX = e.clientX - this.translateX;
        this.dragStartY = e.clientY - this.translateY;
        this.lightboxContent.style.cursor = 'grabbing';
      }
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.lightbox.classList.contains('active')) return;
      
      this.translateX = e.clientX - this.dragStartX;
      this.translateY = e.clientY - this.dragStartY;
      this.updateImageTransform();
    });
    
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
      if (this.lightbox.classList.contains('active')) {
        this.lightboxContent.style.cursor = this.scale > 1 ? 'grab' : 'default';
      }
    });
    
    // Touch gestures for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    this.lightboxContent.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.lastTouchDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
      }
    }, { passive: false });
    
    this.lightboxContent.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        if (this.lastTouchDistance > 0) {
          const scaleChange = distance / this.lastTouchDistance;
          const newScale = this.scale * scaleChange;
          const rect = this.lightboxContent.getBoundingClientRect();
          const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
          const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;
          
          this.zoom(newScale, centerX, centerY);
        }
        this.lastTouchDistance = distance;
      } else if (e.touches.length === 1 && this.scale > 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        
        this.translateX += deltaX;
        this.translateY += deltaY;
        this.updateImageTransform();
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });
    
    this.lightboxContent.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        this.lastTouchDistance = 0;
        
        // Handle swipe gestures
        if (e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const deltaX = touchEndX - touchStartX;
          const deltaY = touchEndY - touchStartY;
          const deltaTime = Date.now() - touchStartTime;
          const swipeThreshold = 50;
          const swipeTime = 300;
          
          // Only handle swipe if not zoomed and quick enough
          if (this.scale === 1 && deltaTime < swipeTime && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > swipeThreshold) {
              if (deltaX > 0) {
                this.prev();
              } else {
                this.next();
              }
            }
          }
        }
      }
    }, { passive: false });
    
    // Double click to zoom
    this.lightboxContent.addEventListener('dblclick', (e) => {
      if (this.scale > 1) {
        this.resetZoom();
      } else {
        const rect = this.lightboxContent.getBoundingClientRect();
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        this.zoom(2, centerX, centerY);
      }
    });
  }
  
  openGallery(images, startIndex = 0, source = 'team') {
    this.images = images;
    this.gallerySource = source; // Track gallery source: 'services' or 'team'
    this.currentIndex = Math.max(0, Math.min(startIndex, images.length - 1));
    this.resetZoom();
    this.loadImage(this.currentIndex);
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.hintShown = false; // Reset hint state
    
    const isMobile = window.innerWidth <= this.mobileBreakpoint;
    
    // Show/hide prev/next buttons based on gallery source AND device width
    if (source === 'services' && images.length > 1) {
      if (isMobile) {
        // Mobile: hide prev/next buttons, show swipe hint
        this.hideNavigationButtons();
        this.showSwipeHint();
      } else {
        // Desktop: show prev/next buttons, hide swipe hint
        this.showNavigationButtons();
        this.hideSwipeHint();
      }
    } else {
      // Hide prev/next buttons for Our Team (carousel) or single image
      this.hideNavigationButtons();
      this.hideSwipeHint();
    }
    
    // Back button is always visible
    if (this.backBtn) {
      this.backBtn.style.display = 'flex';
      this.backBtn.style.visibility = 'visible';
      this.backBtn.style.opacity = '1';
      this.backBtn.style.pointerEvents = 'auto';
    }
  }
  
  loadImage(index) {
    if (index < 0 || index >= this.images.length) return;
    
    this.currentIndex = index;
    const img = new Image();
    img.src = this.images[index];
    
    img.onload = () => {
      this.lightboxImage.src = this.images[index];
      this.updateCounter();
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${this.images[index]}`);
    };
  }
  
  updateCounter() {
    this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
  }
  
  next() {
    if (this.images.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.resetZoom();
    this.loadImage(this.currentIndex);
  }
  
  prev() {
    if (this.images.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.resetZoom();
    this.loadImage(this.currentIndex);
  }
  
  close() {
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
    this.resetZoom();
  }
  
  zoom(newScale, centerX, centerY) {
    const oldScale = this.scale;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    
    if (this.scale === 1) {
      this.resetZoom();
      return;
    }
    
    // Calculate new translate to zoom towards the center point
    const scaleChange = this.scale / oldScale;
    const rect = this.lightboxContent.getBoundingClientRect();
    const imageRect = this.lightboxImage.getBoundingClientRect();
    
    const imageCenterX = imageRect.left + imageRect.width / 2 - rect.left;
    const imageCenterY = imageRect.top + imageRect.height / 2 - rect.top;
    
    this.translateX = centerX - (centerX - this.translateX) * scaleChange;
    this.translateY = centerY - (centerY - this.translateY) * scaleChange;
    
    // Limit translation to keep image visible
    const maxTranslateX = (imageRect.width * this.scale - rect.width) / 2;
    const maxTranslateY = (imageRect.height * this.scale - rect.height) / 2;
    
    this.translateX = Math.max(-maxTranslateX, Math.min(maxTranslateX, this.translateX));
    this.translateY = Math.max(-maxTranslateY, Math.min(maxTranslateY, this.translateY));
    
    this.updateImageTransform();
    this.lightboxContent.style.cursor = this.scale > 1 ? 'grab' : 'default';
  }
  
  resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.updateImageTransform();
    this.lightboxContent.style.cursor = 'default';
  }
  
  updateImageTransform() {
    this.lightboxImage.style.transform = `scale(${this.scale}) translate(${this.translateX / this.scale}px, ${this.translateY / this.scale}px)`;
  }
  
  createSwipeHint() {
    this.swipeHint = document.createElement('div');
    this.swipeHint.className = 'lightbox-swipe-hint';
    this.swipeHint.textContent = 'Swipe to view more images';
    this.lightbox.appendChild(this.swipeHint);
  }
  
  showSwipeHint() {
    if (!this.swipeHint || this.images.length <= 1) return;
    
    this.swipeHint.style.display = 'block';
    this.swipeHint.style.opacity = '1';
    
    // Auto-hide after 4 seconds
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
    }
    this.hintTimeout = setTimeout(() => {
      this.hideSwipeHint();
      this.hintShown = true;
    }, 4000);
  }
  
  hideSwipeHint() {
    if (!this.swipeHint) return;
    
    this.swipeHint.style.opacity = '0';
    setTimeout(() => {
      this.swipeHint.style.display = 'none';
    }, 300);
    
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
      this.hintTimeout = null;
    }
  }
  
  showNavigationButtons() {
    if (this.prevBtn) {
      this.prevBtn.style.display = 'flex';
      this.prevBtn.style.visibility = 'visible';
      this.prevBtn.style.opacity = '1';
      this.prevBtn.style.pointerEvents = 'auto';
    }
    if (this.nextBtn) {
      this.nextBtn.style.display = 'flex';
      this.nextBtn.style.visibility = 'visible';
      this.nextBtn.style.opacity = '1';
      this.nextBtn.style.pointerEvents = 'auto';
    }
  }
  
  hideNavigationButtons() {
    if (this.prevBtn) {
      this.prevBtn.style.display = 'none';
      this.prevBtn.style.visibility = 'hidden';
      this.prevBtn.style.opacity = '0';
      this.prevBtn.style.pointerEvents = 'none';
    }
    if (this.nextBtn) {
      this.nextBtn.style.display = 'none';
      this.nextBtn.style.visibility = 'hidden';
      this.nextBtn.style.opacity = '0';
      this.nextBtn.style.pointerEvents = 'none';
    }
  }
}

// Initialize lightbox when DOM is ready
if (document.getElementById('lightbox')) {
  new ImageLightbox();
}
