'use client';

import { supabase } from '@/supabase/init';

export function joinRoom(userName: string) {
  // subscribe to room events

  const room = supabase.channel('default_room_name', {
    config: {
      presence: {
        key: `chat-presence-${userName}`,
      },
    },
  });

  room
    .on('presence', { event: 'sync' }, () => {
      console.log('sync', room.presenceState());
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('join', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('leave', key, leftPresences);
    })
    .subscribe((stats, err) => {
      console.log('subscription event', stats, err);
    });

  return {
    poke: async () => {
      const status = await room.track({
        userName,
        message: 'poke',
      });
      console.log('presence track status', status);
    },
    cleanup: async () => {
      const untrackRes = room.untrack();
      console.log('untracking', untrackRes);
    },
  };
}
