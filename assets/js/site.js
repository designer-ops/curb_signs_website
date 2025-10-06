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
});
