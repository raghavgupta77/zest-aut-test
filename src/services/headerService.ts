/**
 * Header Service
 * React replacement for Angular HeaderService
 * Uses event emitter pattern instead of RxJS Subject
 */

type HeaderListener = (header: Header) => void;

export class Header {
  public showHeader: boolean;
  public showBackButton: boolean;

  constructor(showHeader: boolean, showBackButton: boolean) {
    this.showHeader = showHeader;
    this.showBackButton = showBackButton;
  }
}

class HeaderServiceClass {
  private listeners: HeaderListener[] = [];
  private currentHeader: Header = new Header(false, false);

  /**
   * Subscribe to header changes
   */
  subscribe(listener: HeaderListener): () => void {
    this.listeners.push(listener);
    // Immediately call with current value
    listener(this.currentHeader);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Emit new header state
   */
  next(header: Header): void {
    this.currentHeader = header;
    this.listeners.forEach(listener => listener(header));
  }
}

export const HeaderService = new HeaderServiceClass();
