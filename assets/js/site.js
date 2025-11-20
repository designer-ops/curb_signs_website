document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.primary-nav');
  const toggle = document.querySelector('.nav-toggle');

  if (!nav || !toggle) {
    return;
  }

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.submenu-open').forEach((item) => {
      item.classList.remove('submenu-open');
      const trigger = item.querySelector(':scope > a');
      if (trigger) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  };

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    nav.classList.toggle('is-open', !expanded);
    if (expanded) {
      closeNav();
    }
  });

  const submenuParents = nav.querySelectorAll('.has-submenu > a');
  submenuParents.forEach((link) => {
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('click', (event) => {
      if (!window.matchMedia('(max-width: 768px)').matches) {
        return;
      }

      const parent = link.parentElement;
      if (!parent) {
        return;
      }

      const alreadyOpen = parent.classList.contains('submenu-open');
      if (!alreadyOpen) {
        event.preventDefault();
        nav.querySelectorAll('.submenu-open').forEach((item) => {
          if (item !== parent) {
            item.classList.remove('submenu-open');
            const trigger = item.querySelector(':scope > a');
            if (trigger) {
              trigger.setAttribute('aria-expanded', 'false');
            }
          }
        });
        parent.classList.add('submenu-open');
        link.setAttribute('aria-expanded', 'true');
      } else {
        parent.classList.remove('submenu-open');
        link.setAttribute('aria-expanded', 'false');
      }
    });
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!window.matchMedia('(max-width: 768px)').matches) {
        return;
      }

      const parent = link.parentElement;
      if (parent && parent.classList.contains('has-submenu') && !parent.classList.contains('submenu-open')) {
        return;
      }

      closeNav();
    });
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 768px)').matches) {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      nav.querySelectorAll('.submenu-open').forEach((item) => {
        item.classList.remove('submenu-open');
        const trigger = item.querySelector(':scope > a');
        if (trigger) {
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });

  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const filterButtons = Array.from(document.querySelectorAll('.filter-pill[data-filter]'));
    const galleryCards = Array.from(gallery.querySelectorAll('.gallery-card'));
    const sentinel = document.querySelector('[data-gallery-sentinel]');
    const countEl = document.querySelector('[data-gallery-count]');
    const emptyState = document.querySelector('[data-gallery-empty]');
    const modal = document.querySelector('[data-gallery-modal]');
    const modalImage = document.querySelector('[data-gallery-modal-image]');
    const modalCloseTriggers = Array.from(document.querySelectorAll('[data-gallery-modal-close]'));
    const validFilters = new Set(filterButtons.map((btn) => btn.dataset.filter));
    const BATCH_SIZE = 12;
    let matchingCards = galleryCards;
    let loadedCount = 0;

    if (filterButtons.length) {
      const normalize = (value = '') => value.toLowerCase();

      const setCardVisibility = (card, shouldShow) => {
        card.hidden = !shouldShow;
        card.style.display = shouldShow ? '' : 'none';
      };

      const revealUpTo = (limit) => {
        loadedCount = Math.min(limit, matchingCards.length);
        matchingCards.forEach((card, index) => {
          setCardVisibility(card, index < loadedCount);
        });
        if (emptyState) {
          emptyState.hidden = matchingCards.length !== 0;
        }
        if (countEl) {
          countEl.textContent = matchingCards.length.toString();
        }
      };

      const applyFilter = (rawValue) => {
        const normalized = normalize(rawValue);
        const filter = validFilters.has(normalized) ? normalized : 'all';

        filterButtons.forEach((btn) => {
          const isActive = btn.dataset.filter === filter;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        matchingCards = galleryCards.filter((card) => {
          const categories = (card.dataset.category || '')
            .split(',')
            .map((item) => normalize(item.trim()))
            .filter(Boolean);
          return filter === 'all' || categories.includes(filter);
        });

        galleryCards.forEach((card) => {
          const shouldKeep = matchingCards.includes(card);
          setCardVisibility(card, false);
          if (!shouldKeep) {
            card.hidden = true;
            card.style.display = 'none';
          }
        });

        revealUpTo(BATCH_SIZE);

        const params = new URLSearchParams(window.location.search);
        if (filter === 'all') {
          params.delete('category');
        } else {
          params.set('category', filter);
        }
        const search = params.toString();
        const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      };

      const loadMore = () => {
        if (loadedCount >= matchingCards.length) {
          return;
        }
        revealUpTo(loadedCount + BATCH_SIZE);
      };

      if (sentinel && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadMore();
            }
          });
        });
        observer.observe(sentinel);
      } else if (sentinel) {
        // Fallback: load all if IntersectionObserver is unavailable
        revealUpTo(Number.MAX_SAFE_INTEGER);
      }

      filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          applyFilter(btn.dataset.filter || 'all');
        });
      });

      const params = new URLSearchParams(window.location.search);
      const initial = normalize(params.get('category') || 'all');
      applyFilter(initial);

      const openModal = (src, alt) => {
        if (!modal || !modalImage) return;
        modalImage.src = src;
        modalImage.alt = alt || '';
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
      };

      const closeModal = () => {
        if (!modal) return;
        modal.hidden = true;
        document.body.style.overflow = '';
        if (modalImage) {
          modalImage.src = '';
          modalImage.alt = '';
        }
      };

      modalCloseTriggers.forEach((btn) => {
        btn.addEventListener('click', closeModal);
      });

      modal?.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          closeModal();
        }
      });

      gallery.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const card = target.closest('.gallery-card');
        if (!card) return;
        const img = card.querySelector('img');
        if (!img || !img.src) return;
        openModal(img.src, img.alt || '');
      });
    }
  }
});
