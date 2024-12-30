'use client';

import { connectToChannel, createConnection } from '@/realtime/realtimeClient';
import Provider from '@/trpc/Provider';
import { Realtime } from 'ably';
import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

const realtimeClientAtom = atom<Realtime | undefined>();

export default function AblyTest() {
  return (
    <Provider>
      <ProvidedAblyTest />
    </Provider>
  );
}

function ProvidedAblyTest() {
  const [rtClient, setRtClient] = useAtom(realtimeClientAtom);
  const sendMsgRef = useRef<(msg: string) => void>();
  function onMessage(msg: string) {
    console.log(msg);
  }

  useEffect(() => {
    const client = createConnection(() => {
      console.log('connected');
    });
    const client2 = createConnection(() => {
      console.log('connected2');
    });
    console.log(client, client2);
    setRtClient(client);
    connectToChannel(client, 'Message', 'messaged', onMessage).then((res) => {
      sendMsgRef.current = res;
    });
  }, []);

  return (
    <button
      onClick={() => {
        sendMsgRef.current!('blah');
      }}
      style={{
        margin: '2rem',
        border: '2px solid red',
      }}
    >
      CLick me
    </button>
  );
}
