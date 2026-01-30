/**
 * Loader Service
 * React replacement for Angular LoaderService
 */

type LoaderListener = (loader: Loader) => void;

export class Loader {
  public showLoader: boolean;
  public loaderTextMessage: string;

  constructor(showLoader: boolean, loaderTextMessage: string = '') {
    this.showLoader = showLoader;
    this.loaderTextMessage = loaderTextMessage;
  }
}

class LoaderServiceClass {
  private listeners: LoaderListener[] = [];
  private currentLoader: Loader = new Loader(false);

  subscribe(listener: LoaderListener): () => void {
    this.listeners.push(listener);
    listener(this.currentLoader);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  next(loader: { showLoader: boolean; loaderTextMessage?: string }): void {
    this.currentLoader = new Loader(loader.showLoader, loader.loaderTextMessage || '');
    this.listeners.forEach(listener => listener(this.currentLoader));
  }
}

export const LoaderService = new LoaderServiceClass();

// Export type for use in other components
export type LoaderServiceType = LoaderServiceClass;
