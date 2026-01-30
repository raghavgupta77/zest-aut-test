/**
 * Auto-focus Utilities
 * React replacements for Angular jQuery focus management
 */

/**
 * Focus on element by ID with delay
 * Replacement for: setTimeout(fn => { $('#otp_number').focus(); }, 500);
 */
export function focusElementById(elementId: string, delay: number = 500): void {
  setTimeout(() => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
    }
  }, delay);
}

/**
 * Focus on element by ref
 */
export function focusElement(element: HTMLElement | null, delay: number = 500): void {
  if (!element) return;
  setTimeout(() => {
    element.focus();
  }, delay);
}

/**
 * Scroll to top
 * Replacement for: $('html, body').animate({ scrollTop: 0 }, 0);
 */
export function scrollToTop(): void {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'auto'
  });
}
