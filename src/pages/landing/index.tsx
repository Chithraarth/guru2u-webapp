import { useEffect, useRef } from 'react';
import {
  createIcons,
  ArrowDown,
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  Flame,
  Gauge,
  Gem,
  Hand,
  Heart,
  Languages,
  MessageCircleQuestion,
  Mic,
  MoonStar,
  Plus,
  ScanFace,
  Send,
  ShieldCheck,
  ShieldQuestion,
  Smartphone,
  Sparkles,
  Sun,
  Users,
  Volume2,
} from 'lucide';
import markup from './landing.html?raw';
import './landing.css';

const ICONS = {
  ArrowDown, ArrowRight, Briefcase, Check, CheckCircle2, ChevronRight, Download, Eye, Flame, Gauge, Gem, Hand,
  Heart, Languages, MessageCircleQuestion, Mic, MoonStar, Plus, ScanFace, Send, ShieldCheck, ShieldQuestion,
  Smartphone, Sparkles, Sun, Users, Volume2,
};

// Face mesh drawn on the phone's face-scan screen.
const MESH_POINTS = [[100,30],[70,38],[130,38],[50,60],[150,60],[70,80],[90,78],[110,78],[130,80],[75,95],[125,95],[55,115],[145,115],[100,100],[100,125],[88,132],[112,132],[82,155],[100,150],[118,155],[100,162],[60,150],[140,150],[75,180],[125,180],[100,192]];
const MESH_PAIRS = '0-1 0-2 1-3 2-4 1-5 0-6 0-7 2-8 3-5 4-8 5-6 6-7 7-8 5-9 6-9 7-10 8-10 6-13 7-13 9-13 10-13 3-11 4-12 9-11 10-12 13-14 14-15 14-16 9-15 10-16 11-15 12-16 11-21 12-22 15-17 16-19 15-18 16-18 17-18 18-19 17-20 19-20 21-17 22-19 21-23 22-24 23-20 24-20 23-25 24-25 20-25'.split(' ');

/**
 * Wires up the landing page's motion and controls inside `root`: scroll
 * reveals, the phone's rotating screens, counters, the mobile menu and the
 * progress bar. Returns a cleanup that undoes every timer and listener.
 */
