// MASTER INIT
window.addEventListener("load", () => {
    initAllAnimations();
});

function initAllAnimations() {
    try {
        initCursorTrail();
        initShareFeature();
        initOverlay();
        initClickEffect();
        initCanvasEffect();
        initHeroAnimation();
    } catch (e) {
        console.error("Animation error:", e);
    }
}

// Cursor trailing effect
function initCursorTrail() {
    const container = document.querySelector(".cursor-trail-container");
    if (!container) return;

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
}

// Generic share feature
function initShareFeature() {
    window.shareWebsite = function () {
        if (navigator.share) {
            navigator.share({
                title: "Let’s plan a coffee ☕",
                text: " \n \nCGS - Coffee, Grill & Shots \nExplore Premium Coffee, Sandwiches and Refreshing Shots \n \n",
                url: window.location.pathname
            });
        } else {
            navigator.clipboard.writeText(window.location.pathname);
            alert("Link copied, you can share it further.");
        }
    };
}

// Overlay (Splash) Screen
function initOverlay() {
    var overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    // Show on a fresh tab/session (typed URL, new tab) or an explicit page
    // refresh — but not on every internal link click within the same
    // browsing session, since the visitor has already seen the welcome.
    var navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    var navType = (navEntries && navEntries[0]) ? navEntries[0].type : 'navigate';
    var alreadySeen = sessionStorage.getItem('cgs-intro-seen');
    if (navType !== 'reload' && alreadySeen) {
        overlay.remove();
        if (typeof nudgeAutoScrollToggle === 'function') nudgeAutoScrollToggle();
        return;
    }
    sessionStorage.setItem('cgs-intro-seen', '1');

    function rand(min, max) { return min + Math.random() * (max - min); }

    var steamC = document.getElementById('steamParticles');
    if (steamC) {
        for (var i = 0; i < 18; i++) {
            var d = document.createElement('div');
            d.className = 'steam-particle';
            d.style.left = rand(10,90) + '%';
            d.style.animationDelay = rand(0,2) + 's';
            d.style.animationDuration = rand(2.5,4.5) + 's';
            d.style.opacity = rand(0.15,0.4);
            steamC.appendChild(d);
        }
    }

    var pourC = document.getElementById('pourDrops');
    if (pourC) {
        for (var i = 0; i < 8; i++) {
            var d = document.createElement('div');
            d.className = 'pour-drop';
            d.style.left = rand(38,62) + '%';
            d.style.animationDelay = rand(0,2.5) + 's';
            d.style.animationDuration = rand(1.5,3) + 's';
            pourC.appendChild(d);
        }
    }

    var sparkC = document.getElementById('sizzleSparks');
    if (sparkC) {
        for (var i = 0; i < 10; i++) {
            var d = document.createElement('div');
            d.className = 'sizzle-spark';
            d.style.left = rand(15,85) + '%';
            d.style.animationDelay = rand(0,2) + 's';
            d.style.animationDuration = rand(0.8,2) + 's';
            d.style.setProperty('--tx', (rand(-30,30)) + 'px');
            sparkC.appendChild(d);
        }
    }

    var splashC = document.getElementById('shotSplashes');
    if (splashC) {
        for (var i = 0; i < 6; i++) {
            var d = document.createElement('div');
            d.className = 'shot-splash';
            d.style.left = rand(25,75) + '%';
            d.style.animationDelay = (1 + rand(0,2)) + 's';
            d.style.setProperty('--sx', rand(-60,60) + 'px');
            d.style.setProperty('--sy', rand(-80,-20) + 'px');
            splashC.appendChild(d);
        }
    }

    var drizzleC = document.getElementById('drizzleLines');
    if (drizzleC) {
        for (var i = 0; i < 5; i++) {
            var d = document.createElement('div');
            d.className = 'drizzle-line';
            d.style.left = (20 + i * 15) + '%';
            d.style.animationDelay = (0.8 + i * 0.4) + 's';
            drizzleC.appendChild(d);
        }
    }

    var emojis = ['☕','🧊','🔥','🥃'];
    var themedC = document.getElementById('themedParticles');
    if (themedC) {
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
    }

    // Colorful confetti burst — varied shapes and brand-adjacent hues for a
    // more festive, welcoming feel than the muted coffee-themed particles alone
    var confettiColors = ['#C9A24B', '#E0BC6E', '#B5622F', '#C97A45', '#7C8570', '#B97D74', '#F6EFE4', '#8C7EA6', '#6BAED6', '#52C77A', '#E85D75', '#F2C744'];
    var confettiShapes = ['circle', 'square', 'triangle', 'diamond', 'star', 'pentagon'];
    var confettiC = document.getElementById('confettiBurst');
    if (confettiC) {
        for (var i = 0; i < 55; i++) {
            var d = document.createElement('div');
            var shape = confettiShapes[i % confettiShapes.length];
            d.className = 'confetti-piece confetti-piece--' + shape;
            d.style.left = rand(2, 98) + '%';
            d.style.setProperty('--confetti-color', confettiColors[i % confettiColors.length]);
            d.style.setProperty('--confetti-size', rand(4, 10) + 'px');
            d.style.setProperty('--confetti-rotate', rand(-180, 180) + 'deg');
            d.style.setProperty('--confetti-drift', rand(-40, 40) + 'px');
            d.style.animationDelay = rand(0, 0.6) + 's';
            d.style.animationDuration = rand(1.8, 2.8) + 's';
            confettiC.appendChild(d);
        }
    }

    setTimeout(() => overlay.classList.add('fade-out'), 3200);
    setTimeout(() => {
        overlay.remove();
        if (typeof nudgeAutoScrollToggle === 'function') nudgeAutoScrollToggle();
    }, 4000);
    overlay.addEventListener('click', () => overlay.remove());
}

