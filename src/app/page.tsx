'use client';
import { useState } from 'react';
import { trpc } from '../trpc/client';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import {
  joinRoom,
  UserStatus,
  UserStatusType,
  watchComment,
} from '@/supabase/chat';

export default function Home() {
  const appHealthCheck = trpc.health_check.useQuery();

  const presenseFuncs = useRef<ReturnType<typeof joinRoom> | null>(null);
  const commentFuncs = useRef<ReturnType<typeof watchComment> | null>(null);

  const [userName, setUserName] = useState('');

  const [messages, setMessages] = useState<string[]>([]);
  const messagesRef = useRef<string[]>([]);

  const [messageBuffer, setMessageBuffer] = useState<string>('');

  const [usersList, setUserList] = useState<{ [name: string]: UserStatusType }>(
    {}
  );

  function addMessage(newMsg: string) {
    messagesRef.current.push(newMsg);
    setMessages([...messagesRef.current]);
  }
  function setupRoom() {
    presenseFuncs.current = joinRoom(
      userName,
      (msg) => {
        console.log('poked!', msg);

        addMessage(msg);
      },
      (status) => {
        status.forEach((item) => {
          usersList[item.userName] = item.status;
        });
        setUserList({ ...usersList });
      },
      (status) => {
        usersList[status.userName] = status.status;
        setUserList({ ...usersList });
        addMessage(
          `User status changed: ${status.userName} is now ${status.status}`
        );
      }
    );

    commentFuncs.current = watchComment((username, comment) => {
      addMessage(`${username} said: ${comment}`);
    });
  }

  useEffect(() => {
    return () => {
      if (presenseFuncs.current !== null) {
        presenseFuncs.current.cleanup();
      }
    };
  }, []);

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

      <select
        name="currentStatus"
        id="currentStatus"
        onInput={(e) => {
          presenseFuncs.current?.updateStatus(
            e.currentTarget.value as UserStatusType
          );
        }}
      >
        <option value={UserStatus.Online}>Online</option>
        <option value={UserStatus.Offline}>Offline</option>
        <option value={UserStatus.DND}>DND</option>
      </select>

      <div>
        <label htmlFor="message">Message</label>

        <input
          type="text"
          onChange={(e) => setMessageBuffer(e.currentTarget.value)}
        />
        <button
          onClick={() => {
            commentFuncs.current?.addComment(userName, messageBuffer);
          }}
        >
          Send!
        </button>
      </div>

      <button onClick={setupRoom}>Join room</button>
      <button
        onClick={() => {
          presenseFuncs.current?.poke?.();
        }}
      >
        Poke
      </button>

      <button
        onClick={() => {
          setMessages([...messages, '???']);
        }}
      >
        Sanity check
      </button>

      <div
        style={{
          width: '500px',
          height: '400px',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
          margin: '1rem',
          padding: '1rem',
          border: '1px solid black',
          gap: '0.25rem',
        }}
      >
        {messages.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>

      <ul>
        {Object.keys(usersList).map((user) => (
          <li key={user}>
            {user}: {usersList[user]}
          </li>
        ))}
      </ul>
    </div>
  );
}
