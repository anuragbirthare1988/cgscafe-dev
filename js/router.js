document.addEventListener("DOMContentLoaded", async () => {

  const routes = [
      {
      path: "browse-menu",
      file: "browse-menu.html",
      title: "Menu | CGS Cafe",
      description: "Discover the signature coffee, frappes, and sandwiches at CGS Coffee Grill & Shots Cafe in Indore."
      },
      {
         path: "careers",
         file: "careers.html",
         title: "Careers | CGS Cafe",
         description: "Join the CGS Cafe team in Indore and grow with a passionate team serving premium coffee and gourmet delights."
      },
      {
         path: "cgs-experience",
         file: "cgs-experience.html",
         title: "The CGS Experience | CGS Cafe",
         description: "Experience the unique blend of premium instant coffee, frappe frost, grilled sandwiches, and creative shots at CGS Cafe."
      },
      {
         path: "faq",
         file: "faq.html",
         title: "FAQ | CGS Cafe",
         description: "Find answers to common questions about CGS Cafe’s menu, ordering, hygiene practices, and cafe experience."
      },
      {
         path: "home",
         file: "home.html",
         title: "Home | CGS Cafe",
         description: "Welcome to CGS Cafe – Indore’s destination for signature coffee, frappe frost, grilled sandwiches, and delightful shots."
      },
      {
         path: "hygiene",
         file: "hygiene.html",
         title: "Hygiene | CGS Cafe",
         description: "Learn about CGS Cafe’s commitment to cleanliness, safety, and hygiene in every cup and dish we serve."
      },
      {
         path: "orders",
         file: "orders.html",
         title: "Orders | CGS Cafe",
         description: "Place your order online at CGS Cafe and enjoy premium coffee, frappes, and gourmet sandwiches delivered to you."
      },
      {
         path: "our-story",
         file: "our-story.html",
         title: "Our Story | CGS Cafe",
         description: "Discover the journey of CGS Cafe, where premium instant coffee meets innovation and a passion for gourmet flavors."
      },
      {
         path: "privacy-policy",
         file: "privacy-policy.html",
         title: "Privacy policy | CGS Cafe",
         description: "Read CGS Cafe’s privacy policy outlining how we protect your personal information and ensure secure interactions."
      },
      {
         path: "signature-picks",
         file: "signature-picks.html",
         title: "Signature Picks | CGS Cafe",
         description: "Explore the signature coffee, frappes, and gourmet picks that define CGS Cafe’s unique menu in Indore."
      },
      {
         path: "terms-and-conditions",
         file: "terms-and-conditions.html",
         title: "Terms and Conditions | CGS Cafe",
         description: "Review the terms and conditions for using CGS Cafe’s website and services for a safe and seamless experience."
      },
      {
         path: "testimonials",
         file: "testimonials.html",
         title: "Testimonials | CGS Cafe",
         description: "Read what customers are saying about their CGS Cafe experience, from premium coffee to delicious sandwiches."
      },
      {
         path: "visit-us",
         file: "visit-us.html",
         title: "Visit Us | CGS Cafe",
         description: "Plan your visit to CGS Cafe in Indore and enjoy premium coffee, frappes, grilled sandwiches, and creative shots in person."
      }
   ];

  function initPageFeatures(){
      initReveal(); // Initialize animations
      initTabs(); // Initialize tabs
      updateActiveMenu(); // Update the active navigation menu link
      showDevBadge(); // Shows the badge as "Dev" if URL has dev word in it
      accordionMenu();
      generateDynamicMetaTags(); // Generates and inserts the dynamic meta tags to individual pages
      generateCanonicalUrls(); // Add canonical URLs dynamically. This tells Google the official URL of each page.
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

   function generateCanonicalUrls(){
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
      }

      canonical.setAttribute("href", "https://cgscafe.in/" + routes.path);
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
         // remove hash and convert to clean URL
         history.replaceState(null, "", "/" + path);
      } 
      else {
         path = path.replace("/", "");
      }
      if (!path || path === "") {
         path = "home";
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