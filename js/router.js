document.addEventListener("DOMContentLoaded", async () => {

  const routes = [
      {
         path: "browse-menu",
         file: "browse-menu.html",
         title: "Cafe Menu | Coffee, Sandwiches & Frappes | CGS Cafe Indore",
         description: "Browse the full menu at CGS Cafe in Scheme No 103, Indore. Explore premium coffee, frappes, grilled sandwiches, mocktails and signature cafe delights."
      },
      {
         path: "careers",
         file: "careers.html",
         title: "Careers | Work With CGS Cafe Indore",
         description: "Looking to work in a vibrant cafe environment? Join the CGS Cafe team in Indore and grow with a passionate group serving premium coffee and gourmet food."
      },
      {
         path: "cgs-experience",
         file: "cgs-experience.html",
         title: "The CGS Experience | Premium Cafe Experience in Indore",
         description: "Discover the CGS Cafe experience in Indore where premium coffee, frappe frost, grilled sandwiches and signature shots come together to create a unique cafe vibe."
      },
      {
         path: "faq",
         file: "faq.html",
         title: "Cafe FAQ | CGS Cafe Indore",
         description: "Find answers to common questions about CGS Cafe in Indore including menu details, takeaway options, hygiene standards and cafe policies."
      },
      {
         path: "home",
         file: "home.html",
         title: "CGS Cafe Indore | Coffee, Grill & Shots | Scheme No 103",
         description: "CGS Cafe in Scheme No 103, Indore serving premium coffee, frappes, grilled sandwiches, mocktails and signature cafe beverages. Jumpstart your mood."
      },
      {
         path: "hygiene",
         file: "hygiene.html",
         title: "Hygiene Standards | CGS Cafe Indore",
         description: "Learn about CGS Cafe’s commitment to hygiene, food safety and cleanliness while preparing every coffee, sandwich and beverage."
      },
      {
         path: "orders",
         file: "orders.html",
         title: "Order & Enquiries | CGS Cafe Indore",
         description: "Contact CGS Cafe for takeaway orders or enquiries. Enjoy freshly prepared coffee, sandwiches and beverages from our cafe in Scheme No 103 Indore."
      },
      {
         path: "our-story",
         file: "our-story.html",
         title: "Our Story | The Journey Behind CGS Cafe Indore",
         description: "Discover the story behind CGS Cafe in Indore – built around a passion for premium coffee, grilled sandwiches and creating a unique cafe experience."
      },
      {
         path: "privacy-policy",
         file: "privacy-policy.html",
         title: "Privacy Policy | CGS Cafe",
         description: "Read the privacy policy of CGS Cafe outlining how we protect visitor information and maintain secure interactions on our website."
      },
      {
         path: "must-haves",
         file: "must-haves.html",
         title: "Signature Picks | Must Try Items at CGS Cafe Indore",
         description: "Explore the must-try signature picks at CGS Cafe in Indore including premium coffee, frappe frost, grilled sandwiches and refreshing beverages."
      },
      {
         path: "terms-and-conditions",
         file: "terms-and-conditions.html",
         title: "Terms & Conditions | CGS Cafe Website",
         description: "Review the terms and conditions governing the use of the CGS Cafe website and its services."
      },
      {
         path: "testimonials",
         file: "testimonials.html",
         title: "Customer Reviews | CGS Cafe Indore",
         description: "See what customers say about their experience at CGS Cafe in Indore, from premium coffee to delicious grilled sandwiches."
      },
      {
         path: "visit-us",
         file: "visit-us.html",
         title: "Visit CGS Cafe | Scheme No 103 Indore",
         description: "Visit CGS Cafe in Scheme No 103, Indore for premium coffee, frappes, grilled sandwiches and refreshing cafe beverages."
      },
      {
         path: "cafe-in-indore",
         file: "cafe-in-indore.html",
         title: "Best Cafe in Scheme No 103 Indore | CGS Cafe",
         description: "Looking for a cafe in Scheme No 103 Indore? CGS Cafe serves premium coffee, frappes, grilled sandwiches and refreshing beverages in a relaxed cafe setting."
      }
   ];

  function initPageFeatures(){
      initReveal(); // Initialize animations
      initTabs(); // Initialize tabs
      updateActiveMenu(); // Update the active navigation menu link
      showDevBadge(); // Shows the badge as "Dev" if URL has dev word in it
      accordionMenu();
      generateMetaData();
   }

   function generateMetaData() { // Generates meta data for individual pages dynamically once the page URL is hit
      generateDynamicMetaTags(); // Generates and inserts the dynamic meta tags to individual pages
      generateCanonicalUrlsAndOgTags(); // Add canonical URLs and Og URLs dynamically. This tells Google the official URL of each page.
   }

   function generateDynamicMetaTags() {
      // Get current path without leading/trailing slashes
      const currentPath = window.location.pathname.replace(/^\/|\/$/g, "") || "home";

      // Find the matching route object from routes array
      const route = routes.find(r => r.path === currentPath);
      // Only proceed if route exists
      if (route) {
         // Set document title
         document.title = route.title;

         // Set meta description
         const metaDesc = document.querySelector('meta[name="description"]');
         if (metaDesc && route.description) {
            metaDesc.setAttribute("content", route.description);
         }
      } else {
         console.warn("No route matched for path:", currentPath);
      }
   }

   function generateCanonicalUrlsAndOgTags(route) {
      // Canonical tags generation
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
         canonical = document.createElement("link");
         canonical.setAttribute("rel", "canonical");
         document.head.appendChild(canonical);
      }
      let canonicalUrl = "https://cgscafe.in/";
      if (route && route.path && route.path !== "home") {
         canonicalUrl += route.path;
      }
      canonical.setAttribute("href", canonicalUrl);

      // Og tags generation
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if(ogUrl){
         ogUrl.setAttribute("content", canonicalUrl);
      }
   }

  // Active menu upon link navigation
  function updateActiveMenu() {
    let currentHash = window.location.pathname.replace("/", "");

    if (currentHash === "") currentHash = "home";

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");

      const linkHash = link.getAttribute("href");
      // console.log(linkHash, currentHash);
      if (linkHash === currentHash) {
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

  async function loadComponent(id, file) {
    const element = document.getElementById(id);
    if (!element) return;

    const res = await fetch(file);
    const data = await res.text();
    element.innerHTML = data;
  }

  async function loadPage(page) {
    window.scrollTo(0,0); // Resetting scroll to land at top of page, when navigating
    const route = routes.find(r => r.path === page);
    if (!route) {
      document.getElementById("app").innerHTML = "<h2>Page Not Found</h2>";
      return;
    }
    const res = await fetch(`pages/${route.file}`);
    const html = await res.text();
    document.getElementById("app").innerHTML = html;
    document.title = route.title;
    initPageFeatures();
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
        // Enable top-down buttons if content is scrollable
        const scrollDownBtn = document.querySelector(".scroll-down-btn");
        if (scrollDownBtn) {
            if (document.body.scrollHeight > window.innerHeight) {
                scrollDownBtn.disabled = false;
            } else {
                scrollDownBtn.disabled = true;
            }
        }
    }
    window.removeEventListener("scroll", revealOnScroll);
    window.addEventListener("scroll", revealOnScroll);
    // Run once on load to handle elements already in view
    revealOnScroll();
   }
   // Initialize after DOM is loaded
   document.addEventListener("DOMContentLoaded", initReveal);

  function router() {
      let path = window.location.pathname;
      if (window.location.hash.startsWith("#/")) {
         path = window.location.hash.replace("#/", "");
         history.replaceState(null, "", "/" + path);
      } else {
         path = path.replace("/", "");
      }
      if (!path || path === "") {
         path = "home";
      }
      const matchedRoute = routes.find(r => r.path === path);
      if (!matchedRoute) {
         show404();
         return;
      }
      loadPage(path);
   }

  // Load header & footer once
  await loadComponent("header", "components/header.html");
  await loadComponent("footer", "components/footer.html");

  // Listen for navigation clicks
  document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (!link) return;
      e.preventDefault();
      const url = link.getAttribute("href");
      history.pushState(null, "", url);
      router();
   });

  // Handle back/forward
  window.addEventListener("hashchange", router);
  
  // To run after every route's load, to trigger the active menu link
    document.addEventListener("DOMContentLoaded", updateActiveMenu);
    window.addEventListener("DOMContentLoaded", updateActiveMenu);
    window.addEventListener("popstate", updateActiveMenu);

  // Initial load
  router();

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
   document.addEventListener("DOMContentLoaded", showDevBadge);
});

