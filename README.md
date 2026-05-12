# LumoPlay

Lightweight, plugin-based modern web video player with advanced UX and full customization for developers.

## Features

- **Lightweight Core**: Minimal bundle size (< 20KB gzipped)
- **Plugin Architecture**: Extensible via plugins
- **Modern UI**: Clean, minimal design with smooth animations
- **Framework Agnostic**: Works with any framework or vanilla JS
- **TypeScript**: Full type safety and excellent developer experience
- **Mobile First**: Responsive design with touch gestures
- **Accessibility**: Keyboard navigation and screen reader support
- **Theme System**: Light, dark, auto, and custom themes
- **State Persistence**: Saves volume and playback position

## Installation

```bash
npm install lumoplay
```

## Quick Start

```html
<div id="player"></div>

<script type="module">
  import { LumoPlayer } from 'lumoplay';

  const player = new LumoPlayer('#player', {
    src: 'your-video.mp4',
    autoplay: false,
    theme: 'dark',
  });
</script>
```

## API

### Basic Controls

```javascript
player.play();
player.pause();
player.seek(10); // Seek to 10 seconds
player.setVolume(0.5);
player.setSpeed(1.5);
player.toggleFullscreen();
```

### Events

```javascript
player.on('play', () => console.log('Playing'));
player.on('pause', () => console.log('Paused'));
player.on('timeupdate', ({ time }) => console.log('Time:', time));
player.on('ended', () => console.log('Ended'));
```

### Plugin System

```javascript
player.use(MyPlugin, { option: 'value' });
player.unuse('MyPlugin');
```

## Options

```javascript
const player = new LumoPlayer('#player', {
  src: 'video.mp4',
  poster: 'poster.jpg',
  autoplay: false,
  muted: false,
  controls: true,
  theme: 'dark', // 'light' | 'dark' | 'auto'
  autoHideDelay: 3000,
  persistVolume: true,
  persistPosition: true,
});
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development
npm run dev

# Test
npm test
```

## License

MIT

## Roadmap

- [ ] HLS/DASH support plugin
- [ ] Subtitle plugin
- [ ] Analytics plugin
- [ ] Quality selector
- [ ] Picture-in-Picture
- [ ] Mobile gestures
- [ ] Framework wrappers (React, Vue, Svelte)
