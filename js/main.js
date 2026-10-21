/* ==========================================================================
   MV CELL — main.js
   Carregado com defer. Tudo fica dentro desta IIFE: nenhuma variável global.
   ========================================================================== */
(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     PRODUTOS DO OUTLET — edite modelos e preços aqui.
     brand: 'apple' | 'samsung' | 'motorola' | 'xiaomi' (muda a cor do card)
     condition: 'novo' | 'seminovo'
     price: valor inteiro em reais (2399 = R$ 2.399)
     ------------------------------------------------------------------------ */
  const PRODUCTS = [
    { id: 'iphone13', brand: 'apple', model: 'iPhone 13', storage: '128GB', condition: 'seminovo', price: 2399 },
    { id: 'iphone14', brand: 'apple', model: 'iPhone 14', storage: '128GB', condition: 'seminovo', price: 3099 },
    { id: 'galaxys23', brand: 'samsung', model: 'Samsung Galaxy S23', storage: '256GB', condition: 'seminovo', price: 2799 },
    { id: 'galaxya55', brand: 'samsung', model: 'Samsung Galaxy A55 5G', storage: '128GB', condition: 'novo', price: 1899 },
    { id: 'motog85', brand: 'motorola', model: 'Motorola Moto G85 5G', storage: '256GB', condition: 'novo', price: 1399 },
    { id: 'redminote14', brand: 'xiaomi', model: 'Xiaomi Redmi Note 14', storage: '256GB', condition: 'novo', price: 1299 },
  ];

  /* ------------------------------------------------------------------------
     HORÁRIO DE FUNCIONAMENTO (fuso America/Sao_Paulo) — edite aqui.
     Formato 'HH:MM'. Use null para dia fechado.
     Alimenta o status "Aberto agora" e a tabela de horários.
     ------------------------------------------------------------------------ */
  const HOURS = {
    seg: { open: '09:00', close: '17:00' },
    ter: { open: '09:00', close: '17:00' },
    qua: { open: '09:00', close: '17:00' },
    qui: { open: '09:00', close: '17:00' },
    sex: { open: '09:00', close: '17:00' },
    sab: { open: '09:00', close: '13:00' },
    dom: null,
  };

  const CONFIG = {
    whatsapp: '5511947840245',
    timezone: 'America/Sao_Paulo',
    mapEmbed: 'https://www.google.com/maps?q=-23.659933,-46.8600104&z=17&output=embed',
  };

  // Índice do Date (0 = domingo) → chave em HOURS e rótulos em pt-BR.
  const DAYS = [
    { key: 'dom', short: 'dom', label: 'Domingo' },
    { key: 'seg', short: 'seg', label: 'Segunda' },
    { key: 'ter', short: 'ter', label: 'Terça' },
    { key: 'qua', short: 'qua', label: 'Quarta' },
    { key: 'qui', short: 'qui', label: 'Quinta' },
    { key: 'sex', short: 'sex', label: 'Sexta' },
    { key: 'sab', short: 'sáb', label: 'Sábado' },
  ];
  const TABLE_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const CONDITION_LABEL = { novo: 'Novo', seminovo: 'Seminovo revisado' };


  /* ------------------------------------------------------------------------
     UTILITÁRIOS
     ------------------------------------------------------------------------ */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function createIcon(id) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', `#${id}`);
    svg.append(use);
    return svg;
  }

  // Garante no máximo uma execução por frame (scroll/resize).
  function rafThrottle(fn) {
    let queued = false;
    return () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        fn();
      });
    };
  }


  /* ------------------------------------------------------------------------
     WHATSAPP + RASTREAMENTO DE LEADS
     ------------------------------------------------------------------------ */
  function buildWa(msg) {
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  }

  function setWaLink(link, msg, origin) {
    link.href = buildWa(msg);
    link.dataset.waMsg = msg;
    link.dataset.origin = origin;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }

  // O HTML já traz o href completo (funciona sem JS); aqui ele é regerado a partir do data-wa-msg.
  function initWhatsAppLinks() {
    $$('a[data-wa-msg]').forEach((link) => {
      link.href = buildWa(link.dataset.waMsg);
    });
  }

  function trackLead(origin) {
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push({ event: 'whatsapp_click', origin });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', { origin });
    }
  }

  // Um único listener no document cobre todos os CTAs, inclusive os criados via JS.
  function initLeadTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-wa-msg]');
      if (link) trackLead(link.dataset.origin || 'desconhecido');
    });
  }


  /* ------------------------------------------------------------------------
     HEADER: fundo ao rolar + esconde/mostra no mobile
     ------------------------------------------------------------------------ */
  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;
    const mobile = window.matchMedia('(max-width: 767.98px)');
    let lastY = 0;

    const update = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);

      if (!mobile.matches || y < 120) {
        header.classList.remove('is-hidden');
        lastY = y;
        return;
      }
      const delta = y - lastY;
      if (Math.abs(delta) < 8) return;
      header.classList.toggle('is-hidden', delta > 0);
      lastY = y;
    };

    // Ler window.scrollY força layout: o estado inicial fica para o primeiro frame, não para o carregamento do script.
    requestAnimationFrame(update);
    window.addEventListener('scroll', rafThrottle(update), { passive: true });
  }


  /* ------------------------------------------------------------------------
     STATUS "ABERTO AGORA" + TABELA DE HORÁRIOS + RELÓGIO DO MOCKUP
     ------------------------------------------------------------------------ */
  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const formatHour = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
  };

  // Data/hora no fuso informado, via Intl.DateTimeFormat. Função autocontida: também roda dentro do Worker.
  function computeZonedTime(timeZone) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(now);
    const get = (type) => (parts.find((part) => part.type === type) || {}).value;
    return {
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
      minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
      clock: new Intl.DateTimeFormat('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now),
      date: new Intl.DateTimeFormat('pt-BR', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(now),
    };
  }

  // O primeiro Intl.DateTimeFormat custa ~50ms (o navegador carrega os dados de fuso/idioma).
  // Para não travar a página, o cálculo roda num Web Worker; se não der, roda aqui mesmo.
  function createZonedClock(timeZone) {
    let worker = null;
    try {
      const source = `const compute = ${computeZonedTime.toString()};\nonmessage = (event) => postMessage(compute(event.data));`;
      worker = new Worker(URL.createObjectURL(new Blob([source], { type: 'text/javascript' })));
    } catch (error) {
      worker = null;
    }

    return () => new Promise((resolve) => {
      if (!worker) {
        resolve(computeZonedTime(timeZone));
        return;
      }
      const finish = (data) => {
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        window.clearTimeout(timer);
        resolve(data);
      };
      const fallback = () => {
        worker = null;
        finish(computeZonedTime(timeZone));
      };
      const onMessage = (event) => finish(event.data);
      const onError = (event) => {
        event.preventDefault();
        fallback();
      };
      const timer = window.setTimeout(fallback, 3000);
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage(timeZone);
    });
  }

  function getOpenStatus(now) {
    const today = HOURS[DAYS[now.day].key];
    if (today && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close)) {
      return { open: true, closesAt: formatHour(today.close) };
    }
    for (let offset = 0; offset <= 7; offset += 1) {
      const index = (now.day + offset) % 7;
      const hours = HOURS[DAYS[index].key];
      if (!hours) continue;
      if (offset === 0 && now.minutes >= toMinutes(hours.open)) continue;
      const when = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : DAYS[index].short;
      return { open: false, when, at: formatHour(hours.open) };
    }
    return { open: false };
  }

  function statusText(status, long) {
    if (status.open) return long ? `Aberto agora · fecha às ${status.closesAt}` : 'Aberto agora';
    if (!status.when) return 'Fechado';
    return `Fechado · abre ${status.when} às ${status.at}`;
  }

  function renderHoursTable(todayIndex) {
    const body = $('[data-hours-table]');
    if (!body) return;
    const rows = TABLE_ORDER.map((index) => {
      const day = DAYS[index];
      const hours = HOURS[day.key];
      const row = createEl('tr');
      row.dataset.day = String(index);
      const th = createEl('th', null, day.label);
      th.scope = 'row';
      const td = createEl('td', null, hours ? `${formatHour(hours.open)} – ${formatHour(hours.close)}` : 'Fechado');
      if (index === todayIndex) {
        row.className = 'is-today';
        row.setAttribute('aria-current', 'date');
        th.append(createEl('span', 'hours__today', 'hoje'));
      }
      row.append(th, td);
      return row;
    });
    body.replaceChildren(...rows);
  }

  function renderPhoneClock(now) {
    const clock = $('[data-clock]');
    const label = $('[data-clock-date]');
    if (clock) clock.textContent = now.clock;
    if (label) label.textContent = now.date.charAt(0).toUpperCase() + now.date.slice(1);
  }

  function initOpenStatus() {
    const targets = $$('[data-open-status]');
    const readClock = createZonedClock(CONFIG.timezone);
    let renderedDay = -1;

    const render = () => readClock().then((now) => {
      const status = getOpenStatus(now);

      targets.forEach((el) => {
        el.classList.toggle('is-open', status.open);
        el.classList.toggle('is-closed', !status.open);
        const text = $('[data-status-text]', el);
        if (text) text.textContent = statusText(status, el.hasAttribute('data-status-long'));
      });

      if (now.day !== renderedDay) {
        renderHoursTable(now.day);
        renderedDay = now.day;
      }
      renderPhoneClock(now);
    });

    render();
    window.setInterval(render, 30000);
  }


  /* ------------------------------------------------------------------------
     OUTLET: cards renderizados a partir de PRODUCTS (só textContent)
     ------------------------------------------------------------------------ */
  // Preço inteiro em reais com separador de milhar pt-BR (2399 → "2.399"). Sem Intl: evita ~50ms na 1ª chamada.
  function formatPrice(value) {
    const amount = String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return { currency: 'R$', amount };
  }

  function createProductCard(product) {
    const item = createEl('li', 'product');
    item.dataset.brand = product.brand;

    const visual = createEl('div', 'product__visual');
    visual.setAttribute('aria-hidden', 'true');
    const phone = createEl('span', 'product__phone');
    phone.append(createEl('span', 'product__cam'));
    visual.append(phone);

    const body = createEl('div', 'product__body');
    const name = createEl('h3', 'product__name', product.model);
    const badge = createEl(
      'p',
      `product__badge product__badge--${product.condition}`,
      CONDITION_LABEL[product.condition] || product.condition,
    );
    const storage = createEl('p', 'product__storage', product.storage);

    const { currency, amount } = formatPrice(product.price);
    const price = createEl('p', 'product__price');
    price.append(createEl('span', 'product__currency', currency), createEl('span', 'product__amount', amount));
    const installments = createEl('p', 'product__install', 'ou em até 10x no cartão');

    const cta = createEl('a', 'btn btn--signal product__cta');
    setWaLink(
      cta,
      `Olá! Tenho interesse no ${product.model} ${product.storage} que vi no site. Ainda tem?`,
      `outlet_${product.id}`,
    );
    cta.append(
      createIcon('i-wa'),
      document.createTextNode('Tenho interesse'),
      createEl('span', 'sr-only', ` no ${product.model} ${product.storage}`),
    );

    body.append(name, badge, storage, price, installments, cta);
    item.append(visual, body);
    return item;
  }

  function renderProducts() {
    const track = $('[data-products]');
    if (!track) return;
    const fragment = document.createDocumentFragment();
    PRODUCTS.forEach((product) => fragment.append(createProductCard(product)));
    track.insertBefore(fragment, $('[data-products-end]', track));
    // O snap só liga agora (ver CSS): assim o carrossel começa no primeiro produto, não no card final.
    track.classList.add('is-ready');
  }


  /* ------------------------------------------------------------------------
     CARROSSÉIS: setas (desktop) + estado desabilitado nas pontas
     ------------------------------------------------------------------------ */
  function initCarousels() {
    $$('[data-carousel]').forEach((carousel) => {
      const track = $('[data-carousel-track]', carousel);
      if (!track) return;
      const prev = $('[data-carousel-prev]', carousel);
      const next = $('[data-carousel-next]', carousel);

      const stepSize = () => {
        const item = track.firstElementChild;
        if (!item) return track.clientWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        return item.getBoundingClientRect().width + gap;
      };

      const updateButtons = () => {
        const max = track.scrollWidth - track.clientWidth - 2;
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max;
      };

      const go = (direction) => {
        track.scrollBy({ left: direction * stepSize(), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      };

      if (prev) prev.addEventListener('click', () => go(-1));
      if (next) next.addEventListener('click', () => go(1));

      // Só mede quando o carrossel chega perto da tela (sem layout forçado no carregamento).
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        updateButtons();
        track.addEventListener('scroll', rafThrottle(updateButtons), { passive: true });
        window.addEventListener('resize', rafThrottle(updateButtons));
      };
      if (!('IntersectionObserver' in window)) {
        start();
        return;
      }
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        start();
      }, { rootMargin: '200px 0px' });
      observer.observe(track);
    });
  }


  /* ------------------------------------------------------------------------
     REVEAL: [data-reveal] entra com fade + translate (uma vez)
     Stagger de 80ms em grids [data-stagger] via --i.
     ------------------------------------------------------------------------ */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      let index = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.parentElement && el.parentElement.closest('[data-stagger]')) {
          el.style.setProperty('--i', String(index));
          index += 1;
        }
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, { threshold: 0.2 });

    items.forEach((el) => observer.observe(el));
  }


  /* ------------------------------------------------------------------------
     COMO FUNCIONA: bateria carrega de 0 a 100% com o scroll da seção
     ------------------------------------------------------------------------ */
  function initTimeline() {
    const steps = $('[data-steps]');
    if (!steps) return;
    const items = $$('[data-step]', steps);
    const dots = items.map((item) => $('.step__dot', item));
    const label = $('[data-battery-pct]', steps);
    const horizontal = window.matchMedia('(min-width: 1200px)');
    const PARK = 52; // px após o último passo, onde a bateria fica estacionada em 100%
    const DOCK = 26; // px de distância de um passo em que a bateria "encaixa" e some atrás do círculo
    let thresholds = items.map(() => 0);
    let railStart = 0;
    let railLength = 1;
    let lastValue = -1;
    let inView = false;

    function measure() {
      const isHorizontal = horizontal.matches;
      const box = steps.getBoundingClientRect();
      const centers = dots.map((dot) => {
        const rect = dot.getBoundingClientRect();
        return isHorizontal ? rect.left + rect.width / 2 - box.left : rect.top + rect.height / 2 - box.top;
      });
      railStart = centers[0];
      railLength = Math.max(1, centers[centers.length - 1] + PARK - railStart);
      thresholds = centers.map((center) => (center - railStart) / railLength);
      steps.style.setProperty('--rail-start', `${railStart}px`);
      steps.style.setProperty('--rail-len', `${railLength}px`);
    }

    function setProgress(progress) {
      steps.style.setProperty('--progress', progress.toFixed(4));
      const value = Math.round(progress * 100);
      if (value !== lastValue) {
        lastValue = value;
        if (label) label.textContent = `${value}%`;
        steps.classList.toggle('is-low', value < 25);
      }
      items.forEach((item, i) => {
        item.classList.toggle('is-lit', progress > 0 && progress >= thresholds[i] - 0.01);
      });
      const docked = thresholds.some((t) => Math.abs(progress - t) * railLength < DOCK);
      steps.classList.toggle('is-docked', docked);
    }

    function update(force) {
      if (!inView && force !== true) return;
      const viewport = window.innerHeight;
      const box = steps.getBoundingClientRect();
      const progress = horizontal.matches
        ? (viewport * 0.85 - box.top) / (viewport * 0.45)
        : (viewport * 0.6 - (box.top + railStart)) / railLength;
      setProgress(clamp(progress, 0, 1));
    }

    // Movimento reduzido: bateria cheia, todos os passos acesos, sem listener de scroll.
    const reduced = prefersReducedMotion();
    const refresh = () => (reduced ? setProgress(1) : update(true));
    const onScroll = rafThrottle(() => update());
    const remeasure = rafThrottle(() => {
      measure();
      refresh();
    });

    // Só mede quando a seção chega perto da tela (nada de layout forçado no carregamento).
    let started = false;
    const start = () => {
      started = true;
      measure();
      steps.classList.add('is-live');
      refresh();
      if (!reduced) window.addEventListener('scroll', onScroll, { passive: true });
      if ('ResizeObserver' in window) new ResizeObserver(remeasure).observe(steps);
      else window.addEventListener('resize', remeasure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
    };

    if (!('IntersectionObserver' in window)) {
      inView = true;
      start();
      return;
    }
    new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      if (!inView) return;
      if (!started) start();
      else onScroll();
    }, { rootMargin: '25% 0px 25% 0px' }).observe(steps);
  }


  /* ------------------------------------------------------------------------
     AVALIAÇÕES: contador 0 → 182 (easeOutCubic, 1,2s) ao entrar na tela
     ------------------------------------------------------------------------ */
  function initCounter() {
    const counter = $('[data-counter]');
    if (!counter) return;
    const target = Number(counter.dataset.counter) || 0;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      counter.textContent = String(target);
      return;
    }

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    counter.textContent = '0';

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const t = clamp((now - start) / duration, 0, 1);
        counter.textContent = String(Math.round(easeOutCubic(t) * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });

    observer.observe(counter);
  }


  /* ------------------------------------------------------------------------
     FAQ: <details> com altura animada (grid-template-rows 0fr → 1fr)
     ------------------------------------------------------------------------ */
  function initFaq() {
    $$('[data-faq] details').forEach((details) => {
      const summary = $('summary', details);
      const panel = $('.faq__a', details);
      if (!summary || !panel) return;
      let cancelPending = null;

      const afterTransition = (callback) => {
        const done = (event) => {
          if (event && (event.target !== panel || event.propertyName !== 'grid-template-rows')) return;
          panel.removeEventListener('transitionend', done);
          window.clearTimeout(timer);
          cancelPending = null;
          callback();
        };
        const timer = window.setTimeout(done, 500);
        panel.addEventListener('transitionend', done);
        cancelPending = () => {
          panel.removeEventListener('transitionend', done);
          window.clearTimeout(timer);
          cancelPending = null;
        };
      };

      summary.addEventListener('click', (event) => {
        if (prefersReducedMotion()) return; // abre/fecha nativo, sem animação
        event.preventDefault();
        if (cancelPending) cancelPending();

        const closing = details.open && !details.classList.contains('is-collapsed');
        if (closing) {
          details.classList.add('is-collapsed');
          afterTransition(() => {
            details.open = false;
            details.classList.remove('is-collapsed');
          });
        } else {
          details.classList.add('is-collapsed');
          details.open = true;
          void panel.offsetHeight; // aplica 0fr antes de animar até 1fr
          details.classList.remove('is-collapsed');
        }
      });
    });
  }


  /* ------------------------------------------------------------------------
     MAPA: iframe só entra no clique ou quando a seção aparece (protege o LCP)
     ------------------------------------------------------------------------ */
  function initMap() {
    const map = $('[data-map]');
    if (!map) return;
    const trigger = $('[data-map-load]', map);
    let loaded = false;

    const load = () => {
      if (loaded) return;
      loaded = true;
      const iframe = document.createElement('iframe');
      iframe.src = CONFIG.mapEmbed;
      iframe.title = 'Mapa com a localização da MV CELL em Embu das Artes';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      iframe.addEventListener('load', () => {
        map.classList.add('is-loaded');
        if (trigger) trigger.hidden = true;
      }, { once: true });
      map.append(iframe);
    };

    if (trigger) {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        load();
      });
    }

    if ('IntersectionObserver' in window) {
      const section = map.closest('[data-map-section]') || map;
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      });
      observer.observe(section);
    }
  }


  /* ------------------------------------------------------------------------
     BARRA FIXA MOBILE: aparece quando o CTA do hero sai da tela
     e some quando o CTA final aparece.
     ------------------------------------------------------------------------ */
  function initStickyBar() {
    const bar = $('[data-sticky-bar]');
    if (!bar) return;
    const heroCta = $('#hero-cta');
    const finalCta = $('#cta-final');
    if (!heroCta || !finalCta || !('IntersectionObserver' in window)) {
      bar.classList.add('is-visible');
      return;
    }

    const state = { hero: true, final: false };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === heroCta) state.hero = entry.isIntersecting;
        if (entry.target === finalCta) state.final = entry.isIntersecting;
      });
      bar.classList.toggle('is-visible', !state.hero && !state.final);
    });
    observer.observe(heroCta);
    observer.observe(finalCta);
  }


  /* ------------------------------------------------------------------------
     APÓS O PRIMEIRO PAINT: libera as animações de entrada (2º frame) e o
     grain (evento load), para não competirem com o FCP/LCP.
     ------------------------------------------------------------------------ */
  function initAfterPaint() {
    const html = document.documentElement;
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('anim-on')));
    const loaded = () => html.classList.add('is-loaded');
    if (document.readyState === 'complete') loaded();
    else window.addEventListener('load', loaded, { once: true });
  }


  /* ------------------------------------------------------------------------
     RODAPÉ: ano automático
     ------------------------------------------------------------------------ */
  function initYear() {
    const year = String(new Date().getFullYear());
    $$('[data-year]').forEach((el) => {
      el.textContent = year;
    });
  }


  /* ------------------------------------------------------------------------
     INICIALIZAÇÃO: cada módulo isolado (um erro não derruba os outros).
     O que aparece no primeiro paint roda já; o resto (abaixo da dobra) roda
     logo depois do primeiro frame, para não atrasar o FCP/LCP.
     ------------------------------------------------------------------------ */
  function runModules(modules) {
    modules.forEach((module) => {
      try {
        module();
      } catch (error) {
        console.error(`[MV CELL] falha em ${module.name}:`, error);
      }
    });
  }

  // Um módulo por tarefa, devolvendo a thread ao navegador entre eles (nenhuma tarefa longa).
  function runInSeparateTasks(modules) {
    const queue = modules.slice();
    const next = () => {
      const module = queue.shift();
      if (!module) return;
      runModules([module]);
      setTimeout(next, 0);
    };
    next();
  }

  function init() {
    runModules([initLeadTracking, initHeader, initAfterPaint]);
    document.documentElement.classList.add('js-ready');

    const deferred = [
      initReveal,
      initOpenStatus,
      initStickyBar,
      renderProducts,
      initCarousels,
      initTimeline,
      initCounter,
      initFaq,
      initMap,
      initWhatsAppLinks,
      initYear,
    ];
    requestAnimationFrame(() => setTimeout(() => runInSeparateTasks(deferred), 0));
  }

  init();
})();
