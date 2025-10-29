declare module 'youtube-chat' {
  export class LiveChat {
    constructor(opts: { liveId: string });
    on(event: string, cb: (...args: any[]) => void): void;
    start(): Promise<void>;
    stop?(): Promise<void>;
  }
}
