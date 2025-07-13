/**
 * Interactive Black Hole Animation
 * Creates a mesmerizing black hole effect with white particles
 * that respond to mouse hover and scroll interactions
 */

function createBlackHole(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    const context = canvas.getContext('2d');

    let width, height, centerx, centery;
    let stars = [];
    const PARTICLE_COUNT = 2000;
    const MAX_ORBIT_RADIUS = 400;
    const MOUSE_INFLUENCE_RADIUS = 200;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let scrollIntensity = 0;
    let animationId;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        centerx = width / 2;
        centery = height / 2;
    }

    class Star {
        constructor() {
            const rands = [Math.random(), Math.random()].sort();
            this.orbital = rands[0] * MAX_ORBIT_RADIUS;
            this.currentOrbital = this.orbital;

            this.speed = (Math.random() * 0.5 + 0.5) * Math.PI / 180;
            this.rotation = (Math.random() * 360) * Math.PI / 180;
            
            // White particles with opacity based on distance from center
            this.color = `rgba(255, 255, 255, ${1 - (this.orbital / MAX_ORBIT_RADIUS) * 0.7})`;
            
            // Initialize position correctly to prevent streaking
            this.x = centerx + Math.cos(this.rotation) * this.currentOrbital;
            this.y = centery + Math.sin(this.rotation) * this.currentOrbital;
            this.prevPosition = { x: this.x, y: this.y };
        }

        update() {
            const scrollEffectStrength = 0.5;
            const targetOrbital = this.orbital * (1 + scrollIntensity * scrollEffectStrength);

            const currentX = centerx + Math.cos(this.rotation) * this.currentOrbital;
            const currentY = centery + Math.sin(this.rotation) * this.currentOrbital;

            const dx = mouse.x - currentX;
            const dy = mouse.y - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            let hoverForce = 0;
            if (distance < MOUSE_INFLUENCE_RADIUS) {
                hoverForce = (1 - distance / MOUSE_INFLUENCE_RADIUS) * (MAX_ORBIT_RADIUS * 0.15);
            }

            let finalOrbital = targetOrbital - hoverForce;
            if (finalOrbital < 0) finalOrbital = 0;

            this.currentOrbital += (finalOrbital - this.currentOrbital) * 0.05;
            this.rotation += this.speed;
        }

        draw() {
            this.prevPosition.x = this.x;
            this.prevPosition.y = this.y;

            this.x = centerx + Math.cos(this.rotation) * this.currentOrbital;
            this.y = centery + Math.sin(this.rotation) * this.currentOrbital;

            context.strokeStyle = this.color;
            context.lineWidth = 1.5;
            context.beginPath();
            context.moveTo(this.prevPosition.x, this.prevPosition.y);
            context.lineTo(this.x, this.y);
            context.stroke();
        }
    }

    function loop() {
        scrollIntensity *= 0.97; // Slower decay for a longer ripple effect

        // Black background with slight transparency for trail effect
        context.fillStyle = 'rgba(0, 0, 0, 0.1)';
        context.fillRect(0, 0, width, height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        animationId = requestAnimationFrame(loop);
    }

    function init() {
        resize();
        
        stars = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            stars.push(new Star());
        }

        // Mouse interaction
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        // Scroll interaction
        window.addEventListener('scroll', () => {
            scrollIntensity = 1.0;
        });

        // Resize handling
        window.addEventListener('resize', resize);

        loop();
    }

    // Cleanup function
    function destroy() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        window.removeEventListener('mousemove', arguments.callee);
        window.removeEventListener('scroll', arguments.callee);
        window.removeEventListener('resize', resize);
    }

    // Initialize the black hole
    init();

    // Return destroy function for cleanup if needed
    return { destroy };
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createBlackHole('#blackhole-container');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = createBlackHole;
}
