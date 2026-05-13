import { EventEmitter } from '../events/emitter';
import { normalizeVideoEvent, getEventData } from '../events/normalize';

export class VideoWrapper {
  private videoElement: HTMLVideoElement;
  private emitter: EventEmitter;
  private eventListeners: Map<string, EventListener> = new Map();

  constructor(videoElement: HTMLVideoElement, emitter: EventEmitter) {
    this.videoElement = videoElement;
    this.emitter = emitter;
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const events = [
      'play',
      'pause',
      'ended',
      'seeking',
      'seeked',
      'timeupdate',
      'progress',
      'volumechange',
      'waiting',
      'canplay',
      'loadstart',
      'error',
    ];

    events.forEach((event) => {
      const listener = (e: Event) => this.handleVideoEvent(e);
      this.videoElement.addEventListener(event, listener);
      this.eventListeners.set(event, listener);
    });
  }

  private handleVideoEvent(event: Event): void {
    const normalizedEvent = normalizeVideoEvent(event, this.videoElement);
    const data = getEventData(normalizedEvent, this.videoElement);
    this.emitter.emit(normalizedEvent, data);
  }

  get element(): HTMLVideoElement {
    return this.videoElement;
  }

  play(): Promise<void> {
    return this.videoElement.play();
  }

  pause(): void {
    this.videoElement.pause();
  }

  seek(time: number): void {
    this.videoElement.currentTime = time;
  }

  setVolume(volume: number): void {
    this.videoElement.volume = Math.max(0, Math.min(1, volume));
  }

  getVolume(): number {
    return this.videoElement.volume;
  }

  mute(): void {
    this.videoElement.muted = true;
  }

  unmute(): void {
    this.videoElement.muted = false;
  }

  isMuted(): boolean {
    return this.videoElement.muted;
  }

  setSpeed(speed: number): void {
    this.videoElement.playbackRate = speed;
  }

  getSpeed(): number {
    return this.videoElement.playbackRate;
  }

  getCurrentTime(): number {
    return this.videoElement.currentTime;
  }

  getDuration(): number {
    return this.videoElement.duration;
  }

  getBuffered(): TimeRanges {
    return this.videoElement.buffered;
  }

  setSource(src: string): void {
    this.videoElement.src = src;
  }

  getPoster(): string {
    return this.videoElement.poster;
  }

  setPoster(poster: string): void {
    this.videoElement.poster = poster;
  }

  getAudioTracks(): any[] {
    const videoElement = this.videoElement as any;
    if (videoElement.audioTracks) {
      return Array.from(videoElement.audioTracks).map((track: any) => ({
        id: track.id,
        label: track.label,
        language: track.language,
        enabled: track.enabled,
        kind: track.kind,
      }));
    }
    return [];
  }

  setAudioTrack(trackId: string): void {
    const videoElement = this.videoElement as any;
    if (videoElement.audioTracks) {
      for (let i = 0; i < videoElement.audioTracks.length; i++) {
        const track = videoElement.audioTracks[i];
        track.enabled = (track.id === trackId);
      }
    }
  }

  destroy(): void {
    this.eventListeners.forEach((listener, event) => {
      this.videoElement.removeEventListener(event, listener);
    });
    this.eventListeners.clear();
  }
}
