// ================================================================
// PRELEAD PROPERTIES — TypeScript Application Core  v1.0
// World-Class Real Estate Platform
// ================================================================
// ─────────────────── Utilities ───────────────────────────────
const generateId = () => 'PLP-' + Math.random().toString(36).substring(2, 10).toUpperCase();
const formatNaira = (amount) => '₦' + amount.toLocaleString('en-NG');
const formatDate = (date) => date.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
const debounce = (fn, delay) => {
    let timer;
    return ((...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    });
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
// ─────────────────── Navbar ──────────────────────────────────
class Navbar {
    constructor() {
        var _a, _b;
        this.nav = document.querySelector('.navbar');
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.querySelector('.navbar-nav');
        this.navActions = document.querySelector('.navbar-actions');
        this.isTransparent = (_b = (_a = this.nav) === null || _a === void 0 ? void 0 : _a.classList.contains('transparent')) !== null && _b !== void 0 ? _b : false;
        this.init();
    }
    init() {
        var _a;
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        (_a = this.hamburger) === null || _a === void 0 ? void 0 : _a.addEventListener('click', this.toggleMenu.bind(this));
        this.setActiveLink();
        document.addEventListener('click', (e) => {
            var _a;
            if (!((_a = e.target) === null || _a === void 0 ? void 0 : _a.closest('.navbar')))
                this.closeMenu();
        });
        this.handleScroll();
    }
    handleScroll() {
        if (!this.nav)
            return;
        if (this.isTransparent) {
            this.nav.classList.toggle('scrolled', window.scrollY > 40);
            if (window.scrollY > 40) {
                this.nav.classList.remove('transparent');
            }
            else {
                this.nav.classList.add('transparent');
                this.nav.classList.remove('scrolled');
            }
        }
        else {
            this.nav.classList.toggle('scrolled', window.scrollY > 20);
        }
    }
    toggleMenu() {
        var _a, _b;
        (_a = this.navLinks) === null || _a === void 0 ? void 0 : _a.classList.toggle('open');
        (_b = this.navActions) === null || _b === void 0 ? void 0 : _b.classList.toggle('open');
    }
    closeMenu() {
        var _a, _b;
        (_a = this.navLinks) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
        (_b = this.navActions) === null || _b === void 0 ? void 0 : _b.classList.remove('open');
    }
    setActiveLink() {
        const current = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            var _a;
            const href = (_a = link.getAttribute('href')) !== null && _a !== void 0 ? _a : '';
            if (href === current || (current === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
}
// ─────────────────── Form Validator ──────────────────────────
class FormValidator {
    static validateEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    static validatePhone(v) {
        return /^(\+234|0)[789][01]\d{8}$/.test(v.replace(/[\s\-()]/g, ''));
    }
    static validatePassword(v) {
        return v.length >= 8;
    }
    static validateRequired(v) {
        return v.trim().length > 0;
    }
    static getPasswordStrength(password) {
        let score = 0;
        if (password.length >= 8)
            score++;
        if (password.length >= 12)
            score++;
        if (/[A-Z]/.test(password))
            score++;
        if (/[0-9]/.test(password))
            score++;
        if (/[^A-Za-z0-9]/.test(password))
            score++;
        const levels = [
            { label: 'Very Weak', color: '#ff6b8a' },
            { label: 'Weak', color: '#ffb347' },
            { label: 'Fair', color: '#e8c96a' },
            { label: 'Good', color: '#2dd4a6' },
            { label: 'Strong', color: '#38b6ff' },
        ];
        return { score, ...levels[clamp(score, 0, 4)] };
    }
    static validate(form) {
        const errors = {};
        form.querySelectorAll('[data-validate]').forEach(el => {
            var _a, _b, _c;
            const rules = ((_a = el.dataset['validate']) !== null && _a !== void 0 ? _a : '').split('|');
            const label = (_c = (_b = el.dataset['label']) !== null && _b !== void 0 ? _b : el.name) !== null && _c !== void 0 ? _c : 'Field';
            const value = el.value;
            rules.forEach(rule => {
                if (rule === 'required' && !this.validateRequired(value))
                    errors[el.name] = label + ' is required';
                if (rule === 'email' && value && !this.validateEmail(value))
                    errors[el.name] = 'Please enter a valid email address';
                if (rule === 'phone' && value && !this.validatePhone(value))
                    errors[el.name] = 'Please enter a valid Nigerian phone number';
                if ((rule === 'password' || rule === 'min8') && value && !this.validatePassword(value))
                    errors[el.name] = 'Password must be at least 8 characters';
            });
        });
        return { isValid: Object.keys(errors).length === 0, errors };
    }
    static showErrors(form, errors) {
        var _a;
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        Object.entries(errors).forEach(([name, message]) => {
            var _a, _b;
            const inp = form.querySelector('[name="' + name + '"]');
            if (!inp)
                return;
            inp.classList.add('error');
            const span = document.createElement('span');
            span.className = 'field-error';
            span.textContent = message;
            (_b = ((_a = inp.closest('.input-icon-wrap')) !== null && _a !== void 0 ? _a : inp.parentElement)) === null || _b === void 0 ? void 0 : _b.appendChild(span);
            inp.addEventListener('input', () => {
                inp.classList.remove('error');
                span.remove();
            }, { once: true });
        });
        (_a = (form.querySelector('.form-control.error'))) === null || _a === void 0 ? void 0 : _a.focus();
    }
    static clearErrors(form) {
        form.querySelectorAll('.field-error').forEach(el => el.remove());
        form.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
    }
}
// ─────────────────── Toast ───────────────────────────────────
class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }
    show(message, type = 'info', duration = 4500) {
        var _a;
        const icons = {
            success: '✓', error: '✕', info: 'ℹ', warning: '⚠'
        };
        const toast = document.createElement('div');
        toast.className = 'prelead-toast toast-' + type;
        toast.innerHTML =
            '<span class="toast-icon-wrap">' + icons[type] + '</span>' +
                '<span class="toast-msg">' + message + '</span>' +
                '<button class="toast-close" aria-label="Dismiss">✕</button>';
        this.container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('in'));
        const close = () => {
            toast.classList.add('out');
            toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        };
        (_a = toast.querySelector('.toast-close')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', close);
        setTimeout(close, duration);
    }
}
// ─────────────────── Scroll Animator ─────────────────────────
class ScrollAnimator {
    constructor() {
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal,.reveal-up,.reveal-left,.reveal-right,.reveal-scale')
            .forEach(el => this.observer.observe(el));
    }
    refresh() {
        document.querySelectorAll('.reveal:not(.visible),.reveal-up:not(.visible),.reveal-left:not(.visible),.reveal-right:not(.visible),.reveal-scale:not(.visible)').forEach(el => this.observer.observe(el));
    }
}
// ─────────────────── Counter Animation ───────────────────────
const animateCounter = (el, target, duration = 2200) => {
    var _a, _b;
    const t0 = performance.now();
    const prefix = (_a = el.dataset['prefix']) !== null && _a !== void 0 ? _a : '';
    const suffix = (_b = el.dataset['suffix']) !== null && _b !== void 0 ? _b : '';
    const useSep = el.dataset['nosep'] === undefined;
    const fmt = (n) => (useSep ? n.toLocaleString() : String(n));
    const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1);
        const v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = prefix + fmt(v) + suffix;
        if (p < 1)
            requestAnimationFrame(tick);
        else
            el.textContent = prefix + fmt(target) + suffix;
    };
    requestAnimationFrame(tick);
};
// ─────────────────── Wishlist / Saved Properties ─────────────
class WishlistManager {
    static getIds() {
        var _a;
        try {
            return JSON.parse((_a = localStorage.getItem(this.KEY)) !== null && _a !== void 0 ? _a : '[]');
        }
        catch {
            return [];
        }
    }
    static toggle(id) {
        const ids = this.getIds();
        const idx = ids.indexOf(id);
        if (idx >= 0)
            ids.splice(idx, 1);
        else
            ids.push(id);
        localStorage.setItem(this.KEY, JSON.stringify(ids));
        return idx < 0;
    }
    static has(id) {
        return this.getIds().includes(id);
    }
    static getCount() {
        return this.getIds().length;
    }
    static updateUI() {
        const count = document.getElementById('wishlistCount');
        if (count)
            count.textContent = String(this.getCount());
    }
}
WishlistManager.KEY = 'prelead_wishlist';
// ─────────────────── DOM Init ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    new Navbar();
    new ScrollAnimator();
    // Inject toast & utility styles
    const style = document.createElement('style');
    style.textContent = [
        '.toast-container{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;}',
        '.prelead-toast{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;',
        'background:rgba(13,8,32,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);',
        'border:1px solid rgba(255,255,255,.12);box-shadow:0 16px 60px rgba(0,0,0,.45);',
        'font-size:.875rem;font-weight:500;min-width:280px;max-width:380px;pointer-events:all;',
        'color:rgba(255,255,255,.88);opacity:0;transform:translateX(32px);transition:opacity .35s,transform .35s;}',
        '.prelead-toast.in{opacity:1;transform:none;}',
        '.prelead-toast.out{opacity:0;transform:translateX(32px);}',
        '.toast-success{border-left:3px solid #2dd4a6;}',
        '.toast-error  {border-left:3px solid #ff6b8a;}',
        '.toast-info   {border-left:3px solid #38b6ff;}',
        '.toast-warning{border-left:3px solid #e8c96a;}',
        '.toast-icon-wrap{font-size:.9rem;font-weight:800;flex-shrink:0;width:20px;text-align:center;}',
        '.toast-success .toast-icon-wrap{color:#2dd4a6;}',
        '.toast-error   .toast-icon-wrap{color:#ff6b8a;}',
        '.toast-info    .toast-icon-wrap{color:#38b6ff;}',
        '.toast-warning .toast-icon-wrap{color:#e8c96a;}',
        '.toast-msg{flex:1;}',
        '.toast-close{background:none;border:none;color:rgba(255,255,255,.3);font-size:.82rem;cursor:pointer;padding:2px;margin-left:4px;transition:color .15s;}',
        '.toast-close:hover{color:rgba(255,255,255,.7);}',
    ].join('');
    document.head.appendChild(style);
    // Animate counters on scroll
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length) {
        const co = new IntersectionObserver(entries => {
            entries.forEach(e => {
                var _a;
                if (e.isIntersecting) {
                    const el = e.target;
                    animateCounter(el, parseInt((_a = el.dataset['counter']) !== null && _a !== void 0 ? _a : '0', 10));
                    co.unobserve(el);
                }
            });
        }, { threshold: 0.4 });
        counters.forEach(el => co.observe(el));
    }
    // Password strength meter
    const pwInput = document.querySelector('#password, [data-pw-strength]');
    const pwSegs = document.querySelectorAll('.pw-seg');
    const pwLabel = document.querySelector('.pw-label');
    if (pwInput) {
        pwInput.addEventListener('input', () => {
            const { score, label, color } = FormValidator.getPasswordStrength(pwInput.value);
            pwSegs.forEach((seg, i) => { seg.style.background = i < score ? color : 'var(--border)'; });
            if (pwLabel) {
                pwLabel.textContent = label;
                pwLabel.style.color = color;
            }
        });
    }
    // Password visibility toggle
    document.querySelectorAll('[data-toggle-pw]').forEach(btn => {
        btn.addEventListener('click', () => {
            var _a;
            const targetId = (_a = btn.dataset['togglePw']) !== null && _a !== void 0 ? _a : '';
            const input = document.getElementById(targetId);
            if (!input)
                return;
            const isText = input.type === 'text';
            input.type = isText ? 'password' : 'text';
            btn.innerHTML = isText ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
        });
    });
    // Wishlist buttons
    WishlistManager.updateUI();
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
        var _a;
        const id = (_a = btn.dataset['wishlist']) !== null && _a !== void 0 ? _a : '';
        if (WishlistManager.has(id))
            btn.classList.add('saved');
        btn.addEventListener('click', () => {
            const added = WishlistManager.toggle(id);
            btn.classList.toggle('saved', added);
            WishlistManager.updateUI();
        });
    });
    // Expose globals for inline scripts
    const g = window;
    g._toast = new Toast();
    g.FormValidator = FormValidator;
    g.WishlistManager = WishlistManager;
    g.formatNaira = formatNaira;
    g.formatDate = formatDate;
    g.generateId = generateId;
    g.animateCounter = animateCounter;
});
