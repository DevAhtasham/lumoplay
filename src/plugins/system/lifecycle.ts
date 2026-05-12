import type { Plugin } from '../../types/plugins';
import { EventHooks } from '../../events/hooks';

export class PluginLifecycle {
  private eventHooks: EventHooks;
  private plugins: Map<string, Plugin> = new Map();

  constructor(eventHooks: EventHooks) {
    this.eventHooks = eventHooks;
  }

  async initPlugin(plugin: Plugin): Promise<void> {
    await plugin.init(this.createPluginAPI(plugin));
    this.eventHooks.registerPluginHooks(plugin);
    this.plugins.set(plugin.name, plugin);
  }

  async destroyPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) return;

    this.eventHooks.unregisterPluginHooks(plugin);
    await plugin.destroy();
    this.plugins.delete(pluginName);
  }

  destroyAll(): Promise<void> {
    const promises = Array.from(this.plugins.entries()).map(
      ([name]) => this.destroyPlugin(name)
    );
    return Promise.all(promises).then(() => {});
  }

  private createPluginAPI(plugin: Plugin): any {
    return {
      name: plugin.name,
      version: plugin.version,
    };
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  hasPlugin(name: string): boolean {
    return this.plugins.has(name);
  }
}
