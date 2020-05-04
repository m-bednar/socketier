
export interface IMessageListener<T> {
    (data: T): void;
}
