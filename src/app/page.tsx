'use client';
import { useState } from 'react';
import { trpc } from '../trpc/client';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { joinRoom } from '@/supabase/chat';

export default function Home() {
  const appHealthCheck = trpc.health_check.useQuery();

  const poke = useRef<(() => Promise<void>) | null>(null);
  const untrack = useRef<(() => Promise<void>) | null>(null);

  const [userName, setUserName] = useState('');

  function setupRoom() {
    const joinRes = joinRoom(userName);

    poke.current = joinRes.poke;
    untrack.current = joinRes.cleanup;
  }

  return (
    <div>
      <div>
        <label htmlFor="userName">User name</label>
        <input
          onInput={(e) => {
            setUserName(e.currentTarget.value);
          }}
          type="text"
          id="userName"
        />
      </div>
      <button onClick={setupRoom}>Join room</button>
      <button
        onClick={() => {
          poke.current?.();
        }}
      >
        Poke
      </button>
    </div>
  );
}
