// Auto-scroll — gently scrolls the page automatically after load, stops
// the moment the visitor scrolls manually, and can be re-enabled via the
// floating toggle button.
let autoScrollActive = false;
let autoScrollRAF = null;

function startAutoScroll() {
      autoScrollActive = true;
      const btn = document.getElementById('autoscroll-toggle');
      if (btn) btn.classList.add('active');
      function step() {
            if (!autoScrollActive) return;
            window.scrollBy(0, 1.1);
            if ((window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 20)) {
                  stopAutoScroll();
                  return;
            }
            autoScrollRAF = requestAnimationFrame(step);
      }
      autoScrollRAF = requestAnimationFrame(step);
}

function stopAutoScroll() {
      autoScrollActive = false;
      if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
      const btn = document.getElementById('autoscroll-toggle');
      if (btn) btn.classList.remove('active');
}

function toggleAutoScroll() {
      if (autoScrollActive) { stopAutoScroll(); } else { startAutoScroll(); }
}

// Force browser to ignore automatic scroll restoration on reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Ensure window jumps back to top on hard refreshes/loads
window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
});

// Scrolling feature for the SCROLL button click on hero banner
function scrollToFeatures() {
    const container = document.querySelector('.container .section');
    if (container) {
        const headerOffset = 90; // Adjust this to match your sticky header's exact height in pixels
        const elementPosition = container.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Draws attention to the toggle once after load, without actually
// starting to scroll — auto-scroll only begins once the visitor clicks it.
function nudgeAutoScrollToggle() {
      const btn = document.getElementById('autoscroll-toggle');
      if (!btn) return;
      btn.classList.add('nudge');
      setTimeout(() => btn.classList.remove('nudge'), 1800);
}

['wheel', 'touchmove', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, () => { if (autoScrollActive) stopAutoScroll(); }, { passive: true });
});

// Image lightbox — click any dish photo to view full-screen
function openLightbox(src, alt) {
      const lb = document.getElementById('lightbox');
      const img = document.getElementById('lightbox-img');
      if (!lb || !img) return;
      img.src = src;
      img.alt = alt || '';
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
}

function closeLightbox() {
      const lb = document.getElementById('lightbox');
      if (!lb) return;
      lb.classList.remove('open');
      document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
});

// Roast / Botanica theme switcher — global so preloader.html's inline onclick can reach it
function setCgsTheme(name) {
      document.documentElement.setAttribute('data-theme', name);
      try { localStorage.setItem('cgs-theme', name); } catch (e) {}
      syncThemeSwitchUI();
}

function syncThemeSwitchUI() {
      const current = document.documentElement.getAttribute('data-theme') || 'roast';
      document.querySelectorAll('[data-theme-option]').forEach((el) => {
            el.classList.toggle('active', el.getAttribute('data-theme-option') === current);
      });
}

