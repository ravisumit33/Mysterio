import { useEffect } from 'react';
import AwesomeDebouncePromise from 'awesome-debounce-promise';

const useFullScreenChatWindow = () => {
  useEffect(() => {
    const rootElement = document.querySelector('#root');
    /*
     * Fix root element to viewport so that chatWindow is removed from the document flow and fixed. It fixes issues such as unwanted scroll.
     * https://stackoverflow.com/a/68359419/6842304
     * We cannot use viewport units like dvh. It makes the chatWindow full screen but user can still scroll down since layout viewport is not resized.
     */
    // @ts-ignore
    rootElement.style.position = 'fixed';
    // @ts-ignore
    rootElement.style.inset = 0;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const originalMetaViewportContent = document
      .querySelector('meta[name=viewport]')
      .getAttribute('content');
    if (!isSafari) {
      /*
       * Resizes all viewports to avoid cases like scroll on soft keyboard
       * https://developer.chrome.com/blog/viewport-resize-behavior
       */
      document
        .querySelector('meta[name="viewport"]')
        .setAttribute(
          'content',
          `${originalMetaViewportContent}, interactive-widget=resizes-content`,
        );
    }

    const scrollToTop = () => window.scrollTo(0, 0);
    const handleResize = () => {
      if (isSafari) {
        /*
         * Safari doesn't support interactive-widget
         * So, we need to manually resize root element and scroll to top but it still let user scroll down the chat window since layout viewport is not resized
         */
        // @ts-ignore
        rootElement.style.height = `${window.visualViewport.height}px`;
        scrollToTop();
      }
    };
    const handleTouchEnd = () => {
      if (isSafari) {
        /*
         * Since safari doesn't support interactive-widget, we need to manually scroll to top when the touch end
         */
        if (window.scrollY > 0) {
          scrollToTop();
        }
      }
    };
    const debouncedHandleTouchEnd = AwesomeDebouncePromise(handleTouchEnd, 50);
    window.addEventListener('touchend', debouncedHandleTouchEnd);
    window.visualViewport.addEventListener('resize', handleResize);
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.removeEventListener('touchend', debouncedHandleTouchEnd);
      // @ts-ignore
      rootElement.style.position = '';
      // @ts-ignore
      rootElement.style.inset = '';
      if (!isSafari) {
        document
          .querySelector('meta[name="viewport"]')
          .setAttribute('content', originalMetaViewportContent);
      } else {
        // @ts-ignore
        rootElement.style.height = '';
      }
    };
  }, []);
};

export default useFullScreenChatWindow;
