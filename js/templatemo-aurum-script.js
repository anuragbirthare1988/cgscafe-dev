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