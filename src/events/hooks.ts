import type { Plugin } from '../types/plugins';

export class EventHooks {
  private hooks: Map<string, Function[]> = new Map();

  register(event: string, callback: Function): void {
    if (!this.hooks.has(event)) {
      this.hooks.set(event, []);
    }
    this.hooks.get(event)!.push(callback);
  }

  unregister(event: string, callback: Function): void {
    if (!this.hooks.has(event)) return;

    const callbacks = this.hooks.get(event)!;
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.hooks.delete(event);
    }
  }

  execute(event: string, data?: any): void {
    if (!this.hooks.has(event)) return;

    const callbacks = this.hooks.get(event)!;
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in hook for "${event}":`, error);
      }
    });
  }

  registerPluginHooks(plugin: Plugin): void {
    if (plugin.onPlay) this.register('play', plugin.onPlay);
    if (plugin.onPause) this.register('pause', plugin.onPause);
    if (plugin.onSeek) this.register('seek', plugin.onSeek);
    if (plugin.onTimeUpdate) this.register('timeupdate', plugin.onTimeUpdate);
    if (plugin.onVolumeChange) this.register('volumechange', plugin.onVolumeChange);
    if (plugin.onMute) this.register('mute', plugin.onMute);
    if (plugin.onUnmute) this.register('unmute', plugin.onUnmute);
    if (plugin.onFullscreen) this.register('fullscreen', plugin.onFullscreen);
    if (plugin.onExitFullscreen) this.register('exitfullscreen', plugin.onExitFullscreen);
    if (plugin.onPiP) this.register('pip', plugin.onPiP);
    if (plugin.onExitPiP) this.register('exitpip', plugin.onExitPiP);
  }

  unregisterPluginHooks(plugin: Plugin): void {
    if (plugin.onPlay) this.unregister('play', plugin.onPlay);
    if (plugin.onPause) this.unregister('pause', plugin.onPause);
    if (plugin.onSeek) this.unregister('seek', plugin.onSeek);
    if (plugin.onTimeUpdate) this.unregister('timeupdate', plugin.onTimeUpdate);
    if (plugin.onVolumeChange) this.unregister('volumechange', plugin.onVolumeChange);
    if (plugin.onMute) this.unregister('mute', plugin.onMute);
    if (plugin.onUnmute) this.unregister('unmute', plugin.onUnmute);
    if (plugin.onFullscreen) this.unregister('fullscreen', plugin.onFullscreen);
    if (plugin.onExitFullscreen) this.unregister('exitfullscreen', plugin.onExitFullscreen);
    if (plugin.onPiP) this.unregister('pip', plugin.onPiP);
    if (plugin.onExitPiP) this.unregister('exitpip', plugin.onExitPiP);
  }
}
