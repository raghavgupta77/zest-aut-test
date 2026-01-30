/**
 * Footer Service
 * React replacement for Angular FooterService
 */

type FooterListener = (footer: Footer) => void;

export class Footer {
  public showFooter: boolean;

  constructor(showFooter: boolean) {
    this.showFooter = showFooter;
  }
}

class FooterServiceClass {
  private listeners: FooterListener[] = [];
  private currentFooter: Footer = new Footer(false);

  subscribe(listener: FooterListener): () => void {
    this.listeners.push(listener);
    listener(this.currentFooter);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  next(footer: Footer): void {
    this.currentFooter = footer;
    this.listeners.forEach(listener => listener(footer));
  }
}

export const FooterService = new FooterServiceClass();
