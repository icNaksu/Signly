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