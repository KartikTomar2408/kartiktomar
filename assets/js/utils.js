// Utility Functions
const utils = {
    // Debounce function to limit function calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function to limit function calls
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Check if element is in viewport
    isInViewport: (element, offset = 0) => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
            rect.top >= -offset &&
            rect.left >= -offset &&
            rect.bottom <= windowHeight + offset &&
            rect.right <= windowWidth + offset
        );
    },

    // Get element offset from top of page
    getOffset: (element) => {
        let offsetTop = 0;
        while (element) {
            offsetTop += element.offsetTop;
            element = element.offsetParent;
        }
        return offsetTop;
    },

    // Smooth scroll to element
    scrollTo: (element, offset = 0) => {
        const targetPosition = utils.getOffset(element) - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },

    // Generate random number between min and max
    randomBetween: (min, max) => {
        return Math.random() * (max - min) + min;
    },

    // Format number with commas
    formatNumber: (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Get CSS custom property value
    getCSSVar: (property) => {
        return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    },

    // Set CSS custom property value
    setCSSVar: (property, value) => {
        document.documentElement.style.setProperty(property, value);
    },

    // Create element with attributes
    createElement: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    },

    // Add event listener with cleanup
    addEvent: (element, event, handler, options = {}) => {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    },

    // Wait for animation to complete
    waitForAnimation: (element, animationName) => {
        return new Promise((resolve) => {
            const onAnimationEnd = (event) => {
                if (event.animationName === animationName) {
                    element.removeEventListener('animationend', onAnimationEnd);
                    resolve();
                }
            };
            element.addEventListener('animationend', onAnimationEnd);
        });
    },

    // Wait for transition to complete
    waitForTransition: (element, property) => {
        return new Promise((resolve) => {
            const onTransitionEnd = (event) => {
                if (event.propertyName === property) {
                    element.removeEventListener('transitionend', onTransitionEnd);
                    resolve();
                }
            };
            element.addEventListener('transitionend', onTransitionEnd);
        });
    },

    // Device detection
    device: {
        isMobile: () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isTablet: () => /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(navigator.userAgent),
        isDesktop: () => !utils.device.isMobile() && !utils.device.isTablet(),
        hasTouch: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    },

    // Performance monitoring
    performance: {
        mark: (name) => {
            if (window.performance && window.performance.mark) {
                window.performance.mark(name);
            }
        },
        
        measure: (name, startMark, endMark) => {
            if (window.performance && window.performance.measure) {
                window.performance.measure(name, startMark, endMark);
                
                const measures = window.performance.getEntriesByName(name);
                if (measures.length > 0) {
                    return measures[measures.length - 1].duration;
                }
            }
            return 0;
        }
    },

    // Storage helpers
    storage: {
        set: (key, value, isSession = false) => {
            try {
                const storage = isSession ? sessionStorage : localStorage;
                storage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Storage not available:', error);
                return false;
            }
        },

        get: (key, defaultValue = null, isSession = false) => {
            try {
                const storage = isSession ? sessionStorage : localStorage;
                const item = storage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Storage not available:', error);
                return defaultValue;
            }
        },

        remove: (key, isSession = false) => {
            try {
                const storage = isSession ? sessionStorage : localStorage;
                storage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Storage not available:', error);
                return false;
            }
        }
    },

    // URL helpers
    url: {
        getParam: (name) => {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },

        setParam: (name, value) => {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.pushState({}, '', url);
        },

        removeParam: (name) => {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.pushState({}, '', url);
        }
    }
};

// Export for ES6 modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}
