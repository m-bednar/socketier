interface IEventSource {
    removeEventListener(type: string, fn: () => any): void;
    addEventListener(type: string, fn: () => any): void;
}

interface IState {
    fired: boolean;
    wrapFn: (this: any) => any;
    target: IEventSource;
    type: string;
    listener: EventListener;
}

function onceWrapper(this: IState) {
    if (!this.fired) {
        this.target.removeEventListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0) {
            return this.listener.call(this.target, new Event(this.type));
        }
        return this.listener.apply(this.target, <any> arguments);
    }
}

function onceWrap(target: IEventSource, type: string, listener: EventListener) {
    const state: IState = { fired: false, wrapFn: () => null, target, type, listener };
    const wrapped = onceWrapper.bind(state);
    (<any> wrapped).listener = listener;
    state.wrapFn = wrapped;
    return wrapped;
}

export function once<T extends string>(source: IEventSource, type: T, listener: EventListener) {
    source.addEventListener(type, onceWrap(source, type, listener));
}
