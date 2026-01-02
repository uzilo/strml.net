declare module '*.txt?raw' {
  const content: string;
  export default content;
}

declare module '*.html?raw' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}

declare module 'markdown' {
  export const markdown: {
    toHTML: (text: string) => string;
  };
}

declare module 'mouse-wheel' {
  function mouseWheel(
    element: HTMLElement,
    callback: (dx: number, dy: number) => void,
    noPreventDefault?: boolean
  ): () => void;
  export default mouseWheel;
}

declare module 'classlist-polyfill' {}
