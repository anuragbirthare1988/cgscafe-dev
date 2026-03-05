// JavaScript Document

// Scrolling Animations to the different parts of the pages
window.addEventListener("load", () => {

  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {

      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }

    });
  }, {
    threshold: 0.01
  });

  reveals.forEach(reveal => {

    observer.observe(reveal);

    // 🔥 Immediate fallback check
    const rect = reveal.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      reveal.classList.add("active");
    }

  });

});


// Header Menu Navigation scroll effect
const navbar = document.getElementById('navbar');
if(navbar){
   window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
         navbar.classList.add('scrolled');
      } else {
         navbar.classList.remove('scrolled');
      }
   });
}

// Mobile Menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

function openMobileMenu() {
   mobileMenu.classList.add('open');
   mobileMenuOverlay.classList.add('open');
   mobileMenuBtn.classList.add('active');
   document.body.classList.add('menu-open');
}

function closeMobileMenu() {
   mobileMenu.classList.remove('open');
   mobileMenuOverlay.classList.remove('open');
   mobileMenuBtn.classList.remove('active');
   document.body.classList.remove('menu-open');
}

if(mobileMenuBtn){
   mobileMenuBtn.addEventListener('click', openMobileMenu);
   mobileMenuClose.addEventListener('click', closeMobileMenu);
   mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

// CloseHeader Menu Navigation Mobile Menu when clicking a link
mobileNavLinks.forEach(link => {
   link.addEventListener('click', () => {
      closeMobileMenu();
   });
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape') {
      closeMobileMenu();
   }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
   anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
         target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
         });
      }
   });
});

// Product tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
   btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Remove active from all buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked button
      btn.classList.add('active');

      // Hide all tab contents
      tabContents.forEach(content => {
         content.classList.remove('active');
      });

      // Show selected tab content
      const activeContent = document.getElementById('tab-' + tabId);
      if (activeContent) {
         activeContent.classList.add('active');
      }
   });
});