document.addEventListener("DOMContentLoaded", async () => {
      async function loadComponent(id, file) {  // Load the header, footer and miscellaneous UI blocks dynamically to all the pages 
      const el = document.getElementById(id);
      // console.log(document.getElementById(id));
      if (el) {
            const res = await fetch(file);
            el.innerHTML = await res.text();
            }
      }
      await Promise.all([
            loadComponent("header", "/components/header.html"),
            loadComponent("footer", "/components/footer.html"),
            loadComponent("preloader", "/components/preloader.html")
      ]);
      syncThemeSwitchUI(); // reflect the persisted Boho/European preference on the newly-loaded header
      
      // Get the current year for copyright note
      const yearEl = document.getElementById("currentYear");
      if (yearEl) {
          yearEl.innerHTML = new Date().getFullYear();
      }

      initAllAnimations(); // from animations.js

      // Remove selection on (Esc) key
      document.addEventListener('keydown', function(e) {
            if (e.key === "Escape") {
                  // Clear any current selection
                  const selection = window.getSelection();
                  if (selection) {
                        selection.removeAllRanges();
                  }
            }
      });

      // Add a lightweight scroll listener
      window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
            document.body.classList.add('is-scrolled');
            } else {
            document.body.classList.remove('is-scrolled');
            }
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

      // Deploying Environment Badge
      function showEnvironmentBadge() {
            const hostname = window.location.hostname.toLowerCase();
            const domainSuffix = ".cgscafe.in";

            // Check if the current hostname ends with our domain and has a prefix
            if (hostname.endsWith(domainSuffix) && hostname !== domainSuffix.substring(1)) {
                  // Remove the domain suffix to isolate the prefix (e.g., "qa.cgscafe.in" becomes "qa")
                  const envPrefix = hostname.replace(domainSuffix, '');
                  const envName = envPrefix.toUpperCase();

                  const badgeElement = document.getElementById("env-badge");
                  if (badgeElement) {
                        badgeElement.textContent = envName; // Dynamically sets DEV, QA, UAT, STAGING, etc.
                        badgeElement.style.display = "block";
                  }
            } else {
                  // Production environment (cgscafe.in) - keep the badge hidden
                  const badgeElement = document.getElementById("env-badge");
                  if (badgeElement) {
                        badgeElement.style.display = "none";
                  }
            }
      }

      function initPageFeatures(){
            initReveal(); // Initialize animations
            initTabs(); // Initialize tabs
            updateActiveMenu(); // Update the active navigation menu link
            showEnvironmentBadge(); // Shows the badge as "Dev" if URL has dev word in it
            accordionMenu();
            init404Page();    // Responsible for showing the dynamic messages on clicking on 404 page 
      }

      function initReveal() {
            const reveals = document.querySelectorAll(".reveal");
            function revealOnScroll() {
                  const windowHeight = window.innerHeight;
                  reveals.forEach(el => {
                        const elementTop = el.getBoundingClientRect().top;
                        const revealPoint = 100;
                        if (elementTop < windowHeight - revealPoint) {
                        el.classList.add("active");
                        }
                  });
            }
            window.removeEventListener("scroll", revealOnScroll);
            window.addEventListener("scroll", revealOnScroll);
            // Run once on load to handle elements already in view
            revealOnScroll();
      }

      function initScrollButtons() {
            const scrollDownBtn = document.getElementById("to-bottom");
            const scrollUpBtn = document.getElementById("to-top");

            if (!scrollDownBtn && !scrollUpBtn) return;

            function updateState() {
            const scrollTop = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollUpBtn) {
                  scrollUpBtn.disabled = scrollTop <= 10;
            }

            if (scrollDownBtn) {
                  scrollDownBtn.disabled = scrollTop >= maxScroll - 10;
            }
            }

            // Click actions
            if (scrollDownBtn) {
            scrollDownBtn.addEventListener("click", () => {
                  window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth"
                  });
            });
            }

            if (scrollUpBtn) {
            scrollUpBtn.addEventListener("click", () => {
                  window.scrollTo({
                  top: 0,
                  behavior: "smooth"
                  });
            });
            }

            // Listeners
            window.addEventListener("scroll", updateState);
            window.addEventListener("load", updateState);
            window.addEventListener("resize", updateState);

            // Initial run
            updateState();
            }
      // Initialize after DOM is loaded
      document.addEventListener("DOMContentLoaded", initReveal);
      document.addEventListener("DOMContentLoaded", showEnvironmentBadge);
      // To run after every route's load, to trigger the active menu link
      document.addEventListener("DOMContentLoaded", updateActiveMenu);
      window.addEventListener("DOMContentLoaded", updateActiveMenu);
      window.addEventListener("popstate", updateActiveMenu);

      // Active menu upon link navigation
      function updateActiveMenu() {
            let currentPath = window.location.pathname;
            // Remove trailing slash (important)
            if (currentPath.length > 1 && currentPath.endsWith('/')) {
                  currentPath = currentPath.slice(0, -1);
            }
            document.querySelectorAll(".nav-link").forEach(link => {
                  link.classList.remove("active");
                  let linkPath = link.getAttribute("href");
                  // Normalize link path
                  if (linkPath.endsWith('/')) {
                        linkPath = linkPath.slice(0, -1);
                  }
                  if (linkPath === currentPath) {
                        link.classList.add("active");
                  }
            });
      }

      function accordionMenu() {
            // Collapsible Accordion feature
            document.querySelectorAll('.accordion-trigger').forEach(function(trigger) {
                  trigger.addEventListener('click', function() {
                  var item = this.closest('.accordion-item');
                  var isOpen = item.getAttribute('data-state') === 'open';

                  // Close all siblings in the same section
                  item.parentElement.querySelectorAll('.accordion-item').forEach(function(sibling) {
                  sibling.setAttribute('data-state', 'closed');
                  });

                  // Toggle clicked item
                  if (!isOpen) {
                  item.setAttribute('data-state', 'open');
                  }
                  });
            });
      }

      function initTabs() {
            // Product tabs
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            tabBtns.forEach(btn => {
                  btn.addEventListener('click', () => {
                  const tabId = btn.getAttribute('data-tab');

                  // Remove active from all buttons, then activate every button
                  // sharing this data-tab value (keeps the inline bar and the
                  // floating clip switcher in sync with each other)
                  tabBtns.forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
                  });

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
      }

      function init404Page() {
            const container = document.getElementById('not-found-page');
            if (!container) return; // ensures it runs only on 404 page

            const EMOJIS = ['☕','🥤','🧊','🔥','🥪','🥗','🍝','🧁','🍫','🧀'];
            const PHRASES = [
            'Still searching...',
            'Not in the grill either!',
            'The barista says no.',
            'Maybe try the dessert section?',
            '404 coffee drops spilled.',
            'This page is on a coffee break.',
            ];

            const card = document.getElementById('nf-card');
            const numEl = document.getElementById('nf-num');
            const phraseEl = document.getElementById('nf-phrase');

            let clickCount = 0;

            // 3D tilt
            container.addEventListener('mousemove', function (e) {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
            const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

            card.style.transform =
                  `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
            });

            // Click interaction
            container.addEventListener('click', function (e) {
            const rect = container.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;

            // Sparks
            for (let i = 0; i < 6; i++) {
                  const spark = document.createElement('span');
                  spark.className = 'nf-spark';
                  spark.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
                  spark.style.left = cx + 'px';
                  spark.style.top = cy + 'px';
                  spark.style.setProperty('--angle', (Math.random() * Math.PI * 2) + 'rad');
                  spark.style.setProperty('--dist', (50 + Math.random() * 70) + 'px');

                  container.appendChild(spark);
                  setTimeout(() => spark.remove(), 1200);
            }

            // Wiggle
            numEl.classList.add('wiggle');
            setTimeout(() => numEl.classList.remove('wiggle'), 600);

            // Change phrase
            clickCount++;
            phraseEl.textContent = `"${PHRASES[clickCount % PHRASES.length]}"`;

            phraseEl.style.animation = 'none';
            phraseEl.offsetHeight;
            phraseEl.style.animation = 'nfFadeIn 0.3s ease-out';
            });
      }

      (async function () {      // Immediately Invoked Function Expression (IIFE) for automatically activating the scrolling effect for content revealing feature
            window.scrollTo(0, 0); // Resetting scroll to land at top of page, when navigating
            initPageFeatures();
            initScrollButtons();
      })();
});