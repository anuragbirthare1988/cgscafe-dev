// MASTER INIT
window.addEventListener("load", () => {
    initAllAnimations();
});

function initAllAnimations() {
    try {
        initCursorTrail();
        initShareFeature();
        initOverlay();
        initPartyEffect();
        initCustomCursor();
        initClickEffect();
        initCanvasEffect();
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

    // Registering the overlay screen visibility for the first-load so that no redundant ovrlay screen is seen
    if (sessionStorage.getItem('cgs-intro-seen')) {
        overlay.remove();
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

    setTimeout(() => overlay.classList.add('fade-out'), 3800);
    setTimeout(() => overlay.remove(), 4800);
    overlay.addEventListener('click', () => overlay.remove());
}

// Party effect for the all the screens
function initPartyEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = "party-canvas";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
        constructor(isStone) {
            this.isStone = isStone;
            this.x = isStone ? canvas.width / 2 : Math.random() * canvas.width;
            this.y = isStone ? canvas.height / 2 : -10;
            this.size = isStone ? Math.random() * 10 + 5 : Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * (isStone ? 15 : 2);
            this.speedY = isStone ? (Math.random() - 0.5) * 15 : Math.random() * 3 + 2;
            this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
            this.rotation = Math.random() * 360;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.isStone) this.rotation += 5;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.isStone) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                for(let i=0; i<5; i++) {
                    ctx.lineTo(this.size * Math.cos(i * 2 * Math.PI / 5), this.size * Math.sin(i * 2 * Math.PI / 5));
                }
            } else {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 40; i++) particles.push(new Particle(true));
    for (let i = 0; i < 100; i++) particles.push(new Particle(false));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();

    setTimeout(() => {
        canvas.classList.add('fade-out');
        setTimeout(() => canvas.remove(), 1000);
    }, 3000);
}

// Custom Cursor Design
function initCustomCursor() {
    document.addEventListener('mousemove', (e) => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        const colors = ['#FFD700', '#FF1493', '#00BFFF', '#7FFF00', '#FF4500'];
        sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';

        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 800);
    });
}

// Glittering Click Appearance
function initClickEffect() {
    document.addEventListener('mousedown', (e) => {
        for (let i = 0; i < 6; i++) {
            const prop = document.createElement('div');
            prop.className = 'party-prop';

            const shapes = ['50%', '0%', '20%']; 
            prop.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
            prop.style.left = e.pageX + 'px';
            prop.style.top = e.pageY + 'px';
            prop.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;

            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 200;
            prop.style.setProperty('--x', `${x}px`);
            prop.style.setProperty('--y', `${y}px`);

            document.body.appendChild(prop);
            setTimeout(() => prop.remove(), 1000);
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
    const colors = ['#FFFFFF', '#E0F7FA', '#C6A15B', '#FF8C00', '#783C14'];

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