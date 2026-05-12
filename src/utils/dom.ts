export function createElement<T extends HTMLElement>(
  tag: string,
  classes: string[] = [],
  attributes: Record<string, string> = {}
): T {
  const element = document.createElement(tag) as T;
  
  classes.forEach((className) => {
    element.classList.add(className);
  });
  
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  
  return element;
}

export function removeElement(element: HTMLElement): void {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

export function insertAfter(newElement: HTMLElement, referenceElement: HTMLElement): void {
  if (referenceElement && referenceElement.parentNode) {
    referenceElement.parentNode.insertBefore(newElement, referenceElement.nextSibling);
  }
}

export function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}

export function requestFullscreen(element: HTMLElement): Promise<void> {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if ((element as any).webkitRequestFullscreen) {
    return (element as any).webkitRequestFullscreen();
  } else if ((element as any).mozRequestFullScreen) {
    return (element as any).mozRequestFullScreen();
  } else if ((element as any).msRequestFullscreen) {
    return (element as any).msRequestFullscreen();
  }
  return Promise.reject(new Error('Fullscreen not supported'));
}

export function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    return (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  }
  return Promise.reject(new Error('Fullscreen not supported'));
}

export function supportsPiP(): boolean {
  return !!(
    document.pictureInPictureElement ||
    (HTMLVideoElement.prototype as any).requestPictureInPicture
  );
}

export function isPiP(): boolean {
  return !!document.pictureInPictureElement;
}
