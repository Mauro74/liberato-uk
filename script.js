
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-menu-links a, .mobile-menu-cta a');

  function openMenu() {
    hamburger.classList.add('active');
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    if (mobileMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  mobileOverlay.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 640 && mobileMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  // â”€â”€ SCROLL REVEAL â”€â”€
  const revealEls = document.querySelectorAll('.reveal, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  revealEls.forEach(el => revealObserver.observe(el));

  // â”€â”€ DARK MODE TOGGLE â”€â”€
  const themeToggle = document.querySelector('.theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (storedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (!storedTheme && prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'light') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', next);
  });

  // â”€â”€ CONTACT FORM â”€â”€
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = contactForm.querySelector('.form-submit');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = contactForm.querySelector('#name').value.trim();
    const email = contactForm.querySelector('#email').value.trim();
    const subject = contactForm.querySelector('#subject').value.trim();
    const message = contactForm.querySelector('#message').value.trim();
    const honeypot = contactForm.querySelector('#website').value;
    const turnstileToken = contactForm.querySelector('[name="cf-turnstile-response"]')?.value;

    // Disable button and show sending state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending\u2026';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    if (!turnstileToken) {
      formStatus.textContent = 'Please complete the verification check.';
      formStatus.className = 'form-status form-status--error';
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send message <span class="arrow">&rarr;</span>';
      return;
    }

    try {
      const res = await fetch('https://contact-form.maurizioliberato.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, honeypot, turnstileToken }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        formStatus.textContent = 'Message sent \u2014 I\u2019ll be in touch within 24 hours.';
        formStatus.className = 'form-status form-status--success';
        contactForm.reset();
        if (typeof turnstile !== 'undefined') turnstile.reset();
      } else {
        formStatus.textContent = data.error || 'Something went wrong. Please try again.';
        formStatus.className = 'form-status form-status--error';
      }
    } catch (err) {
      formStatus.textContent = 'Network error. Please check your connection and try again.';
      formStatus.className = 'form-status form-status--error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send message <span class="arrow">&rarr;</span>';
    }
  });
});
