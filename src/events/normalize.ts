export function normalizeVideoEvent(event: Event, _videoElement: HTMLVideoElement): string {
  const eventType = event.type;

  switch (eventType) {
    case 'play':
      return 'play';
    case 'pause':
      return 'pause';
    case 'ended':
      return 'ended';
    case 'seeking':
    case 'seeked':
      return 'seek';
    case 'timeupdate':
      return 'timeupdate';
    case 'progress':
      return 'progress';
    case 'volumechange':
      return 'volumechange';
    case 'waiting':
      return 'waiting';
    case 'canplay':
      return 'canplay';
    case 'loadstart':
      return 'loadstart';
    case 'error':
      return 'error';
    default:
      return eventType;
  }
}

export function getEventData(event: string, videoElement: HTMLVideoElement): any {
  switch (event) {
    case 'seek':
      return { time: videoElement.currentTime };
    case 'timeupdate':
      return { time: videoElement.currentTime };
    case 'progress':
      const buffered = videoElement.buffered;
      const bufferedPercent = buffered.length > 0
        ? (buffered.end(buffered.length - 1) / videoElement.duration) * 100
        : 0;
      return { percent: bufferedPercent };
    case 'volumechange':
      return { volume: videoElement.volume };
    case 'error':
      return { error: videoElement.error };
    default:
      return undefined;
  }
}
