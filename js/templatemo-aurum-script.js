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