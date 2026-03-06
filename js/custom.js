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

// Generic share feature
function shareWebsite() {
    if (navigator.share) {
        navigator.share({
            title: "Let’s plan a coffee ☕",
            text: " \n \nCGS - Coffee, Grill & Shots \nExplore Premium Coffee, Sandwiches and Refreshing Shots \n \n",
            url: "https://anuragbirthare1988.github.io/cgscafe-dev"
        });
    } else {
        // fallback if share not supported
        navigator.clipboard.writeText("https://anuragbirthare1988.github.io/cgscafe-dev");
        alert("Link copied, you can share it further.");
    }
}