function show404() {
   document.body.innerHTML = `<div id="not-found-page" class="nf-container">
   <div class="nf-glow"></div>
   <div class="nf-card" id="nf-card">
      <p class="nf-404" id="nf-num">404</p>
      <div class="nf-divider"></div>
      <h1 class="nf-title">Looks like this page didn't make it to the menu.</h1>
      <p class="nf-desc">We checked the blender, the grill, and even behind the coffee jars — but the page you're looking for hasn't been served yet.</p>
      <p class="nf-phrase" id="nf-phrase">"Still searching..."</p>
      <a href="/browse-menu" class="nf-cta">Take Me to the Menu</a>
      <p class="nf-hint">click anywhere for a surprise</p>
   </div>
   </div>`;
   (function () {
      var EMOJIS = ['☕','🥤','🧊','🔥','🥪','🥗','🍝','🧁','🍫','🧀'];
      var PHRASES = [
         'Still searching...',
         'Not in the grill either!',
         'The barista says no.',
         'Maybe try the dessert section?',
         '404 coffee drops spilled.',
         'This page is on a coffee break.',
      ];

      var container = document.getElementById('not-found-page');
      var card = document.getElementById('nf-card');
      var numEl = document.getElementById('nf-num');
      var phraseEl = document.getElementById('nf-phrase');
      var clickCount = 0;

      // 3D tilt
      container.addEventListener('mousemove', function (e) {
         var rect = container.getBoundingClientRect();
         var x = (e.clientX - rect.left - rect.width / 2) / rect.width;
         var y = (e.clientY - rect.top - rect.height / 2) / rect.height;
         card.style.transform = 'perspective(800px) rotateY(' + (x * 5) + 'deg) rotateX(' + (-y * 5) + 'deg)';
      });

      // Click interactions
      container.addEventListener('click', function (e) {
         var rect = container.getBoundingClientRect();
         var cx = e.clientX - rect.left;
         var cy = e.clientY - rect.top;

         // Spark burst
         for (var i = 0; i < 6; i++) {
            var spark = document.createElement('span');
            spark.className = 'nf-spark';
            spark.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            spark.style.left = cx + 'px';
            spark.style.top = cy + 'px';
            spark.style.setProperty('--angle', (Math.random() * Math.PI * 2) + 'rad');
            spark.style.setProperty('--dist', (50 + Math.random() * 70) + 'px');
            container.appendChild(spark);
            setTimeout(function (s) { s.remove(); }.bind(null, spark), 1200);
         }

         // Wiggle 404
         numEl.classList.add('wiggle');
         setTimeout(function () { numEl.classList.remove('wiggle'); }, 600);

         // Cycle phrase
         clickCount++;
         phraseEl.textContent = '"' + PHRASES[clickCount % PHRASES.length] + '"';
         phraseEl.style.animation = 'none';
         phraseEl.offsetHeight; // reflow
         phraseEl.style.animation = 'nfFadeIn 0.3s ease-out';
      });
      })();
}