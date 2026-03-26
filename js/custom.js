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
      function showDevBadge() {
            const params = new URLSearchParams(window.location.search);
            isDevEnv = window.location.href.toLowerCase().includes('dev');
            //   console.log(params, isDevEnv);
            const devParam = params.get("dev");
            if (isDevEnv) {
                  document.getElementById("dev-badge").style.display = "block";
            }
      }

      function initPageFeatures(){
            initReveal(); // Initialize animations
            initTabs(); // Initialize tabs
            updateActiveMenu(); // Update the active navigation menu link
            showDevBadge(); // Shows the badge as "Dev" if URL has dev word in it
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
      document.addEventListener("DOMContentLoaded", showDevBadge);
      // To run after every route's load, to trigger the active menu link
      document.addEventListener("DOMContentLoaded", updateActiveMenu);
      window.addEventListener("DOMContentLoaded", updateActiveMenu);
      window.addEventListener("popstate", updateActiveMenu);

      function initTabs() {
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
      }

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

      (function () {    // Immediately Invoked Function Expression (IIFE) for automatically activating the scrolling effect for content revealing feature
            // console.log('Auto-scrolled for content revealing feature');
            window.scrollTo(0,0); // Resetting scroll to land at top of page, when navigating
            initPageFeatures();
            initScrollButtons();
      })();
});