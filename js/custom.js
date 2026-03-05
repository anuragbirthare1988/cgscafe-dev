// Collapsoible Accordion feature
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

// Top -Bottom quick scrolling feature
const scrollToTopBtn = document.getElementById("to-top");
const scrollToBottomBtn = document.getElementById("to-bottom");

function updateButtons() {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // At top
    if (scrollTop <= 10) {
    scrollToTopBtn.classList.add("disabled");
    } else {
    scrollToTopBtn.classList.remove("disabled");
    }

    // At bottom
    if (scrollTop + clientHeight >= scrollHeight - 10) {
    scrollToBottomBtn.classList.add("disabled");
    } else {
    scrollToBottomBtn.classList.remove("disabled");
    }
}

scrollToTopBtn.addEventListener("click", () => {
    if (!scrollToTopBtn.classList.contains("disabled")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

scrollToBottomBtn.addEventListener("click", () => {
    if (!scrollToBottomBtn.classList.contains("disabled")) {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
});

window.addEventListener("scroll", updateButtons);
window.addEventListener("load", updateButtons);

// Cursor trailing effect
const container = document.querySelector(".cursor-trail-container");	
document.addEventListener("mousemove",(e)=>{
  const dot = document.createElement("div");
  dot.classList.add("cursor-dot");
  dot.style.left = e.clientX + "px";
  dot.style.top = e.clientY + "px";
  container.appendChild(dot);
  setTimeout(()=>{
    dot.style.opacity="0";
    dot.style.transform="translate(-50%,-50%) scale(1.6)";
  },20);
  setTimeout(()=>{
    dot.remove();
  },600);
});

// Sharing feature
const toggle = document.getElementById("shareToggle");
const shareContainer = document.querySelector(".shareContainer");

toggle.addEventListener("click", () => {
  if(shareContainer) shareContainer.classList.toggle("open");
});

/* WhatsApp Share */

const pageURL = encodeURIComponent(window.location.href);
const text = encodeURIComponent("Check out CGS – Coffee, Grill & Shots ☕");

document.getElementById("whatsappShare").href =
`https://wa.me/?text=${text}%20${pageURL}`;


/* Copy Link */

document.getElementById("copyLink").addEventListener("click", () => {

  navigator.clipboard.writeText(window.location.href);

  const btn = document.getElementById("copyLink");

  btn.style.background = "hsl(40 60% 56%)";
  btn.style.color = "#1a120c";

  setTimeout(()=>{
    btn.style.background = "#2a1d15";
  },1000);

});