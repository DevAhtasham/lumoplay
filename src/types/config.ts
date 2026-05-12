export interface Config {
  autoHideDelay: number;
  seekStep: number;
  volumeStep: number;
  persistVolume: boolean;
  persistPosition: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export const DEFAULT_CONFIG: Config = {
  autoHideDelay: 3000,
  seekStep: 5,
  volumeStep: 0.1,
  persistVolume: true,
  persistPosition: true,
  theme: 'auto',
};
