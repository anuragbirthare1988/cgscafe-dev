document.addEventListener("DOMContentLoaded", async () => {

  const routes = [
    { path: "browse-menu", file: "browse-menu.html", title: "Menu | CGS Cafe" },
    { path: "careers", file: "careers.html", title: "Careers | CGS Cafe" },
    { path: "cgs-experience", file: "cgs-experience.html", title: "The CGS Experience | CGS Cafe" },
    { path: "faq", file: "faq.html", title: "FAQ | CGS Cafe" },
    { path: "home", file: "home.html", title: "Home | CGS Cafe" },
    { path: "hygiene", file: "hygiene.html", title: "Hygiene | CGS Cafe" },
    { path: "orders", file: "orders.html", title: "Orders | CGS Cafe" },
    { path: "our-story", file: "our-story.html", title: "Our Story | CGS Cafe" },
    { path: "privacy-policy", file: "privacy-policy.html", title: "Privacy policy | CGS Cafe" },
    { path: "signature-picks", file: "signature-picks.html", title: "Signature Picks | CGS Cafe" },
    { path: "terms-and-conditions", file: "terms-and-conditions.html", title: "Terms and Conditions | CGS Cafe" },
    { path: "testimonials", file: "testimonials.html", title: "Testimonials | CGS Cafe" },
    { path: "visit-us", file: "visit-us.html", title: "Visit Us | CGS Cafe" }
  ];

  // Active menu upon link navigation
  function updateActiveMenu() {
    let currentHash = window.location.hash.replace("#", "");

    if (currentHash === "") currentHash = "home";

    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");

      const linkHash = link.getAttribute("href");
      console.log(linkHash, currentHash);
      if (linkHash === currentHash) {
        link.classList.add("active");
      }
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
    initReveal(); // Reinitialize animations
    updateActiveMenu(); // Update the active navigation menu link
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

    revealOnScroll();
  }

  function router() {
    const hash = window.location.hash.replace("#/", "") || "home";
    loadPage(hash);
  }

  // Load header & footer once
  await loadComponent("header", "components/header.html");
  await loadComponent("footer", "components/footer.html");

  // Listen for navigation clicks
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      const page = e.target.getAttribute("href").replace("/", "");
      window.location.hash = "/" + page;
    }
  });

  // Handle back/forward
  window.addEventListener("hashchange", router);
  
  // To run after every route's load, to trigger the active menu link
    document.addEventListener("DOMContentLoaded", updateActiveMenu);
    window.addEventListener("DOMContentLoaded", updateActiveMenu);
    window.addEventListener("popstate", updateActiveMenu);

  // Initial load
  router();
});