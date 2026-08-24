// Ambient declarations for packages whose type exports are not resolved by
// TypeScript's "bundler" moduleResolution (private-registry builds or missing
// exports.types field in package.json).

declare module 'jspdf' {
  export class jsPDF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: Record<string, any>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
  export default jsPDF;
}

declare module 'jspdf-autotable' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type UserOptions = Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autoTable: (doc: any, options?: any) => void;
  export default autoTable;
}

// react-dom/client subpath — @types/react-dom from the private registry may
// not carry the bundler-compatible exports map.
declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(
    container: Element | DocumentFragment,
    options?: { onRecoverableError?: (error: unknown) => void }
  ): Root;
  export function hydrateRoot(
    container: Element | Document,
    initialChildren: ReactNode,
    options?: { onRecoverableError?: (error: unknown) => void }
  ): Root;
}

// Web Speech API event types absent from TypeScript 5.8.3 lib.dom.d.ts.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
