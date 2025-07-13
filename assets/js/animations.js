// Animation Controller
class AnimationController {
    constructor() {
        this.observers = new Map();
        this.animations = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupCounterAnimations(); // Add this line
        this.setupTypewriterEffect();
        this.setupParticleSystem();
        this.setupTiltEffect();
        this.setupSkillAnimations(); // Add this line
    }

    // Intersection Observer for scroll-triggered animations
    setupIntersectionObserver() {
        if (!window.IntersectionObserver) return;

        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                }
            });
        }, options);

        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.fade-in-up, .reveal-text, .scroll-reveal, [data-aos]');
        animatedElements.forEach(el => observer.observe(el));

        this.observers.set('scroll', observer);
    }

    // Trigger animation for an element
    triggerAnimation(element) {
        if (element.classList.contains('fade-in-up')) {
            element.classList.add('visible');
        }
        
        if (element.classList.contains('reveal-text')) {
            element.classList.add('revealed');
        }

        if (element.classList.contains('scroll-reveal')) {
            element.classList.add('revealed');
        }

        // Handle AOS (Animate On Scroll) attributes
        const aosAnimation = element.getAttribute('data-aos');
        if (aosAnimation) {
            element.classList.add(`animate-${aosAnimation}`);
        }

        // Trigger counter animation if element has data-target
        if (element.hasAttribute('data-target')) {
            this.animateCounter(element);
        }

        // Also check for child elements with data-target (for dashboard cards)
        const counterElements = element.querySelectorAll('[data-target]');
        counterElements.forEach(counter => {
            this.animateCounter(counter);
        });
    }

    // Counter animation for statistics
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = parseInt(element.getAttribute('data-duration') || '2000');
        const startValue = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (target - startValue) * easeOut);
            
            element.textContent = this.formatNumber(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = this.formatNumber(target);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // Skill bar animations
    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress[data-width]');
        
        skillBars.forEach((bar, index) => {
            const width = bar.getAttribute('data-width');
            const delay = index * 200; // Stagger the animations
            
            setTimeout(() => {
                bar.style.setProperty('--target-width', `${width}%`);
                bar.style.width = `${width}%`;
                bar.classList.add('animated');
            }, delay);
        });
    }

    // Setup skill progress animations on scroll
    setupSkillAnimations() {
        const skillSections = document.querySelectorAll('.skills-categories, .skills-radar');
        
        if (!skillSections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillBars = entry.target.querySelectorAll('.skill-progress[data-width]');
                    
                    skillBars.forEach((bar, index) => {
                        const width = bar.getAttribute('data-width');
                        const delay = index * 150;
                        
                        setTimeout(() => {
                            bar.style.setProperty('--target-width', `${width}%`);
                            bar.style.width = `${width}%`;
                            bar.classList.add('animated');
                        }, delay);
                    });
                    
                    // Initialize radar chart if present
                    const radarChart = entry.target.querySelector('#skills-radar');
                    if (radarChart) {
                        this.initRadarChart(radarChart);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        skillSections.forEach(section => observer.observe(section));
    }

    // Initialize radar chart
    initRadarChart(container) {
        const skills = [
            { name: 'HR & Recruitment', value: 95 },
            { name: 'Leadership', value: 90 },
            { name: 'Technical Skills', value: 85 },
            { name: 'Communication', value: 92 },
            { name: 'Project Management', value: 88 },
            { name: 'Innovation', value: 87 }
        ];

        const size = 350;
        const center = size / 2;
        const radius = size / 2 - 60;
        const angles = skills.map((_, i) => (i * 2 * Math.PI) / skills.length - Math.PI / 2);

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('class', 'radar-svg');

        // Create background grid
        for (let i = 1; i <= 5; i++) {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', center);
            circle.setAttribute('cy', center);
            circle.setAttribute('r', (radius * i) / 5);
            circle.setAttribute('class', 'radar-grid');
            svg.appendChild(circle);
        }

        // Create axes
        angles.forEach((angle, i) => {
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', center);
            line.setAttribute('y1', center);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'radar-axis');
            svg.appendChild(line);

            // Add labels
            const labelX = center + Math.cos(angle) * (radius + 30);
            const labelY = center + Math.sin(angle) * (radius + 30);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('class', 'radar-label');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.textContent = skills[i].name;
            svg.appendChild(text);
        });

        // Create data area
        const pathPoints = skills.map((skill, i) => {
            const value = skill.value / 100;
            const angle = angles[i];
            const x = center + Math.cos(angle) * radius * value;
            const y = center + Math.sin(angle) * radius * value;
            return `${x},${y}`;
        });

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M${pathPoints.join('L')}Z`);
        path.setAttribute('class', 'radar-area');
        svg.appendChild(path);

        // Add data points
        skills.forEach((skill, i) => {
            const value = skill.value / 100;
            const angle = angles[i];
            const x = center + Math.cos(angle) * radius * value;
            const y = center + Math.sin(angle) * radius * value;
            
            const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            point.setAttribute('cx', x);
            point.setAttribute('cy', y);
            point.setAttribute('r', 4);
            point.setAttribute('class', 'radar-point');
            svg.appendChild(point);
        });

        container.appendChild(svg);

        // Animate the radar chart
        setTimeout(() => {
            path.style.strokeDasharray = path.getTotalLength();
            path.style.strokeDashoffset = path.getTotalLength();
            path.style.animation = 'drawRadar 2s ease-out forwards';
        }, 500);
    }

    // Format number for display
    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return num.toString();
    }

    // Counter animations for hero stats
    setupCounterAnimations() {
        const dashboardSections = document.querySelectorAll('.dashboard-grid, .overview-stats, .hero-stats');
        
        if (!dashboardSections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counters = entry.target.querySelectorAll('[data-target]');
                    
                    counters.forEach((counter, index) => {
                        const delay = index * 200;
                        setTimeout(() => {
                            this.animateCounter(counter);
                        }, delay);
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -20px 0px'
        });

        dashboardSections.forEach(section => observer.observe(section));
    }

    // Typewriter effect for hero title
    setupTypewriterEffect() {
        const typewriterElements = document.querySelectorAll('.typewriter');
        
        typewriterElements.forEach(element => {
            const text = element.getAttribute('data-text') || element.textContent;
            const speed = parseInt(element.getAttribute('data-speed') || '100');
            const delay = parseInt(element.getAttribute('data-delay') || '1000');
            
            // Clear content initially
            element.textContent = '';
            element.style.opacity = '1';
            
            setTimeout(() => {
                this.typeWriter(element, text, speed);
            }, delay);
        });
    }

    // Type writer animation function
    typeWriter(element, text, speed, index = 0) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => {
                this.typeWriter(element, text, speed, index + 1);
            }, speed);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 1000);
        }
    }

    // Scroll-based animations
    setupScrollAnimations() {
        let ticking = false;

        const updateAnimations = () => {
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;

            // Parallax effect for hero section
            const hero = document.querySelector('.hero');
            if (hero) {
                const heroHeight = hero.offsetHeight;
                const parallaxSpeed = 0.5;
                const yPos = -(scrollY * parallaxSpeed);
                hero.style.transform = `translateY(${yPos}px)`;
            }

            // Navbar background change
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Particle system for background
    setupParticleSystem() {
        const particleContainer = document.querySelector('.floating-particles');
        if (!particleContainer) return;

        // Skip on mobile for performance
        if (utils.device.isMobile()) return;

        const particleCount = 20;
        const particles = [];

        for (let i = 0; i < particleCount; i++) {
            const particle = this.createParticle();
            particleContainer.appendChild(particle);
            particles.push(particle);
        }

        // Animate particles
        this.animateParticles(particles);
    }

    // Create individual particle
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = utils.randomBetween(2, 6);
        const x = utils.randomBetween(0, 100);
        const y = utils.randomBetween(0, 100);
        const duration = utils.randomBetween(20, 40);
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: var(--color-primary);
            border-radius: 50%;
            left: ${x}%;
            top: ${y}%;
            opacity: 0.1;
            animation: particleFloat ${duration}s ease-in-out infinite;
            animation-delay: ${utils.randomBetween(0, 20)}s;
        `;

        return particle;
    }

    // Animate particles
    animateParticles(particles) {
        particles.forEach((particle, index) => {
            const animateParticle = () => {
                const rect = particle.getBoundingClientRect();
                const containerRect = particle.parentElement.getBoundingClientRect();
                
                // Reset position if particle goes out of bounds
                if (rect.top > containerRect.bottom || rect.left > containerRect.right) {
                    particle.style.left = utils.randomBetween(-10, 10) + '%';
                    particle.style.top = utils.randomBetween(-10, 10) + '%';
                }
                
                requestAnimationFrame(animateParticle);
            };
            
            setTimeout(() => {
                animateParticle();
            }, index * 100);
        });
    }

    // Tilt effect for cards
    setupTiltEffect() {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        
        tiltElements.forEach(element => {
            let isHovering = false;
            
            const handleMouseMove = (e) => {
                if (!isHovering) return;
                
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) / (rect.width / 2);
                const deltaY = (e.clientY - centerY) / (rect.height / 2);
                
                const rotateX = deltaY * -10; // Adjust tilt intensity
                const rotateY = deltaX * 10;
                
                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            };
            
            const handleMouseEnter = () => {
                isHovering = true;
                element.style.transition = 'transform 0.1s ease-out';
            };
            
            const handleMouseLeave = () => {
                isHovering = false;
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                element.style.transition = 'transform 0.3s ease-out';
            };
            
            // Only add tilt effect on non-touch devices
            if (!utils.device.hasTouch()) {
                element.addEventListener('mousemove', handleMouseMove);
                element.addEventListener('mouseenter', handleMouseEnter);
                element.addEventListener('mouseleave', handleMouseLeave);
            }
        });
    }

    // Page transition animations
    pageTransition(direction = 'in') {
        const page = document.body;
        
        if (direction === 'out') {
            page.style.opacity = '0';
            page.style.transform = 'translateY(20px)';
            page.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        } else {
            page.style.opacity = '1';
            page.style.transform = 'translateY(0)';
            page.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        }
    }

    // Stagger animation for multiple elements
    staggerAnimation(elements, animationClass, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * delay);
        });
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animations.clear();
    }
}

// Smooth scroll implementation
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupScrollIndicator();
    }

    setupSmoothScrolling() {
        // Handle anchor links
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a[href^="#"]');
            if (!target) return;

            const href = target.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    setupScrollIndicator() {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (!scrollIndicator) return;

        const handleScroll = utils.throttle(() => {
            const scrollY = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            if (scrollY > windowHeight * 0.3) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.visibility = 'hidden';
            } else {
                scrollIndicator.style.opacity = '1';
                scrollIndicator.style.visibility = 'visible';
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Skip animations if user prefers reduced motion
    if (utils.device.prefersReducedMotion()) {
        document.body.classList.add('reduced-motion');
        return;
    }

    // Initialize animation systems
    window.animationController = new AnimationController();
    window.smoothScroll = new SmoothScroll();
    
    // Performance marking
    utils.performance.mark('animations-initialized');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is hidden
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when page becomes visible
        document.body.style.animationPlayState = 'running';
    }
});
