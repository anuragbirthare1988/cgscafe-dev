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

// Overlay (Splash) Screen
(function() {
  var overlay = document.getElementById('intro-overlay');
  if (!overlay) return;

  // if (sessionStorage.getItem('cgs-intro-seen')) {
  //   overlay.remove();
  //   return;
  // }
  // sessionStorage.setItem('cgs-intro-seen', '1');

  // Helper
  function rand(min, max) { return min + Math.random() * (max - min); }

  // Steam particles
  var steamC = document.getElementById('steamParticles');
  for (var i = 0; i < 18; i++) {
    var d = document.createElement('div');
    d.className = 'steam-particle';
    d.style.left = rand(10,90) + '%';
    d.style.animationDelay = rand(0,2) + 's';
    d.style.animationDuration = rand(2.5,4.5) + 's';
    d.style.opacity = rand(0.15,0.4);
    steamC.appendChild(d);
  }

  // Coffee pour drops
  var pourC = document.getElementById('pourDrops');
  for (var i = 0; i < 8; i++) {
    var d = document.createElement('div');
    d.className = 'pour-drop';
    d.style.left = rand(38,62) + '%';
    d.style.animationDelay = rand(0,2.5) + 's';
    d.style.animationDuration = rand(1.5,3) + 's';
    pourC.appendChild(d);
  }

  // Sizzle sparks
  var sparkC = document.getElementById('sizzleSparks');
  for (var i = 0; i < 10; i++) {
    var d = document.createElement('div');
    d.className = 'sizzle-spark';
    d.style.left = rand(15,85) + '%';
    d.style.animationDelay = rand(0,2) + 's';
    d.style.animationDuration = rand(0.8,2) + 's';
    d.style.setProperty('--tx', (rand(-30,30)) + 'px');
    sparkC.appendChild(d);
  }

  // Shot splashes
  var splashC = document.getElementById('shotSplashes');
  for (var i = 0; i < 6; i++) {
    var d = document.createElement('div');
    d.className = 'shot-splash';
    d.style.left = rand(25,75) + '%';
    d.style.animationDelay = (1 + rand(0,2)) + 's';
    d.style.setProperty('--sx', rand(-60,60) + 'px');
    d.style.setProperty('--sy', rand(-80,-20) + 'px');
    splashC.appendChild(d);
  }

  // Drizzle lines
  var drizzleC = document.getElementById('drizzleLines');
  for (var i = 0; i < 5; i++) {
    var d = document.createElement('div');
    d.className = 'drizzle-line';
    d.style.left = (20 + i * 15) + '%';
    d.style.animationDelay = (0.8 + i * 0.4) + 's';
    drizzleC.appendChild(d);
  }

  // Themed emoji particles
  var emojis = ['☕','🧊','🔥','🥃'];
  var themedC = document.getElementById('themedParticles');
  for (var i = 0; i < 24; i++) {
    var s = document.createElement('span');
    s.className = 'themed-particle';
    s.textContent = emojis[i % 4];
    s.style.left = rand(5,95) + '%';
    s.style.top = rand(10,80) + '%';
    s.style.animationDelay = rand(0.5,3) + 's';
    s.style.animationDuration = rand(2,4) + 's';
    s.style.fontSize = rand(0.6,1.2) + 'rem';
    themedC.appendChild(s);
  }

  // Auto dismiss
  setTimeout(function() { overlay.classList.add('fade-out'); }, 3800);
  setTimeout(function() { overlay.remove(); }, 4800);

  // Click to skip
  overlay.addEventListener('click', function() { overlay.remove(); });
})();