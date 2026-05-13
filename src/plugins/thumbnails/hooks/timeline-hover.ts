import type { TimelineHoverEvent, ThumbnailEventMap } from '../types/thumbnails';
import { ThumbnailCalculations } from '../utils/calculations';

export class TimelineHoverHooks {
  private progressElement: HTMLElement;
  private containerElement: HTMLElement;
  private duration: number = 0;
  private isEnabled: boolean = false;
  private eventListeners: Map<string, EventListener> = new Map();
  private throttledMouseMove: (e: MouseEvent) => void;

  constructor(
    progressElement: HTMLElement,
    containerElement: HTMLElement,
    onTimelineHover?: (event: TimelineHoverEvent) => void
  ) {
    this.progressElement = progressElement;
    this.containerElement = containerElement;
    
    // Create throttled mouse move handler
    this.throttledMouseMove = ThumbnailCalculations.throttle(
      this.handleMouseMove.bind(this),
      16 // ~60fps
    );

    if (onTimelineHover) {
      this.addEventListener('timelineHover', onTimelineHover);
    }
  }

  /**
   * Enable timeline hover tracking
   */
  enable(duration: number): void {
    this.duration = duration;
    this.isEnabled = true;
    this.attachEventListeners();
  }

  /**
   * Disable timeline hover tracking
   */
  disable(): void {
    this.isEnabled = false;
    this.detachEventListeners();
  }

  /**
   * Update duration when video duration changes
   */
  setDuration(duration: number): void {
    this.duration = duration;
  }

  /**
   * Add event listener for custom events
   */
  addEventListener<K extends keyof ThumbnailEventMap>(
    event: K,
    listener: (data: ThumbnailEventMap[K]) => void
  ): void {
    const key = `custom_${event}`;
    const wrappedListener = (e: Event) => {
      const customEvent = e as CustomEvent<ThumbnailEventMap[K]>;
      listener(customEvent.detail);
    };
    
    // Store the wrapped listener for later removal
    this.eventListeners.set(key, wrappedListener);
    this.progressElement.addEventListener(event, wrappedListener);
  }

  /**
   * Remove event listener
   */
  removeEventListener<K extends keyof ThumbnailEventMap>(
    event: K
  ): void {
    const key = `custom_${event}`;
    const wrappedListener = this.eventListeners.get(key);
    
    if (wrappedListener) {
      this.progressElement.removeEventListener(event, wrappedListener);
      this.eventListeners.delete(key);
    }
  }

  /**
   * Attach DOM event listeners
   */
  private attachEventListeners(): void {
    if (!this.isEnabled) return;

    // Mouse move for hover tracking
    this.progressElement.addEventListener('mousemove', this.throttledMouseMove);
    
    // Mouse leave to hide preview
    const mouseLeaveHandler = () => this.handleMouseLeave();
    this.progressElement.addEventListener('mouseleave', mouseLeaveHandler);
    this.eventListeners.set('mouseleave', mouseLeaveHandler);
    
    // Mouse enter to show preview
    const mouseEnterHandler = () => this.handleMouseEnter();
    this.progressElement.addEventListener('mouseenter', mouseEnterHandler);
    this.eventListeners.set('mouseenter', mouseEnterHandler);
  }

  /**
   * Detach DOM event listeners
   */
  private detachEventListeners(): void {
    this.eventListeners.forEach((listener, event) => {
      if (event === 'mousemove') {
        this.progressElement.removeEventListener('mousemove', listener);
      } else {
        this.progressElement.removeEventListener(event, listener);
      }
    });
    this.eventListeners.clear();
  }

  /**
   * Handle mouse move events
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isEnabled || this.duration <= 0) return;

    const progressRect = this.progressElement.getBoundingClientRect();
    
    // Calculate time from mouse position
    const time = ThumbnailCalculations.positionToTime(
      e.clientX,
      progressRect,
      this.duration
    );

    // Calculate relative position (0-1)
    const position = ThumbnailCalculations.timeToPercentage(time, this.duration);

    // Create timeline hover event
    const event: TimelineHoverEvent = {
      time,
      position,
      x: e.clientX,
      y: e.clientY
    };

    // Dispatch custom event
    this.dispatchEvent('timelineHover', event);
  }

  /**
   * Handle mouse leave events
   */
  private handleMouseLeave(): void {
    if (!this.isEnabled) return;

    // Dispatch event to hide preview
    this.dispatchEvent('thumbnailDisplay', {
      thumbnail: null,
      position: { x: 0, y: 0 },
      visible: false
    });
  }

  /**
   * Handle mouse enter events
   */
  private handleMouseEnter(): void {
    if (!this.isEnabled) return;

    // Could be used to preload thumbnails or show initial state
    this.dispatchEvent('thumbnailRequest', { time: 0 });
  }

  /**
   * Dispatch custom event
   */
  private dispatchEvent<K extends keyof ThumbnailEventMap>(
    event: K,
    data: ThumbnailEventMap[K]
  ): void {
    const customEvent = new CustomEvent(event, { detail: data });
    this.progressElement.dispatchEvent(customEvent);
  }

  /**
   * Get current hover state
   */
  isHovering(): boolean {
    return this.progressElement.matches(':hover');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disable();
    this.eventListeners.clear();
  }
}
