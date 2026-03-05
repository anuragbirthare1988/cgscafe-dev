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
const shareWrapper = document.querySelector(".share-wrapper");
const shareMain = document.getElementById("shareMain");

shareMain.onclick = () => {
    shareWrapper.classList.toggle("open");
};

/* Web Share API */

function nativeShare(){
    if(navigator.share){
        navigator.share({
            title:"CGS – Coffee, Grill & Shots",
            text:"Check out this premium cafe ☕",
            url:window.location.href
        });
    }
}

/* WhatsApp */

document.getElementById("whatsappShare").onclick = () => {

    const text = encodeURIComponent(
    "Let's visit CGS – Coffee, Grill & Shots ☕\n"+window.location.href
    );

    window.open("https://wa.me/?text="+text,"_blank");
}

/* Instagram */

document.getElementById("instaShare").onclick = nativeShare;

/* Copy */

document.getElementById("copyLink").onclick = () => {

    navigator.clipboard.writeText(window.location.href);

    alert("Link copied!");
};