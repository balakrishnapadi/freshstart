// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initOrderForm();
    initContactForm();
    initTracking();
    initAnimations();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Scroll effects and animations
function initScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.product-category, .plan, .contact-item, .stat');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Order form functionality
function initOrderForm() {
    const orderForm = document.getElementById('orderForm');
    const productCheckboxes = document.querySelectorAll('input[name="products"]');
    const deliveryDateInput = document.getElementById('delivery-date');

    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    deliveryDateInput.min = tomorrow.toISOString().split('T')[0];

    // Calculate total price
    function calculateTotal() {
        let total = 0;
        const prices = {
            'fruits': 8,
            'cereals': 12,
            'breakfast-box': 15
        };

        productCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += prices[checkbox.value] || 0;
            }
        });

        return total;
    }

    // Update total display
    function updateTotal() {
        const total = calculateTotal();
        let totalDisplay = document.getElementById('total-display');
        
        if (!totalDisplay) {
            totalDisplay = document.createElement('div');
            totalDisplay.id = 'total-display';
            totalDisplay.style.cssText = `
                background: var(--gradient-primary);
                color: white;
                padding: 1rem;
                border-radius: 10px;
                text-align: center;
                font-weight: 600;
                font-size: 1.2rem;
                margin: 1rem 0;
            `;
            orderForm.appendChild(totalDisplay);
        }
        
        totalDisplay.innerHTML = `Total: $${total}`;
    }

    // Add event listeners to checkboxes
    productCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTotal);
    });

    // Form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(orderForm);
        const orderData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            deliveryDate: formData.get('delivery-date'),
            deliveryTime: formData.get('delivery-time'),
            products: Array.from(productCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value),
            notes: formData.get('notes'),
            total: calculateTotal()
        };

        // Validate form
        if (!validateOrderForm(orderData)) {
            return;
        }

        // Show loading state
        const submitBtn = orderForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        // Simulate order processing
        setTimeout(() => {
            showOrderConfirmation(orderData);
            orderForm.reset();
            updateTotal();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Validate order form
function validateOrderForm(data) {
    const errors = [];

    if (!data.name.trim()) errors.push('Name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.phone.trim()) errors.push('Phone is required');
    if (!data.address.trim()) errors.push('Address is required');
    if (!data.deliveryDate) errors.push('Delivery date is required');
    if (!data.deliveryTime) errors.push('Delivery time is required');
    if (data.products.length === 0) errors.push('Please select at least one product');

    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }

    return true;
}

// Show order confirmation
function showOrderConfirmation(orderData) {
    const confirmationHTML = `
        <div class="confirmation-modal">
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>Order Confirmed!</h3>
                </div>
                <div class="confirmation-details">
                    <p><strong>Order ID:</strong> #${generateOrderId()}</p>
                    <p><strong>Name:</strong> ${orderData.name}</p>
                    <p><strong>Delivery Date:</strong> ${formatDate(orderData.deliveryDate)}</p>
                    <p><strong>Delivery Time:</strong> ${orderData.deliveryTime}</p>
                    <p><strong>Products:</strong> ${orderData.products.join(', ')}</p>
                    <p><strong>Total:</strong> $${orderData.total}</p>
                </div>
                <div class="confirmation-message">
                    <p>Thank you for choosing FreshStart! Your fresh breakfast will be delivered to your doorstep by 6 AM.</p>
                    <p>You'll receive a confirmation email shortly with tracking details.</p>
                </div>
                <button class="confirmation-btn" onclick="closeConfirmation()">Great!</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    
    // Add styles for confirmation modal
    const style = document.createElement('style');
    style.textContent = `
        .confirmation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .confirmation-content {
            background: white;
            padding: 2rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            animation: slideInUp 0.3s ease;
        }
        
        .confirmation-header i {
            font-size: 4rem;
            color: var(--primary-green);
            margin-bottom: 1rem;
        }
        
        .confirmation-header h3 {
            color: var(--text-dark);
            margin-bottom: 1.5rem;
        }
        
        .confirmation-details {
            background: var(--cream-white);
            padding: 1.5rem;
            border-radius: 10px;
            margin: 1.5rem 0;
            text-align: left;
        }
        
        .confirmation-details p {
            margin-bottom: 0.5rem;
            color: var(--text-dark);
        }
        
        .confirmation-message {
            margin: 1.5rem 0;
        }
        
        .confirmation-message p {
            color: var(--text-light);
            margin-bottom: 0.5rem;
        }
        
        .confirmation-btn {
            background: var(--gradient-primary);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .confirmation-btn:hover {
            transform: translateY(-2px);
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Close confirmation modal
function closeConfirmation() {
    const modal = document.querySelector('.confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const contactData = {
            name: formData.get('name') || contactForm.querySelector('input[type="text"]').value,
            email: formData.get('email') || contactForm.querySelector('input[type="email"]').value,
            subject: formData.get('subject') || contactForm.querySelectorAll('input[type="text"]')[1].value,
            message: formData.get('message') || contactForm.querySelector('textarea').value
        };

        // Validate contact form
        if (!validateContactForm(contactData)) {
            return;
        }

        // Show loading state
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        // Simulate sending message
        setTimeout(() => {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// Validate contact form
function validateContactForm(data) {
    const errors = [];

    if (!data.name.trim()) errors.push('Name is required');
    if (!data.email.trim()) errors.push('Email is required');
    if (!data.subject.trim()) errors.push('Subject is required');
    if (!data.message.trim()) errors.push('Message is required');

    if (errors.length > 0) {
        showNotification(errors.join('<br>'), 'error');
        return false;
    }

    return true;
}

// Delivery tracking functionality
function initTracking() {
    // This would typically connect to a real tracking API
    window.trackOrder = function() {
        const trackingInput = document.getElementById('tracking-input');
        const trackingStatus = document.getElementById('tracking-status');
        const orderNumber = trackingInput.value.trim();

        if (!orderNumber) {
            showNotification('Please enter an order number', 'error');
            return;
        }

        // Simulate tracking lookup
        trackingStatus.style.display = 'block';
        trackingStatus.innerHTML = `
            <div class="status-item active">
                <i class="fas fa-check-circle"></i>
                <span>Order Confirmed</span>
            </div>
            <div class="status-item active">
                <i class="fas fa-truck"></i>
                <span>Out for Delivery</span>
            </div>
            <div class="status-item">
                <i class="fas fa-home"></i>
                <span>Delivered</span>
            </div>
        `;

        showNotification('Order found! Your delivery is on the way.', 'success');
    };
}

// Utility functions
function scrollToOrder() {
    const orderSection = document.getElementById('order');
    if (orderSection) {
        const offsetTop = orderSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function generateOrderId() {
    return 'FS' + Date.now().toString().slice(-6);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        }
        
        .notification-content {
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 1rem;
            border-left: 4px solid var(--primary-green);
        }
        
        .notification-error .notification-content {
            border-left-color: #f44336;
        }
        
        .notification-success .notification-content {
            border-left-color: var(--primary-green);
        }
        
        .notification-content i {
            font-size: 1.2rem;
            color: var(--primary-green);
        }
        
        .notification-error .notification-content i {
            color: #f44336;
        }
        
        .notification-content span {
            flex: 1;
            color: var(--text-dark);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            padding: 0.2rem;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize animations
function initAnimations() {
    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('.product-category, .plan, .contact-item');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Plan selection functionality
document.addEventListener('DOMContentLoaded', function() {
    const planButtons = document.querySelectorAll('.plan-btn');
    
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.closest('.plan');
            const planName = plan.querySelector('h3').textContent;
            const planPrice = plan.querySelector('.price').textContent;
            
            showNotification(`Selected ${planName} plan (${planPrice}). Redirecting to checkout...`, 'success');
            
            // In a real application, this would redirect to a payment page
            setTimeout(() => {
                scrollToOrder();
            }, 1500);
        });
    });
});

// Product category buttons
document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.closest('.product-category');
            const categoryName = category.querySelector('h3').textContent;
            
            showNotification(`Viewing ${categoryName} products. Scroll down to place your order!`, 'info');
            
            setTimeout(() => {
                scrollToOrder();
            }, 1000);
        });
    });
});

// Add to cart functionality for product options
document.addEventListener('DOMContentLoaded', function() {
    const productOptions = document.querySelectorAll('.product-option');
    
    productOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        const label = option.querySelector('label');
        
        option.addEventListener('click', function(e) {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    });
});

// Smooth reveal animations for sections
function revealOnScroll() {
    const reveals = document.querySelectorAll('.section-header, .product-category, .plan, .contact-item');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('fade-in-up');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Initialize reveal on load
document.addEventListener('DOMContentLoaded', revealOnScroll);

