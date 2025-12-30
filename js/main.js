/**
 * Appraisal 365 - Main JavaScript
 * Handles all interactive functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initHeader();
    initMobileMenu();
    initServiceCards();
    initMultiStepForm();
    initSignaturePad();
    initFileUpload();
    initFormValidation();
    initSmoothScroll();
});

/**
 * Header Scroll Effect
 */
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    if (!mobileToggle || !navMenu) return;

    mobileToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
}

/**
 * Service Selection Cards
 */
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-select-card');

    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const checkbox = this.querySelector('input[type="checkbox"]');
            if (checkbox) {
                this.classList.toggle('selected');
            }
        });

        // Also handle checkbox change directly
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                card.classList.toggle('selected', this.checked);
            });
        }
    });
}

/**
 * Multi-Step Form Navigation
 */
function initMultiStepForm() {
    const form = document.getElementById('serviceRequestForm');
    if (!form) return;

    const steps = form.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator .step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    let currentStep = 1;
    const totalSteps = steps.length;

    function showStep(stepNum) {
        // Hide all steps
        steps.forEach(step => step.classList.remove('active'));

        // Show current step
        const currentStepEl = form.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Update step indicators
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < stepNum) {
                indicator.classList.add('completed');
            } else if (index + 1 === stepNum) {
                indicator.classList.add('active');
            }
        });

        // Update navigation buttons
        if (prevBtn) {
            prevBtn.style.display = stepNum === 1 ? 'none' : 'inline-flex';
        }
        if (nextBtn) {
            nextBtn.style.display = stepNum === totalSteps ? 'none' : 'inline-flex';
        }
        if (submitBtn) {
            submitBtn.style.display = stepNum === totalSteps ? 'inline-flex' : 'none';
        }

        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateStep(stepNum) {
        const stepEl = form.querySelector(`.form-step[data-step="${stepNum}"]`);
        if (!stepEl) return true;

        const requiredFields = stepEl.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('error');
                field.addEventListener('input', function() {
                    this.classList.remove('error');
                }, { once: true });
            }
        });

        // Check for at least one service selected in step 1
        if (stepNum === 1) {
            const selectedServices = stepEl.querySelectorAll('input[name="services"]:checked');
            if (selectedServices.length === 0) {
                isValid = false;
                alert('Please select at least one service.');
            }
        }

        return isValid;
    }

    // Next button
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    }

    // Previous button
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentStep--;
            showStep(currentStep);
        });
    }

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate final step
        if (!validateStep(currentStep)) return;

        // Check terms agreement
        const agreeTerms = document.getElementById('agreeTerms');
        if (agreeTerms && !agreeTerms.checked) {
            alert('Please agree to the Terms & Conditions.');
            return;
        }

        // Check signature
        const signatureCanvas = document.getElementById('signatureCanvas');
        if (signatureCanvas) {
            const ctx = signatureCanvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
            const hasSignature = imageData.data.some((value, index) => {
                return index % 4 === 3 && value > 0; // Check alpha channel
            });

            if (!hasSignature) {
                alert('Please provide your signature.');
                return;
            }
        }

        // Show success message
        alert('Thank you! Your service request has been submitted successfully. We will contact you shortly.');

        // In production, you would send the form data to the server here
        // form.submit();
    });

    // Initialize first step
    showStep(1);
}

/**
 * Signature Pad
 */
function initSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth - 4; // Account for border
        canvas.height = 150;
        ctx.strokeStyle = '#002366';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function startDrawing(e) {
        isDrawing = true;
        const pos = getPosition(e);
        lastX = pos.x;
        lastY = pos.y;
    }

    function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();

        const pos = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastX = pos.x;
        lastY = pos.y;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
}

// Clear signature function (global for onclick)
function clearSignature() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * File Upload Handler
 */
function initFileUpload() {
    const fileInput = document.getElementById('documentUpload');
    const fileList = document.getElementById('fileList');

    if (!fileInput || !fileList) return;

    fileInput.addEventListener('change', function() {
        fileList.innerHTML = '';

        if (this.files.length > 0) {
            Array.from(this.files).forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; background: #F8F9FA; border-radius: 8px; margin-bottom: 8px;';

                const fileName = document.createElement('span');
                fileName.style.cssText = 'font-size: 0.9rem; color: #333;';
                fileName.innerHTML = `<i class="fas fa-file" style="color: #002366; margin-right: 10px;"></i>${file.name}`;

                const fileSize = document.createElement('span');
                fileSize.style.cssText = 'font-size: 0.85rem; color: #6C757D;';
                fileSize.textContent = formatFileSize(file.size);

                fileItem.appendChild(fileName);
                fileItem.appendChild(fileSize);
                fileList.appendChild(fileItem);
            });
        }
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Form Validation Styling
 */
function initFormValidation() {
    // Add error styling to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        .form-control.error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
        }
    `;
    document.head.appendChild(style);

    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you shortly.');
            this.reset();
        });
    }

    // Referral form handling
    const referralForm = document.getElementById('referralForm');
    if (referralForm) {
        referralForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your referral! We will contact your referral shortly.');
            this.reset();
        });
    }
}

/**
 * Smooth Scrolling for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.getElementById('header')?.offsetHeight || 80;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Utility: Set today's date as default for date inputs
 */
document.querySelectorAll('input[type="date"]').forEach(input => {
    if (!input.value) {
        const today = new Date().toISOString().split('T')[0];
        if (input.id === 'instructionDate' || input.id === 'signatureDate') {
            input.value = today;
        }
    }
});
