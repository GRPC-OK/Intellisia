export {};

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'sarif-viewer': {
        src: string;
        class?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
