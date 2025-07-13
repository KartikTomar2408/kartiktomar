// Interactive Components
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.init();
    }

    init() {
        this.initNavigation();
        this.initButtons();
        this.initForms();
        this.initModals();
        this.initTooltips();
        this.initCarousels();
        this.initTabs();
    }

    // Navigation Component
    initNavigation() {
        const navbar = document.querySelector('.navbar');
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        if (!navbar || !hamburger || !navMenu) return;

        // Mobile menu toggle
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        };

        hamburger.addEventListener('click', toggleMenu);

        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });

        // Update active nav link based on scroll position
        const updateActiveNavLink = utils.throttle(() => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.pageYOffset + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                const navLink = document.querySelector(`a[href="#${sectionId}"]`);

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    if (navLink) navLink.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', updateActiveNavLink, { passive: true });

        this.components.set('navigation', { navbar, hamburger, navMenu, toggleMenu });
    }

    // Enhanced Button Interactions
    initButtons() {
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(button => {
            // Ripple effect
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;

                button.style.position = 'relative';
                button.style.overflow = 'hidden';
                button.appendChild(ripple);

                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });

            // Loading state
            if (button.hasAttribute('data-loading')) {
                button.addEventListener('click', () => {
                    this.setButtonLoading(button, true);
                    
                    // Simulate async operation
                    setTimeout(() => {
                        this.setButtonLoading(button, false);
                    }, 2000);
                });
            }
        });

        // Add ripple animation CSS
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Set button loading state
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            button.setAttribute('data-original-text', button.textContent);
            button.textContent = 'Loading...';
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.getAttribute('data-original-text') || button.textContent;
        }
    }

    // Form Components
    initForms() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            const inputs = form.querySelectorAll('.form-input, .form-textarea');
            
            // Floating label effect
            inputs.forEach(input => {
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (!label) return;

                const handleFocus = () => {
                    label.classList.add('focused');
                };

                const handleBlur = () => {
                    if (!input.value) {
                        label.classList.remove('focused');
                    }
                };

                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);

                // Check initial state
                if (input.value) {
                    label.classList.add('focused');
                }
            });

            // Form validation
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.validateForm(form);
            });
        });
    }

    // Form validation
    validateForm(form) {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            const value = input.value.trim();
            const type = input.type;
            let isFieldValid = true;

            // Clear previous errors
            this.clearFieldError(input);

            // Required field check
            if (!value) {
                this.showFieldError(input, 'This field is required');
                isFieldValid = false;
            }

            // Email validation
            if (type === 'email' && value && !utils.validateEmail(value)) {
                this.showFieldError(input, 'Please enter a valid email address');
                isFieldValid = false;
            }

            // Phone validation
            if (type === 'tel' && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
                this.showFieldError(input, 'Please enter a valid phone number');
                isFieldValid = false;
            }

            if (!isFieldValid) {
                isValid = false;
            }
        });

        if (isValid) {
            this.submitForm(form);
        }
    }

    // Show field error
    showFieldError(input, message) {
        input.classList.add('error');
        
        let errorElement = input.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--color-error);
            font-size: var(--font-size-sm);
            margin-top: var(--space-1);
            animation: fadeInUp 0.3s ease-out;
        `;
    }

    // Clear field error
    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Submit form
    submitForm(form) {
        const submitButton = form.querySelector('button[type="submit"], .btn-submit');
        
        if (submitButton) {
            this.setButtonLoading(submitButton, true);
        }

        // Simulate form submission
        setTimeout(() => {
            if (submitButton) {
                this.setButtonLoading(submitButton, false);
            }
            
            this.showNotification('Message sent successfully!', 'success');
            form.reset();
        }, 2000);
    }

    // Modal Component
    initModals() {
        const modalTriggers = document.querySelectorAll('[data-modal]');
        const modals = document.querySelectorAll('.modal-overlay');

        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.getAttribute('data-modal');
                this.openModal(modalId);
            });
        });

        modals.forEach(modal => {
            const closeButtons = modal.querySelectorAll('.modal-close, [data-close]');
            
            closeButtons.forEach(closeBtn => {
                closeBtn.addEventListener('click', () => {
                    this.closeModal(modal);
                });
            });

            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.active');
                if (activeModal) {
                    this.closeModal(activeModal);
                }
            }
        });
    }

    // Open modal
    openModal(modalId) {
        const modal = document.querySelector(`#${modalId}`) || document.querySelector(`.modal-overlay[data-modal="${modalId}"]`);
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    // Close modal
    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Tooltip Component
    initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');

        tooltipElements.forEach(element => {
            let tooltip = null;

            const showTooltip = (e) => {
                const text = element.getAttribute('data-tooltip');
                const position = element.getAttribute('data-tooltip-position') || 'top';

                tooltip = document.createElement('div');
                tooltip.className = 'tooltip-popup';
                tooltip.textContent = text;
                tooltip.style.cssText = `
                    position: absolute;
                    background: var(--color-text);
                    color: white;
                    padding: var(--space-2) var(--space-3);
                    border-radius: var(--radius-md);
                    font-size: var(--font-size-sm);
                    white-space: nowrap;
                    z-index: var(--z-tooltip);
                    opacity: 0;
                    transform: scale(0.8);
                    transition: var(--transition-fast);
                    pointer-events: none;
                `;

                document.body.appendChild(tooltip);

                // Position tooltip
                const rect = element.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();

                let top, left;

                switch (position) {
                    case 'bottom':
                        top = rect.bottom + 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = rect.top + (rect.height - tooltipRect.height) / 2;
                        left = rect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = rect.top + (rect.height - tooltipRect.height) / 2;
                        left = rect.right + 8;
                        break;
                    default: // top
                        top = rect.top - tooltipRect.height - 8;
                        left = rect.left + (rect.width - tooltipRect.width) / 2;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;

                // Animate in
                requestAnimationFrame(() => {
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'scale(1)';
                });
            };

            const hideTooltip = () => {
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        tooltip.remove();
                        tooltip = null;
                    }, 150);
                }
            };

            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
            element.addEventListener('focus', showTooltip);
            element.addEventListener('blur', hideTooltip);
        });
    }

    // Carousel Component
    initCarousels() {
        const carousels = document.querySelectorAll('.carousel');

        carousels.forEach(carousel => {
            const track = carousel.querySelector('.carousel-track');
            const slides = carousel.querySelectorAll('.carousel-slide');
            const prevBtn = carousel.querySelector('.carousel-prev');
            const nextBtn = carousel.querySelector('.carousel-next');
            const indicators = carousel.querySelectorAll('.carousel-indicator');

            if (!track || slides.length === 0) return;

            let currentSlide = 0;
            const totalSlides = slides.length;

            const updateCarousel = () => {
                const offset = -currentSlide * 100;
                track.style.transform = `translateX(${offset}%)`;

                // Update indicators
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentSlide);
                });

                // Update button states
                if (prevBtn) prevBtn.disabled = currentSlide === 0;
                if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
            };

            const nextSlide = () => {
                if (currentSlide < totalSlides - 1) {
                    currentSlide++;
                    updateCarousel();
                }
            };

            const prevSlide = () => {
                if (currentSlide > 0) {
                    currentSlide--;
                    updateCarousel();
                }
            };

            const goToSlide = (index) => {
                currentSlide = index;
                updateCarousel();
            };

            // Event listeners
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);
            if (prevBtn) prevBtn.addEventListener('click', prevSlide);

            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => goToSlide(index));
            });

            // Keyboard navigation
            carousel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') prevSlide();
                if (e.key === 'ArrowRight') nextSlide();
            });

            // Auto-play (if enabled)
            const autoPlay = carousel.getAttribute('data-autoplay');
            if (autoPlay) {
                const interval = parseInt(autoPlay) || 5000;
                setInterval(() => {
                    if (currentSlide < totalSlides - 1) {
                        nextSlide();
                    } else {
                        currentSlide = 0;
                        updateCarousel();
                    }
                }, interval);
            }

            // Initialize
            updateCarousel();
        });
    }

    // Tab Component
    initTabs() {
        const tabContainers = document.querySelectorAll('.tabs');

        tabContainers.forEach(container => {
            const tabButtons = container.querySelectorAll('.tab-button');
            const tabPanels = container.querySelectorAll('.tab-panel');

            tabButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    // Remove active class from all tabs and panels
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabPanels.forEach(panel => panel.classList.remove('active'));

                    // Add active class to clicked tab and corresponding panel
                    button.classList.add('active');
                    if (tabPanels[index]) {
                        tabPanels[index].classList.add('active');
                    }
                });
            });
        });
    }

    // Notification system
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
            box-shadow: var(--shadow-lg);
            z-index: var(--z-toast);
            max-width: 400px;
            transform: translateX(100%);
            transition: var(--transition-base);
        `;

        // Type-specific styling
        if (type === 'success') {
            notification.style.borderLeftColor = 'var(--color-success)';
            notification.style.borderLeftWidth = '4px';
        } else if (type === 'error') {
            notification.style.borderLeftColor = 'var(--color-error)';
            notification.style.borderLeftWidth = '4px';
        }

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        return notification;
    }

    // Hide notification
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.componentManager = new ComponentManager();
    utils.performance.mark('components-initialized');
});
