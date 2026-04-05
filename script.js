const orderData = {
    customerName: '',
    customerPhone: '',
    design: '',
    size: '',
    mounting: '',
    fabricColor: '',
    frameColor: '',
    address: '',
    notes: ''
};

// Available Images locally
const images = {
    pyramid: 'image/03b8235e-ceff-4d36-8575-16d5404c1882.jpg',
    arch: 'image/0adab1e7-4276-4004-88da-f0793b03375f.jpg',
    cantilever: 'image/10fe24c8-76b7-4c7d-aad1-69a05bf9d0c5.jpg',
    livePreviewBase: 'image/5bfe30d6-3629-419e-92f0-5663abadf921.jpg',
    livePreviewAlt: 'image/77556bcc-093f-4cce-9bbf-cdfad275b19d.jpg'
};

const app = {
    currentStep: 0,
    
    // Switch views with advanced smooth transitions
    goToStep(stepNumber) {
        document.querySelectorAll('.view').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateX(30px)';
            setTimeout(() => el.classList.remove('active'), 300);
        });

        const stepId = stepNumber === 0 ? 'landing' : 
                       stepNumber === 8 ? 'confirmation' : 
                       `step-${stepNumber}`;
        
        // Hide Wizard Header on Landing/Confirmation
        const wHeader = document.getElementById('wizard-header');
        if(stepNumber === 0 || stepNumber === 8) {
            wHeader.classList.add('hidden');
        } else {
            wHeader.classList.remove('hidden');
            // Update Progress Bar (14% per step up to 7 steps)
            const progress = Math.min((stepNumber / 7) * 100, 100);
            document.getElementById('progress-bar').style.width = `${progress}%`;
        }

        setTimeout(() => {
            const target = document.getElementById(stepId);
            target.classList.add('active');
            // Force reflow
            void target.offsetWidth;
            target.style.opacity = '1';
            target.style.transform = 'translateX(0)';
            
            this.currentStep = stepNumber;
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (stepNumber === 6) this.updateSummary();
        }, 300);
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        } else {
            this.goToStep(0); // root
        }
    },

    init() {
        this.setupParticles();
        this.setupParallaxHover();
        
        // Step 1 logic
        const phoneInput = document.getElementById('customer-phone');
        const nameInput = document.getElementById('customer-name');
        const btn1 = document.getElementById('btn-next-1');

        const validatePhone = () => {
            const val = phoneInput.value.trim();
            if(val.length >= 10 && val.startsWith('05')) {
                btn1.removeAttribute('disabled');
            } else {
                btn1.setAttribute('disabled', 'true');
            }
        };
        phoneInput.addEventListener('input', validatePhone);

        btn1.addEventListener('click', () => {
            orderData.customerName = nameInput.value.trim() || 'عميل مميز';
            orderData.customerPhone = phoneInput.value.trim();
            this.goToStep(2);
        });

        // Setup selections
        this.setupSelection('design-options', 'btn-next-2', 'design', () => this.goToStep(3));
        this.setupSelection('size-options', 'btn-next-3', 'size', () => this.goToStep(4));
        this.setupSelection('mounting-options', 'btn-next-4', 'mounting', () => this.goToStep(5));

        // Colors logic
        this.setupColorSelection('fabric-colors', 'fabric-label', 'fabricColor');
        this.setupColorSelection('frame-colors', 'frame-label', 'frameColor');

        document.getElementById('btn-next-5').addEventListener('click', () => {
            if (orderData.fabricColor && orderData.frameColor) this.goToStep(6);
        });
        
        // Setup 3D interactive cards
        document.querySelectorAll('.interactive-3d').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;
                card.style.transform = `perspective(1000px) rotateY(${dx / 10}deg) rotateX(${-dy / 10}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    },

    setupParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 1.5 - 0.5,
                alpha: Math.random() * 0.5 + 0.1
            });
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(201, 169, 110, ${p.alpha})`; // Beige
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
            });
            requestAnimationFrame(draw);
        }
        draw();

        window.addEventListener('resize', () => {
             canvas.width = window.innerWidth;
             canvas.height = window.innerHeight;
        });
    },

    setupParallaxHover() {
        const wrapper = document.getElementById('hero-img-wrapper');
        const img = document.getElementById('hero-image');
        if (!wrapper || !img) return;
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            wrapper.style.transform = `perspective(1000px) rotateY(${x * 15}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
        });

        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)`;
        });
    },

    setupSelection(containerId, btnId, dataKey, nextAction) {
        const container = document.getElementById(containerId);
        const cards = container.querySelectorAll('.card.selectable');
        const btn = document.getElementById(btnId);

        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                orderData[dataKey] = card.dataset.value;
                btn.removeAttribute('disabled');
            });
        });

        btn.addEventListener('click', nextAction);
    },

    setupColorSelection(containerId, labelId, dataKey) {
        const container = document.getElementById(containerId);
        const circles = container.querySelectorAll('.color-circle');
        const label = document.getElementById(labelId);
        const nextBtn = document.getElementById('btn-next-5');
        const livePreview = document.getElementById('live-color-preview');

        circles.forEach(circle => {
            circle.addEventListener('click', () => {
                circles.forEach(c => c.classList.remove('selected'));
                circle.classList.add('selected');
                orderData[dataKey] = circle.dataset.value;
                label.innerText = circle.getAttribute('title');
                
                // Color Change Effect
                if(livePreview) {
                    livePreview.style.filter = 'blur(5px)';
                    livePreview.style.opacity = '0.5';
                    setTimeout(() => {
                        livePreview.src = Math.random() > 0.5 ? images.livePreviewAlt : images.livePreviewBase;
                        livePreview.style.filter = 'blur(0)';
                        livePreview.style.opacity = '1';
                    }, 300);
                }

                if (orderData.fabricColor && orderData.frameColor) {
                    nextBtn.removeAttribute('disabled');
                }
            });
        });
    },

    updateSummary() {
        const mapVals = {
            pyramid: 'هرمي', arch: 'مقوس', cantilever: 'كابولي',
            big: 'كبير (SUV)', small: 'صغير (سيدان)',
            wall: 'معلقة على الجدار', ground: 'أعمدة على الأرض',
            beige: 'بيج رملي', gray: 'رمادي فاتح', white: 'أبيض نقي', black: 'أسود فاخر'
        };

        document.getElementById('sum-design').innerText = mapVals[orderData.design] || orderData.design;
        document.getElementById('sum-size').innerText = mapVals[orderData.size] || orderData.size;
        document.getElementById('sum-mounting').innerText = mapVals[orderData.mounting] || orderData.mounting;
        document.getElementById('sum-fabric').innerText = mapVals[orderData.fabricColor] || orderData.fabricColor;
        document.getElementById('sum-frame').innerText = mapVals[orderData.frameColor] || orderData.frameColor;
    },

    getLocation() {
        const addr = document.getElementById('order-address');
        const mapBtn = document.querySelector('.map-btn');
        addr.value = "جاري تحديد الموقع...";
        mapBtn.innerText = "⏳ جاري البحث...";
        setTimeout(() => {
            addr.value = "المملكة العربية السعودية، الرياض، شارع العليا";
            orderData.address = addr.value;
            mapBtn.innerText = "✓ تم التحديد بنجاح";
            mapBtn.classList.add('btn-primary');
            mapBtn.classList.remove('btn-secondary');
            document.querySelector('.map-marker-fake').style.transform = 'translate(-50%, -100%) scale(1.3)';
        }, 1500);
    },

    cancelOrder() {
        if(confirm('هل أنت متأكد من إلغاء الطلب؟ نعلم أنك ستفوت مظلة فاخرة لحماية سيارتك!')) {
            window.location.reload();
        }
    },

    submitOrder() {
        orderData.address = document.getElementById('order-address').value;
        orderData.notes = document.getElementById('order-notes').value;
        
        const btn = document.querySelector('#step-7 .btn-primary');
        btn.innerText = "⏳ جاري التسجيل بأمان...";
        btn.disabled = true;

        setTimeout(() => {
            const randomId = Math.floor(Math.random() * 9000) + 1000;
            document.getElementById('final-order-number').innerText = `#ATL-2026-${randomId}`;
            this.goToStep(8);
            
            // Trigger Confetti or some local effect
            const successIcon = document.querySelector('.success-icon');
            if (successIcon) {
                successIcon.style.transform = "scale(1.5)";
                setTimeout(() => successIcon.style.transform = "scale(1)", 500);
            }
        }, 1800);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
