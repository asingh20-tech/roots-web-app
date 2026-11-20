// jsdom lacks the media-query subscription used by next-themes.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (media: string) => ({
      media, matches: false,
      addListener() {}, removeListener() {},
      addEventListener() {}, removeEventListener() {},
    }),
  });
}
