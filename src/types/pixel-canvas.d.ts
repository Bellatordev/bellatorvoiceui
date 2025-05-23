
declare namespace JSX {
  interface IntrinsicElements {
    'pixel-canvas': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'data-gap'?: number;
      'data-speed'?: number;
      'data-colors'?: string;
      'data-variant'?: "default" | "icon";
      'data-no-focus'?: boolean | string;
    }, HTMLElement>;
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'agent-id': string;
      'style'?: React.CSSProperties;
    }, HTMLElement>;
  }
}