function initLanding(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  const $ = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = root) =>
    Array.from(scope.querySelectorAll<T & Element>(sel)) as T[];
  const listen = (target: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };
  const every = (fn: () => void, ms: number) => {
    const id = window.setInterval(fn, ms);
    cleanups.push(() => window.clearInterval(id));
  };
  const later = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    cleanups.push(() => window.clearTimeout(id));
  };

  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const motion = !reduce && 'IntersectionObserver' in window;
  if (motion) root.classList.add('js');

  const mesh = root.querySelector('.mesh');
  if (mesh) {
    let s = '';
    MESH_PAIRS.forEach((p, i) => {
      const [a, b] = p.split('-').map((n) => MESH_POINTS[Number(n)]);
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="--n:${i}"/>`;
    });
    MESH_POINTS.forEach((p, i) => {
      s += `<circle cx="${p[0]}" cy="${p[1]}" r="2.4" style="--n:${i}"/>`;
    });
    mesh.innerHTML = s;
  }

  const count = (el: HTMLElement, dur = 1300) => {
    const raw = el.dataset.v ?? el.textContent ?? '';
    el.dataset.v = raw;
    const m = raw.match(/^(\D*)(\d+)(.*)$/);
    if (!m || !motion) return;
    const to = Number(m[2]);
    const t0 = performance.now();
    const step = (t: number) => {
      let p = Math.min(1, (t - t0) / dur);
      p = 1 - Math.pow(1 - p, 3);
      el.textContent = m[1] + Math.round(to * p) + m[3];
      if (p < 1 && root.isConnected) requestAnimationFrame(step);
    };
    step(t0);
  };

  const play = (scope: ParentNode) => {
    if (!motion) return;
    $('.bars', scope).forEach((b) => {
      b.classList.remove('in');
      void b.offsetWidth;
      b.classList.add('in');
    });
    $('.bar b, .ring b', scope).forEach((x) => count(x));
    $<SVGCircleElement>('.arc', scope).forEach((c) => {
      c.dataset.to = c.dataset.to || c.getAttribute('stroke-dasharray') || '';
      c.style.transition = 'none';
      c.style.strokeDasharray = '0 164';
      c.getBoundingClientRect();
      c.style.transition = '';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        c.style.strokeDasharray = c.dataset.to ?? '';
      }));
    });
  };

  const chat = (panel: HTMLElement) => {
    const q = panel.querySelector('.bubble.q');
    const typing = panel.querySelector('.typing');
    const a = panel.querySelector('.bubble.a');
    later(() => q?.classList.add('show'), 400);
    later(() => typing?.classList.add('show'), 1000);
    later(() => {
      typing?.classList.remove('show');
      a?.classList.add('show');
    }, 2600);
  };

  // Phone cycles through judgment, face scan and daily reading.
  const slides = $('.screen .slide');
  const dots = $('.dots button');
  let cur = 0;
  let timer = 0;
  const show = (n: number) => {
    slides[cur].classList.remove('on');
    dots[cur].classList.remove('on');
    cur = n;
    slides[cur].classList.add('on');
    dots[cur].classList.add('on');
    play(slides[cur]);
  };
  const auto = () => {
    window.clearInterval(timer);
    if (motion) timer = window.setInterval(() => !document.hidden && show((cur + 1) % slides.length), 5200);
  };
  cleanups.push(() => window.clearInterval(timer));
  dots.forEach((d, i) => listen(d, 'click', () => { show(i); auto(); }));
  if (motion && slides.length) {
    later(() => play(slides[0]), 900);
    auto();
  }

  if (motion) {
    // Scroll reveal, staggered within each group.
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.classList.add('in');
        if (el.matches('.panel')) play(el);
        if (el.matches('.price-card')) $('[data-count]', el).forEach((x) => count(x, 1600));
        if (el.querySelector('.chat')) chat(el);
        const done = (ev: Event) => {
          if (ev.target !== el) return;
          el.classList.remove('rv');
          el.removeEventListener('transitionend', done);
        };
        el.addEventListener('transitionend', done);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    cleanups.push(() => io.disconnect());
    ['.head', '.rcard', '.split .copy', '.panel', '.step', '.price-card', '.cost', '.faq details', '.band .inner', '.langs span', '.listen-row'].forEach((sel) => {
      const seen = new Map<Node, number>();
      $(sel).forEach((el) => {
        const p = el.parentNode!;
        const i = seen.get(p) ?? 0;
        seen.set(p, i + 1);
        el.classList.add('rv');
        el.style.setProperty('--d', Math.min(i, 10) * (sel === '.langs span' ? 40 : 90) + 'ms');
        io.observe(el);
      });
    });

    // Endless feature strip.
    const strip = root.querySelector('.strip');
    const stripWrap = strip?.querySelector('.wrap');
    if (strip && stripWrap) {
      stripWrap.innerHTML += stripWrap.innerHTML;
      strip.classList.add('marq');
    }

    // Twinkling stars in the hero.
    const hero = root.querySelector<HTMLElement>('.hero');
    if (hero) {
      for (let i = 0; i < 14; i++) {
        const sp = document.createElement('span');
        const sz = 6 + Math.random() * 10;
        sp.className = 'spark';
        sp.innerHTML = '<svg viewBox="0 0 10 10"><path d="M5 0C5.3 3.6 6.4 4.7 10 5 6.4 5.3 5.3 6.4 5 10 4.7 6.4 3.6 5.3 0 5 3.6 4.7 4.7 3.6 5 0Z" fill="currentColor"/></svg>';
        sp.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${sz}px;height:${sz}px;animation-delay:${-Math.random() * 3}s;animation-duration:${2.5 + Math.random() * 3}s;color:${i % 3 ? '#F0567A' : '#A23AA8'}`;
        hero.appendChild(sp);
      }
    }

    // Languages light up one by one; the hero bubble follows along.
    const langs = $('.langs span');
    const cyc = root.querySelector('.cyc');
    let li = 0;
    every(() => {
      if (document.hidden || !langs.length) return;
      langs[li].classList.remove('hl');
      li = (li + 1) % langs.length;
      langs[li].classList.add('hl');
      if (cyc) cyc.textContent = langs[li].textContent;
    }, 1400);

    if (window.matchMedia('(hover:hover)').matches) {
      // Tilt + spotlight on reading cards, gentle parallax on the phone.
      $('.rcard').forEach((c) => {
        listen(c, 'pointermove', (ev) => {
          const e = ev as PointerEvent;
          const r = c.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          c.style.setProperty('--mx', x * 100 + '%');
          c.style.setProperty('--my', y * 100 + '%');
          if (!c.classList.contains('rv')) {
            c.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
          }
        });
        listen(c, 'pointerleave', () => { c.style.transform = ''; });
      });
      const col = root.querySelector<HTMLElement>('.phone-col');
      if (hero && col) {
        listen(hero, 'pointermove', (ev) => {
          const e = ev as PointerEvent;
          const x = e.clientX / window.innerWidth - 0.5;
          const y = e.clientY / window.innerHeight - 0.5;
          col.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 6}deg)`;
        });
        listen(hero, 'pointerleave', () => { col.style.transform = ''; });
      }
    }
  }

  // Mobile menu.
  const header = root.querySelector<HTMLElement>('header.nav');
  const menuBtn = root.querySelector<HTMLButtonElement>('.menu-btn');
  const setMenu = (open: boolean) => {
    header?.classList.toggle('open', open);
    menuBtn?.setAttribute('aria-expanded', String(open));
    menuBtn?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  if (menuBtn) listen(menuBtn, 'click', () => setMenu(!header?.classList.contains('open')));
  $('.mnav a').forEach((a) => listen(a, 'click', () => setMenu(false)));
  listen(window, 'keydown', (e) => { if ((e as KeyboardEvent).key === 'Escape') setMenu(false); });

  // Reading-progress bar and nav shadow.
  const bar = root.querySelector<HTMLElement>('.progress');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const se = document.scrollingElement ?? document.documentElement;
    const max = se.scrollHeight - se.clientHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? se.scrollTop / max : 0})`;
    header?.classList.toggle('scrolled', se.scrollTop > 8);
  };
  listen(window, 'scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  return () => cleanups.forEach((fn) => fn());
}

export default function LandingPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    createIcons({ icons: ICONS, root });
    const html = document.documentElement;
    const prevScroll = html.style.scrollBehavior;
    html.style.scrollBehavior = 'smooth';
    const cleanup = initLanding(root);
    return () => {
      cleanup();
      html.style.scrollBehavior = prevScroll;
    };
  }, []);

  return <div ref={ref} className="landing" dangerouslySetInnerHTML={{ __html: markup }} />;
}
