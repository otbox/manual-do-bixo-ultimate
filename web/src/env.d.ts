declare module 'page-flip/dist/js/page-flip.module.js' {
  export class PageFlip {
    constructor(el: HTMLElement, settings: Record<string, unknown>);
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    flip(pageNum: number, corner?: string): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    destroy(): void;
    loadFromHTML(items: NodeListOf<Element> | HTMLElement[]): void;
    on(event: string, cb: (e: { data: number }) => void): void;
  }
}
