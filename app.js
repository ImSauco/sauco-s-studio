// =========================
// Referencias del DOM
// =========================
const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const siteHeader = document.querySelector('.site-header');
const cursorRing = document.querySelector('.custom-cursor-ring');
const cursorDot = document.querySelector('.custom-cursor-dot');
const navLinks = document.querySelectorAll('.site-nav a');
const loadRevealElements = document.querySelectorAll('.reveal-on-load');
const revealElements = document.querySelectorAll('.reveal-on-scroll');
const depthCards = document.querySelectorAll('.depth-card');
const interactiveElements = document.querySelectorAll('a, button, .depth-card, .hero-highlights span, .skill-list span');
const projectGalleries = document.querySelectorAll('[data-gallery]');
const lightbox = document.querySelector('[data-project-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxTitle = document.querySelector('[data-lightbox-title]');
const lightboxCopy = document.querySelector('[data-lightbox-copy]');
const lightboxKicker = document.querySelector('[data-lightbox-kicker]');
const lightboxCloseButtons = document.querySelectorAll('[data-lightbox-close]');
const lightboxPrevButton = document.querySelector('[data-lightbox-prev]');
const lightboxNextButton = document.querySelector('[data-lightbox-next]');
const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// =========================
// Estado compartido
// =========================
const galleryState = new Map();
let activeLightboxGallery = null;

// =========================
// Helpers de galeria y lightbox
// =========================
const syncGallery = (gallery, nextIndex) => {
  const slides = Array.from(gallery.querySelectorAll('[data-gallery-slide]'));
  const stageImage = gallery.querySelector('.project-gallery-stage-image');
  const stageTitle = gallery.querySelector('.project-card-caption-stage strong');
  const stageCopy = gallery.querySelector('.project-card-caption-stage span');
  const counter = gallery.querySelector('[data-gallery-counter]');

  if (!slides.length || !stageImage || !stageTitle || !stageCopy || !counter) {
    return;
  }

  const safeIndex = (nextIndex + slides.length) % slides.length;
  const activeSlide = slides[safeIndex];

  slides.forEach((slide, index) => {
    const isActive = index === safeIndex;

    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-pressed', String(isActive));
  });

  stageImage.src = activeSlide.dataset.image || '';
  stageImage.alt = activeSlide.dataset.alt || '';
  stageTitle.textContent = activeSlide.dataset.title || '';
  stageCopy.textContent = activeSlide.dataset.copy || '';
  counter.textContent = `${String(safeIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;

  galleryState.set(gallery, safeIndex);

  if (activeLightboxGallery === gallery && lightboxImage && lightboxTitle && lightboxCopy && lightboxKicker) {
    lightboxImage.src = activeSlide.dataset.image || '';
    lightboxImage.alt = activeSlide.dataset.alt || '';
    lightboxTitle.textContent = activeSlide.dataset.title || '';
    lightboxCopy.textContent = activeSlide.dataset.copy || '';
    lightboxKicker.textContent = `Galeria ${gallery.dataset.gallery || ''}`.trim();
  }
};

const toggleLightbox = (shouldOpen, gallery = null) => {
  if (!lightbox) {
    return;
  }

  lightbox.hidden = !shouldOpen;
  document.body.classList.toggle('lightbox-open', shouldOpen);
  activeLightboxGallery = shouldOpen ? gallery : null;

  if (shouldOpen && gallery) {
    syncGallery(gallery, galleryState.get(gallery) ?? 0);
  }
};

const installSwipeNavigation = (surface, onPrevious, onNext, options = {}) => {
  if (!surface) {
    return;
  }

  let startX = 0;
  let startY = 0;
  let isTracking = false;

  surface.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      isTracking = true;
    },
    { passive: true },
  );

  surface.addEventListener(
    'touchend',
    (event) => {
      if (!isTracking || event.changedTouches.length !== 1) {
        return;
      }

      isTracking = false;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const isHorizontalSwipe = Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

      if (!isHorizontalSwipe) {
        return;
      }

      if (options.suppressNextClick) {
        surface.dataset.swipeSuppressed = 'true';
      }

      if (deltaX > 0) {
        onPrevious();
      } else {
        onNext();
      }
    },
    { passive: true },
  );

  if (options.suppressNextClick) {
    surface.addEventListener('click', (event) => {
      if (surface.dataset.swipeSuppressed !== 'true') {
        return;
      }

      surface.dataset.swipeSuppressed = 'false';
      event.preventDefault();
      event.stopPropagation();
    });
  }
};

// =========================
// Carga inicial
// =========================
window.addEventListener('load', () => {
  document.body.classList.add('is-ready');
  loadRevealElements.forEach((element) => element.classList.add('is-visible'));
});

// =========================
// Cursor custom en dispositivos compatibles
// =========================
if (supportsFinePointer && cursorRing && cursorDot) {
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let ringX = cursorX;
  let ringY = cursorY;

  const renderCursor = () => {
    ringX += (cursorX - ringX) * 0.18;
    ringY += (cursorY - ringY) * 0.18;

    cursorDot.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

    window.requestAnimationFrame(renderCursor);
  };

  window.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    document.body.classList.add('cursor-active');
  });

  window.addEventListener('pointerdown', () => {
    document.body.classList.add('cursor-hover');
  });

  window.addEventListener('pointerup', () => {
    document.body.classList.remove('cursor-hover');
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });

  interactiveElements.forEach((element) => {
    element.addEventListener('pointerenter', () => {
      document.body.classList.add('cursor-hover');
    });

    element.addEventListener('pointerleave', () => {
      document.body.classList.remove('cursor-hover');
    });
  });

  window.requestAnimationFrame(renderCursor);
}

// =========================
// Navegacion movil
// =========================
if (menuToggle && siteNav) {
  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    siteNav.classList.toggle('is-open', !isExpanded);
    document.body.classList.toggle('nav-open', !isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      siteNav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    });
  });
}

// =========================
// Reveal on scroll
// =========================
if ('IntersectionObserver' in window && revealElements.length > 0) {
  const revealIfNearViewport = (element) => {
    const bounds = element.getBoundingClientRect();
    const entersViewport = bounds.top <= window.innerHeight * 0.92;
    const stillVisible = bounds.bottom >= 0;

    if (!entersViewport || !stillVisible) {
      return false;
    }

    element.classList.add('is-visible');
    return true;
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -10% 0px',
    },
  );

  const syncRevealState = () => {
    revealElements.forEach((element) => {
      if (element.classList.contains('is-visible')) {
        return;
      }

      if (revealIfNearViewport(element)) {
        observer.unobserve(element);
      }
    });
  };

  revealElements.forEach((element) => observer.observe(element));
  syncRevealState();
  window.addEventListener('scroll', syncRevealState, { passive: true });
  window.addEventListener('resize', syncRevealState, { passive: true });
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

// =========================
// Header sticky condensado
// =========================
if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle('is-condensed', window.scrollY > 24);
  };

  syncHeaderState();
  window.addEventListener('scroll', syncHeaderState, { passive: true });
}

// =========================
// Efecto de profundidad en tarjetas
// =========================
depthCards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const bounds = card.getBoundingClientRect();
    const relativeX = ((event.clientX - bounds.left) / bounds.width) * 100;
    const relativeY = ((event.clientY - bounds.top) / bounds.height) * 100;

    card.style.setProperty('--pointer-x', `${relativeX}%`);
    card.style.setProperty('--pointer-y', `${relativeY}%`);
  });

  card.addEventListener('pointerleave', () => {
    card.style.removeProperty('--pointer-x');
    card.style.removeProperty('--pointer-y');
  });
});

// =========================
// Galerias de proyectos
// =========================
projectGalleries.forEach((gallery) => {
  const slides = Array.from(gallery.querySelectorAll('[data-gallery-slide]'));
  const previousButton = gallery.querySelector('[data-gallery-prev]');
  const nextButton = gallery.querySelector('[data-gallery-next]');
  const openButton = gallery.querySelector('[data-gallery-open]');

  if (!slides.length) {
    return;
  }

  syncGallery(gallery, 0);

  slides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      syncGallery(gallery, index);
    });
  });

  previousButton?.addEventListener('click', () => {
    syncGallery(gallery, (galleryState.get(gallery) ?? 0) - 1);
  });

  nextButton?.addEventListener('click', () => {
    syncGallery(gallery, (galleryState.get(gallery) ?? 0) + 1);
  });

  installSwipeNavigation(
    openButton,
    () => syncGallery(gallery, (galleryState.get(gallery) ?? 0) - 1),
    () => syncGallery(gallery, (galleryState.get(gallery) ?? 0) + 1),
    { suppressNextClick: true },
  );

  openButton?.addEventListener('click', () => {
    toggleLightbox(true, gallery);
  });
});

// =========================
// Controles del lightbox
// =========================
lightboxCloseButtons.forEach((button) => {
  button.addEventListener('click', () => {
    toggleLightbox(false);
  });
});

lightboxPrevButton?.addEventListener('click', () => {
  if (!activeLightboxGallery) {
    return;
  }

  syncGallery(activeLightboxGallery, (galleryState.get(activeLightboxGallery) ?? 0) - 1);
});

lightboxNextButton?.addEventListener('click', () => {
  if (!activeLightboxGallery) {
    return;
  }

  syncGallery(activeLightboxGallery, (galleryState.get(activeLightboxGallery) ?? 0) + 1);
});

installSwipeNavigation(
  lightboxImage,
  () => {
    if (!activeLightboxGallery) {
      return;
    }

    syncGallery(activeLightboxGallery, (galleryState.get(activeLightboxGallery) ?? 0) - 1);
  },
  () => {
    if (!activeLightboxGallery) {
      return;
    }

    syncGallery(activeLightboxGallery, (galleryState.get(activeLightboxGallery) ?? 0) + 1);
  },
);

// =========================
// Teclado dentro del lightbox
// =========================
window.addEventListener('keydown', (event) => {
  if (!activeLightboxGallery || !lightbox || lightbox.hidden) {
    return;
  }

  if (event.key === 'Escape') {
    toggleLightbox(false);
  }

  if (event.key === 'ArrowLeft') {
    syncGallery(activeLightboxGallery, (galleryState.get(activeLightboxGallery) ?? 0) - 1);
  }

  if (event.key === 'ArrowRight') {
    syncGallery(activeLightboxGallery, (galleryState.get(activeLightboxGallery) ?? 0) + 1);
  }
});