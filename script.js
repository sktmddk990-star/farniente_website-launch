document.addEventListener('DOMContentLoaded', () => {
  const copyright = document.querySelector('.footer-copyright');

  if (copyright) {
    const currentYear = new Date().getFullYear();
    copyright.textContent = `© ${currentYear} farniente. All rights reserved.`;
  }

  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  const hamBtn = document.getElementById('hamBtn');
  const navMenu = document.getElementById('navMenu');

  if (hamBtn && navMenu) {
    hamBtn.addEventListener('click', () => {
      hamBtn.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
        hamBtn.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  const slides = document.querySelectorAll('.slide-img');
  let currentSlide = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 6000);
  }

  const fadeElements = document.querySelectorAll('.js-fade-up');
  if (fadeElements.length > 0) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
  }

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const privacyLinks = document.querySelectorAll('.privacy-link');

  if (!privacyLinks.length) return;

  const dialog = document.createElement('dialog');

  // Keep the ordinary page link if dialogs are unsupported.
  if (typeof dialog.showModal !== 'function') return;

  // Directly opened local files cannot reliably fetch other HTML files.
  // In that case, the link opens privacy.html as a normal page.
  if (window.location.protocol === 'file:') return;

  dialog.className = 'privacy-dialog';
  dialog.setAttribute('aria-labelledby', 'privacy-dialog-title');

  dialog.innerHTML = `
    <div class="privacy-dialog-header">
      <h2 id="privacy-dialog-title" class="privacy-dialog-title">
        개인정보처리방침
      </h2>

      <button
        type="button"
        class="privacy-dialog-close"
        autofocus
      >
        닫기
      </button>
    </div>

    <div class="privacy-dialog-body"></div>
  `;

  document.body.appendChild(dialog);

  const dialogBody = dialog.querySelector('.privacy-dialog-body');
  const closeButton = dialog.querySelector('.privacy-dialog-close');

  let contentLoaded = false;
  let loading = false;
  let openingLink = null;

  async function loadPolicy(url) {
    if (contentLoaded || loading) return;

    loading = true;
    dialogBody.setAttribute('aria-busy', 'true');

    dialogBody.innerHTML = `
      <p class="privacy-dialog-message" role="status">
        개인정보 처리방침을 불러오는 중입니다.
      </p>
    `;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Privacy policy could not be loaded.');
      }

      const html = await response.text();

      const policyPage = new DOMParser().parseFromString(
        html,
        'text/html'
      );

      const policyContent = policyPage.querySelector(
        '.privacy-document'
      );

      if (!policyContent) {
        throw new Error('Privacy policy content was not found.');
      }

      dialogBody.replaceChildren(
        document.importNode(policyContent, true)
      );

      contentLoaded = true;
    } catch (error) {
      const message = document.createElement('p');
      message.className = 'privacy-dialog-message';
      message.setAttribute('role', 'alert');
      message.textContent =
        '내용을 불러오지 못했습니다. 아래 링크에서 확인해 주세요.';

      const fallbackLink = document.createElement('a');
      fallbackLink.href = url;
      fallbackLink.textContent = '개인정보 처리방침 보기';

      message.append(document.createElement('br'), fallbackLink);
      dialogBody.replaceChildren(message);
    } finally {
      loading = false;
      dialogBody.removeAttribute('aria-busy');
    }
  }

  privacyLinks.forEach(link => {
    link.addEventListener('click', event => {
      // Preserve ordinary Ctrl/Cmd-click behavior.
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      if (dialog.open) return;

      openingLink = link;

      dialog.showModal();
      document.documentElement.classList.add('privacy-open');

      dialogBody.scrollTop = 0;
      loadPolicy(link.href);
    });
  });

  closeButton.addEventListener('click', () => {
    dialog.close();
  });

  function isOutsideDialog(event) {
    const box = dialog.getBoundingClientRect();

    return (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    );
  }

  let pressStartedOutside = false;

  dialog.addEventListener('pointerdown', event => {
    pressStartedOutside =
      event.target === dialog && isOutsideDialog(event);
  });

  dialog.addEventListener('pointercancel', () => {
    pressStartedOutside = false;
  });

  dialog.addEventListener('click', event => {
    if (
      pressStartedOutside &&
      event.target === dialog &&
      isOutsideDialog(event)
    ) {
      dialog.close();
    }

    pressStartedOutside = false;
  });

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('privacy-open');
    pressStartedOutside = false;

    if (openingLink) {
      openingLink.focus({ preventScroll: true });
    }
  });
});
