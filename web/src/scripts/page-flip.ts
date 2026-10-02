import { PageFlip } from 'page-flip/dist/js/page-flip.module.js';
import '../styles/stPageFlip.css';

type PageFlipInstance = {
  flipNext: (corner?: string) => void;
  flipPrev: (corner?: string) => void;
  flip: (pageNum: number, corner?: string) => void;
  getCurrentPageIndex: () => number;
  getPageCount: () => number;
  destroy: () => void;
  loadFromHTML: (items: NodeListOf<Element> | HTMLElement[]) => void;
  on: (event: string, cb: (e: { data: number }) => void) => void;
};

type PageFlipCtor = new (
  el: HTMLElement,
  settings: Record<string, unknown>,
) => PageFlipInstance;

const PageFlipClass = PageFlip as unknown as PageFlipCtor;

/** Quase tela cheia: deixa folga só pro chrome fino + controles. */
function bookSize(): { width: number; height: number } {
  const chromeY = 108; // header slim + controles
  const padX = 24;
  const maxH = Math.max(420, window.innerHeight - chromeY);
  const maxW = Math.max(280, window.innerWidth - padX);
  // Retrato de gibi moderno (~2:3), limitado pela viewport
  let height = maxH;
  let width = Math.floor(height / 1.42);
  if (width > maxW) {
    width = maxW;
    height = Math.floor(width * 1.42);
  }
  return { width, height };
}

function updateIndicator(root: HTMLElement, current: number, total: number) {
  const cur = root.querySelector<HTMLElement>('[data-page-current]');
  const tot = root.querySelector<HTMLElement>('[data-page-total]');
  if (cur) cur.textContent = String(current);
  if (tot) tot.textContent = String(total);

  const prev = root.querySelector<HTMLButtonElement>('[data-action="prev"]');
  const next = root.querySelector<HTMLButtonElement>('[data-action="next"]');
  if (prev) prev.disabled = current <= 1;
  if (next) next.disabled = current >= total;
}

function sumarioIndex(root: HTMLElement): number {
  const raw = root.dataset.sumarioPage;
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) ? n : 1;
}

export function initLeitor(): void {
  const root = document.querySelector<HTMLElement>('[data-leitor]');
  if (!root) return;

  const bookEl = root.querySelector<HTMLElement>('[data-hq-book]');
  if (!bookEl) return;

  const marcador = root.querySelector<HTMLElement>('[data-marcador]');
  const aba = root.querySelector<HTMLButtonElement>('[data-action="toggle-marcador"]');

  const pagesHtml = Array.from(bookEl.querySelectorAll(':scope > .page')).map(
    (el) => el.outerHTML,
  );

  let pageFlip: PageFlipInstance | null = null;
  let mode: 'flip' | 'scroll' = 'flip';
  let currentPage = 0;

  const restorePages = () => {
    bookEl.innerHTML = pagesHtml.join('');
  };

  const createFlip = () => {
    pageFlip?.destroy();
    restorePages();

    const { width, height } = bookSize();
    pageFlip = new PageFlipClass(bookEl, {
      width,
      height,
      size: 'stretch',
      minWidth: 260,
      maxWidth: width,
      minHeight: 360,
      maxHeight: height,
      showCover: true,
      mobileScrollSupport: false,
      usePortrait: true,
      drawShadow: true,
      flippingTime: 650,
      maxShadowOpacity: 0.55,
      startZIndex: 0,
      autoSize: true,
      startPage: currentPage,
    });

    const pages = bookEl.querySelectorAll(':scope > .page');
    pageFlip.loadFromHTML(pages);

    pageFlip.on('flip', (e) => {
      currentPage = e.data;
      updateIndicator(root, currentPage + 1, pageFlip?.getPageCount() ?? 1);
    });

    currentPage = pageFlip.getCurrentPageIndex();
    updateIndicator(root, currentPage + 1, pageFlip.getPageCount());
  };

  const goToPage = (index: number) => {
    if (mode === 'flip') {
      pageFlip?.flip(index, 'bottom');
      return;
    }
    const ids = ['scroll-capa', 'scroll-sumario'];
    const el =
      document.getElementById(ids[index] ?? '') ??
      document.querySelectorAll('.scroll-page')[index];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const setMode = (next: 'flip' | 'scroll') => {
    mode = next;
    root.dataset.mode = next;
    const toggle = root.querySelector<HTMLButtonElement>('[data-action="toggle-mode"]');
    if (toggle) {
      const isScroll = next === 'scroll';
      toggle.setAttribute('aria-pressed', String(isScroll));
      toggle.textContent = isScroll ? 'Folhear' : 'Rolagem';
    }
    if (next === 'flip') {
      requestAnimationFrame(() => createFlip());
    } else {
      pageFlip?.destroy();
      pageFlip = null;
      restorePages();
      updateIndicator(root, 1, pagesHtml.length);
    }
  };

  const setMarcadorOpen = (open: boolean) => {
    marcador?.classList.toggle('is-open', open);
    aba?.setAttribute('aria-expanded', String(open));
  };

  createFlip();

  marcador?.addEventListener('mouseenter', () => setMarcadorOpen(true));
  marcador?.addEventListener('mouseleave', () => {
    if (!marcador.classList.contains('is-pinned')) setMarcadorOpen(false);
  });

  root.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-action], [data-goto-page]',
    );
    if (!target) return;

    if (target.dataset.action === 'toggle-marcador') {
      const willPin = !marcador?.classList.contains('is-pinned');
      marcador?.classList.toggle('is-pinned', willPin);
      setMarcadorOpen(willPin);
      return;
    }

    if (target.dataset.action === 'prev') {
      if (mode === 'flip') pageFlip?.flipPrev('bottom');
      return;
    }
    if (target.dataset.action === 'next') {
      if (mode === 'flip') pageFlip?.flipNext('bottom');
      return;
    }
    if (target.dataset.action === 'toggle-mode') {
      setMode(mode === 'flip' ? 'scroll' : 'flip');
      return;
    }
    if (target.dataset.action === 'goto-sumario') {
      goToPage(sumarioIndex(root));
      setMarcadorOpen(false);
      marcador?.classList.remove('is-pinned');
      return;
    }
    if (target.dataset.gotoPage !== undefined) {
      const index = Number(target.dataset.gotoPage);
      if (Number.isNaN(index)) return;
      goToPage(index);
      setMarcadorOpen(false);
      marcador?.classList.remove('is-pinned');
      event.preventDefault();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMarcadorOpen(false);
      marcador?.classList.remove('is-pinned');
    }
    if (mode !== 'flip') return;
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      pageFlip?.flipNext('bottom');
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      pageFlip?.flipPrev('bottom');
    }
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (mode === 'flip') createFlip();
    }, 200);
  });
}
