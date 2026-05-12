import type { ThemeConfig } from '../types/player';

export class ThemeManager {
  private container: HTMLElement;
  private currentTheme: 'light' | 'dark' | 'auto' | 'custom' = 'auto';

  constructor(container: HTMLElement) {
    this.container = container;
    this.applyTheme('auto');
  }

  applyTheme(theme: 'light' | 'dark' | 'auto' | 'custom', customConfig?: ThemeConfig): void {
    this.currentTheme = theme;

    // Remove existing theme attributes
    this.container.removeAttribute('data-theme');

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.container.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      this.container.setAttribute('data-theme', theme);
    }

    // Apply custom theme configuration if provided
    if (customConfig && theme === 'custom') {
      this.applyCustomTheme(customConfig);
    }
  }

  private applyCustomTheme(config: ThemeConfig): void {
    const root = this.container;

    if (config.primary) {
      root.style.setProperty('--custom-primary', config.primary);
    }
    if (config.secondary) {
      root.style.setProperty('--custom-secondary', config.secondary);
    }
    if (config.background) {
      root.style.setProperty('--custom-background', config.background);
    }
    if (config.text) {
      root.style.setProperty('--custom-text', config.text);
    }
  }

  getCurrentTheme(): 'light' | 'dark' | 'auto' | 'custom' {
    return this.currentTheme;
  }

  destroy(): void {
    this.container.removeAttribute('data-theme');
    // Clear custom theme variables
    const root = this.container;
    root.style.removeProperty('--custom-primary');
    root.style.removeProperty('--custom-secondary');
    root.style.removeProperty('--custom-background');
    root.style.removeProperty('--custom-text');
  }
}
