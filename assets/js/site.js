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
    let observer;

    if (filterButtons.length) {
      const normalize = (value = '') => value.toLowerCase();

      const setCardVisibility = (card, shouldShow) => {
        card.hidden = !shouldShow;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
            // Small delay to ensure display:none is removed before animation starts
            requestAnimationFrame(() => {
                card.classList.add('fade-in');
            });
        } else {
            card.classList.remove('fade-in');
        }
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

        // Reset for new filter
        galleryCards.forEach((card) => {
            card.classList.remove('fade-in');
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

        if (observer && sentinel) {
          observer.unobserve(sentinel);
          observer.observe(sentinel);
        }
      };

      const loadMore = () => {
        if (loadedCount >= matchingCards.length) {
          return;
        }
        revealUpTo(loadedCount + BATCH_SIZE);
      };

      if (sentinel && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Sentinel intersecting. calling loadMore');
              loadMore();
            }
          });
        }, { rootMargin: '400px' });
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


  // Sticky Nav Logic
  const heroBar = document.querySelector('.hero-bar');
  const heroImage = document.querySelector('.hero-image');

  if (heroBar) {
    const handleScroll = () => {
      let shouldHaveBackground = false;

      if (heroImage) {
        // Main page: show background when scrolled past 60% of the viewport height
        // The hero is min 70vh, so this ensures background is on before we hit the white section
        shouldHaveBackground = window.scrollY > (window.innerHeight * 0.6);
      } else {
        // Product page: always show background (or after very slight scroll)
        shouldHaveBackground = window.scrollY > 10;
      }

      if (shouldHaveBackground) {
        heroBar.classList.add('has-background');
      } else {
        heroBar.classList.remove('has-background');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }
  // Facts Animation
  const factNumbers = document.querySelectorAll('.fact-number');
  if (factNumbers.length > 0) {
    const animateValue = (obj, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Ease out quart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        const current = Math.floor(easeProgress * (end - start) + start);
        obj.textContent = current.toLocaleString();
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
            obj.textContent = end.toLocaleString();
        }
      };
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const endValue = parseInt(target.getAttribute('data-target'), 10);
            
            animateValue(target, 0, endValue, 2000);
            observer.unobserve(target);
        }
      });
    }, { threshold: 0.1 });

    factNumbers.forEach(el => {
        const valueStr = el.textContent.replace(/,/g, '');
        const value = parseInt(valueStr, 10);
        if (!isNaN(value)) {
           el.setAttribute('data-target', value);
           el.textContent = '0';
           observer.observe(el);
        }
    });
  }
});
