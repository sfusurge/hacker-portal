import { ErrorInfo, Realtime } from 'ably';

// TODO !!! DO CLIENT SIDE AUTH
export function createConnection(
    onOpen?: () => void,
    onClosed?: () => void,
    onError?: (message: ErrorInfo | undefined) => void
) {
    const client = new Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY!);
    client.connection.once('connected', () => {
        // TODO remove debug
        if (onOpen) {
            onOpen();
        }
        console.log('connect to ably');
    });

    client.connection.once('failed', (e) => {
        onError && onError(e.reason);
    });

    client.connection.once('closed', () => {
        if (onClosed) {
            onClosed();
        }
        console.log('ably connection closed');
    });

    return client;
}

/**
 * genric is T message to send *AND* receive.
 * @param client
 * @param channleName
 * @param eventName
 * @param onMessage
 * @returns
 */
export async function connectToChannel<T>(
    client: Realtime,
    channleName: string,
    eventName: string,
    onMessage: (msg: T) => void
) {
    const channel = client.channels.get(channleName);
    await channel.subscribe(eventName, (message) => {
        onMessage(message.data as T);
    });

    return (msg: T) => {
        channel.publish(eventName, msg);
    };
}
