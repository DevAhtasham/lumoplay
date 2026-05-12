import type { Plugin } from '../../types/plugins';
import type { PluginManager } from '../../types/plugins';
import { EventEmitter } from '../../events/emitter';

export class PluginSystem implements PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin "${plugin.name}" is already registered`);
      return;
    }

    this.plugins.set(plugin.name, plugin);
    this.emitter.emit('plugin:init', { pluginName: plugin.name });
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      console.warn(`Plugin "${pluginName}" not found`);
      return;
    }

    plugin.destroy();
    this.plugins.delete(pluginName);
    this.emitter.emit('plugin:destroy', { pluginName });
  }

  get(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  has(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  destroyAll(): void {
    this.plugins.forEach((plugin, name) => {
      plugin.destroy();
      this.emitter.emit('plugin:destroy', { pluginName: name });
    });
    this.plugins.clear();
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}