// Glittering Click Appearance
function initClickEffect() {
    const brandColors = ['#A67C3D', '#CDA765', '#B5622F', '#6E7A5C', '#B97D74'];
    document.addEventListener('mousedown', (e) => {
        for (let i = 0; i < 4; i++) {
            const prop = document.createElement('div');
            prop.className = 'party-prop';

            const shapes = ['50%', '20%'];
            prop.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
            prop.style.left = e.pageX + 'px';
            prop.style.top = e.pageY + 'px';
            prop.style.backgroundColor = brandColors[Math.floor(Math.random() * brandColors.length)];

            const x = (Math.random() - 0.5) * 140;
            const y = (Math.random() - 0.5) * 140;
            prop.style.setProperty('--x', `${x}px`);
            prop.style.setProperty('--y', `${y}px`);

            document.body.appendChild(prop);
            setTimeout(() => prop.remove(), 900);
        }
    });
}

// Spinkling-shimmering overlay effect on the canvas over body
function initCanvasEffect() {
    const canvas = document.getElementById('effect-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let flairs = [];
    const colors = ['#FBF7F0', '#CDA765', '#A67C3D', '#B5622F', '#C97A45', '#7C8570', '#B97D74', '#8C7EA6', '#241A16'];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Flair {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 1.2 + 0.3; // Tiny flairs
            this.speedX = (Math.random() - 0.5) * 4;
            this.speedY = (Math.random() - 0.5) * 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.life = 1.0; 
            this.decay = 0.04; // Faster decay for "spark" feel
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 6; // High intensity glow
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size); // Sharp square sparkle
            ctx.restore();
        }
    }

    class Particle {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.2 + 0.5; // Smaller "Dust" size
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.isVertical = Math.random() > 0.6; 
            this.speedY = this.isVertical ? Math.random() * 1.5 + 1 : Math.random() * 0.4 + 0.2;
            this.speedX = this.isVertical ? 0 : (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.6 + 0.3; // Higher base opacity (30-90%)
            this.length = Math.random() * 6 + 3; // Shorter streaks
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y > canvas.height) { this.y = -10; this.x = Math.random() * canvas.width; }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.strokeStyle = this.color;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 3; // Subtle glow on main particles
            ctx.shadowColor = this.color;

            if (this.isVertical) {
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x, this.y + this.length);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < 70; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}

function initHeroAnimation() {  // Trigger hero animation after preloader finishes/hides (after splash screen)
    var heroContent = document.querySelector(".hero__content");
    if (!heroContent) return;

    var overlay = document.getElementById('intro-overlay');

    // SCENARIO A: There is a splash screen (First load / Hard refresh)
    if (overlay) {
        // Wait for the splash to finish (3.2s) and trigger animation
        setTimeout(() => {
            heroContent.classList.add("is-animated");
        }, 3200);
    } 
    // SCENARIO B: No splash screen (Internal route navigation back to home)
    else {
        // Animate immediately (10ms) so it never stays hidden
        setTimeout(() => {
            heroContent.classList.add("is-animated");
        }, 10);
    }
}