
export type { Mapped, ExtendableEvent, FetchEvent, FetchFunc };

type Mapped<T=unknown> = { [key: string]: T; };

interface ExtendableEvent {
  waitUntil(f: Promise<unknown>): void;
};

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(r: Promise<Response>): void;
};

type FetchFunc = (input: RequestInfo) => Promise<Response>;
