// Main Application Controller
class App {
    constructor() {
        this.isLoaded = false;
        this.modules = new Map();
        this.init();
    }

    async init() {
        try {
            // Performance monitoring
            utils.performance.mark('app-init-start');

            // Initialize core functionality
            this.setupErrorHandling();
            this.setupPerformanceMonitoring();
            this.setupAccessibility();
            this.setupSEO();
            
            // Initialize page-specific functionality
            this.initCurrentPage();
            
            // Setup global event listeners
            this.setupGlobalEvents();
            
            // Preload critical resources
            await this.preloadResources();
            
            // Mark app as loaded
            this.isLoaded = true;
            
            // Dispatch loaded event
            this.dispatchEvent('app:loaded');
            
            utils.performance.mark('app-init-end');
            utils.performance.measure('app-initialization', 'app-init-start', 'app-init-end');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.handleError(error);
        }
    }

    // Setup global error handling
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'JavaScript Error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled Promise Rejection');
        });
    }

    // Handle errors gracefully
    handleError(error, type = 'Error') {
        console.error(`${type}:`, error);
        
        // Log error for analytics (in production)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message || error,
                fatal: false
            });
        }

        // Show user-friendly error message
        if (window.componentManager) {
            window.componentManager.showNotification(
                'Something went wrong. Please refresh the page and try again.',
                'error'
            );
        }
    }

    // Setup performance monitoring
    setupPerformanceMonitoring() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            // This would require web-vitals library in production
            // For now, we'll use basic performance monitoring
        }

        // Monitor page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
            
            // Log to analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    value: Math.round(loadTime),
                    custom_parameter: 'load_time_ms'
                });
            }
        });

        // Monitor resource loading
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 1000) { // Resources taking more than 1s
                    console.warn(`Slow resource: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
                }
            });
        });

        if (window.PerformanceObserver) {
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    // Setup accessibility features
    setupAccessibility() {
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Focus management
        this.setupFocusManagement();
        
        // Screen reader improvements
        this.setupScreenReaderSupport();
        
        // Reduced motion support
        this.setupReducedMotionSupport();
    }

    // Keyboard navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip to content shortcut
            if (e.key === 'Tab' && e.target === document.body) {
                const mainContent = document.querySelector('main, #main, .main-content');
                if (mainContent) {
                    mainContent.focus();
                    e.preventDefault();
                }
            }

            // Close modals/menus with Escape
            if (e.key === 'Escape') {
                // Close mobile menu
                const navMenu = document.querySelector('.nav-menu.active');
                if (navMenu && window.componentManager) {
                    const nav = window.componentManager.components.get('navigation');
                    if (nav) nav.toggleMenu();
                }
            }
        });

        // Show focus indicators for keyboard users
        document.addEventListener('keydown', () => {
            document.body.classList.add('keyboard-user');
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-user');
        });
    }

    // Focus management
    setupFocusManagement() {
        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    this.trapFocus(e, activeModal);
                }
            }
        });
    }

    // Trap focus within element
    trapFocus(event, element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
        }
    }

    // Screen reader support
    setupScreenReaderSupport() {
        // Announce page changes
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        announcer.id = 'announcer';
        document.body.appendChild(announcer);

        // Announce navigation changes
        this.announce = (message) => {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        };
    }

    // Reduced motion support
    setupReducedMotionSupport() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotion = (e) => {
            if (e.matches) {
                document.documentElement.style.setProperty('--transition-fast', '0ms');
                document.documentElement.style.setProperty('--transition-base', '0ms');
                document.documentElement.style.setProperty('--transition-slow', '0ms');
            }
        };

        handleReducedMotion(prefersReducedMotion);
        prefersReducedMotion.addEventListener('change', handleReducedMotion);
    }

    // Setup SEO enhancements
    setupSEO() {
        // Update page title based on content
        this.updatePageTitle();
        
        // Setup structured data
        this.setupStructuredData();
        
        // Monitor scroll depth for analytics
        this.monitorScrollDepth();
    }

    // Update page title dynamically
    updatePageTitle() {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle && !document.title.includes(heroTitle.textContent)) {
            document.title = `${heroTitle.textContent} | Professional Portfolio`;
        }
    }

    // Setup structured data for SEO
    setupStructuredData() {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Kartik Tomar",
            "jobTitle": "Placement Coordinator",
            "worksFor": {
                "@type": "Organization",
                "name": "Hireyy"
            },
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Gwalior",
                "addressRegion": "Madhya Pradesh",
                "addressCountry": "India"
            },
            "telephone": "+91 7772974393",
            "url": window.location.origin,
            "sameAs": [
                "https://www.linkedin.com/in/kartik-tomar-0a8412232"
            ],
            "knowsAbout": [
                "Talent Acquisition",
                "Human Resources",
                "Recruitment",
                "Team Leadership",
                "IoT Development",
                "Machine Learning"
            ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
    }

    // Monitor scroll depth for analytics
    monitorScrollDepth() {
        const thresholds = [25, 50, 75, 90, 100];
        const triggered = new Set();

        const checkScrollDepth = utils.throttle(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = window.pageYOffset;
            const percentage = Math.round((scrolled / scrollHeight) * 100);

            thresholds.forEach(threshold => {
                if (percentage >= threshold && !triggered.has(threshold)) {
                    triggered.add(threshold);
                    
                    // Log to analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            value: threshold,
                            custom_parameter: 'scroll_percentage'
                        });
                    }
                }
            });
        }, 250);

        window.addEventListener('scroll', checkScrollDepth, { passive: true });
    }

    // Initialize page-specific functionality
    initCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';

        switch (page) {
            case 'index':
                this.initHomePage();
                break;
            case 'about':
                this.initAboutPage();
                break;
            case 'experience':
                this.initExperiencePage();
                break;
            case 'achievements':
                this.initAchievementsPage();
                break;
            case 'contact':
                this.initContactPage();
                break;
        }

        // Add page class to body
        document.body.classList.add(`page-${page}`);
    }

    // Home page specific initialization
    initHomePage() {
        // Enhanced typewriter effect
        this.initEnhancedTypewriter();
        
        // Parallax scrolling
        this.initParallaxScrolling();
        
        // Interactive stats
        this.initInteractiveStats();
    }

    // Enhanced typewriter effect
    initEnhancedTypewriter() {
        const typewriterElement = document.querySelector('.typewriter');
        if (!typewriterElement) return;

        const texts = [
            'Placement Coordinator & HR Innovator',
            'Talent Acquisition Expert',
            'Team Leadership Specialist',
            'IoT & ML Technology Leader'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeSpeed = 150;
        const deleteSpeed = 100;
        const pauseDuration = 2000;

        const type = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let nextDelay = isDeleting ? deleteSpeed : typeSpeed;

            if (!isDeleting && charIndex === currentText.length) {
                nextDelay = pauseDuration;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }

            setTimeout(type, nextDelay);
        };

        // Start after initial delay
        setTimeout(type, 1000);
    }

    // Parallax scrolling effects
    initParallaxScrolling() {
        if (utils.device.prefersReducedMotion()) return;

        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        const updateParallax = utils.throttle(() => {
            const scrollY = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.getAttribute('data-parallax')) || 0.5;
                const yPos = -(scrollY * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        }, 10);

        window.addEventListener('scroll', updateParallax, { passive: true });
    }

    // Interactive statistics
    initInteractiveStats() {
        const statItems = document.querySelectorAll('.stat-item');
        
        statItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.1)';
                item.style.transition = 'transform 0.3s ease';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        });
    }

    // About page initialization
    initAboutPage() {
        console.log('About page initialized');
    }

    // Experience page initialization
    initExperiencePage() {
        console.log('Experience page initialized');
    }

    // Achievements page initialization
    initAchievementsPage() {
        console.log('Achievements page initialized');
    }

    // Contact page initialization
    initContactPage() {
        console.log('Contact page initialized');
    }

    // Setup global event listeners
    setupGlobalEvents() {
        // Page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                utils.performance.mark('page-hidden');
            } else {
                utils.performance.mark('page-visible');
            }
        });

        // Window resize
        window.addEventListener('resize', utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Online/offline status
        window.addEventListener('online', () => {
            this.handleConnectionChange(true);
        });

        window.addEventListener('offline', () => {
            this.handleConnectionChange(false);
        });
    }

    // Handle window resize
    handleResize() {
        // Update CSS custom properties for viewport
        utils.setCSSVar('--viewport-width', `${window.innerWidth}px`);
        utils.setCSSVar('--viewport-height', `${window.innerHeight}px`);

        // Dispatch resize event
        this.dispatchEvent('app:resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    // Handle connection changes
    handleConnectionChange(isOnline) {
        if (window.componentManager) {
            const message = isOnline 
                ? 'Connection restored' 
                : 'You are currently offline';
            const type = isOnline ? 'success' : 'warning';
            
            window.componentManager.showNotification(message, type, 3000);
        }

        this.dispatchEvent('app:connection-change', { isOnline });
    }

    // Preload critical resources
    async preloadResources() {
        const criticalImages = [
            // Add paths to critical images
        ];

        const promises = criticalImages.map(src => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve; // Don't fail if image fails to load
                img.src = src;
            });
        });

        await Promise.all(promises);
    }

    // Custom event dispatcher
    dispatchEvent(name, detail = {}) {
        const event = new CustomEvent(name, { detail });
        document.dispatchEvent(event);
    }

    // Get module
    getModule(name) {
        return this.modules.get(name);
    }

    // Register module
    registerModule(name, module) {
        this.modules.set(name, module);
    }

    // Cleanup method
    destroy() {
        // Cleanup modules
        this.modules.forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });

        this.modules.clear();
        this.isLoaded = false;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    utils.performance.mark('page-unload');
    
    if (window.app) {
        window.app.destroy();
    }
});
