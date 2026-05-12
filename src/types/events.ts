export type PlayerEventType =
  | 'play'
  | 'pause'
  | 'ended'
  | 'seek'
  | 'timeupdate'
  | 'progress'
  | 'volumechange'
  | 'mute'
  | 'unmute'
  | 'fullscreen'
  | 'exitfullscreen'
  | 'pip'
  | 'exitpip'
  | 'theatrical'
  | 'exittheatrical'
  | 'error'
  | 'loadstart'
  | 'canplay'
  | 'waiting'
  | 'plugin:init'
  | 'plugin:destroy';

export interface EventCallback {
  (data?: any): void;
}

export interface EventMap {
  play: void;
  pause: void;
  ended: void;
  seek: { time: number };
  timeupdate: { time: number };
  progress: { percent: number };
  volumechange: { volume: number };
  mute: void;
  unmute: void;
  fullscreen: void;
  exitfullscreen: void;
  pip: void;
  exitpip: void;
  theatrical: void;
  exittheatrical: void;
  error: { error: Error };
  loadstart: void;
  canplay: void;
  waiting: void;
  'plugin:init': { pluginName: string };
  'plugin:destroy': { pluginName: string };
}
