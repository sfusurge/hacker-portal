'use client';

import { supabase } from '@/supabase/init';

export const UserStatus = {
  Online: 'Online',
  Offline: 'Offline',
  DND: 'Do Not Disturb',
};
export type UserStatusType = keyof typeof UserStatus;

export interface UserOnlineStatus {
  userName: string;
  status: UserStatusType;
}

export function joinRoom(
  userName: string,
  onPoke: (pokeMessage: string) => void,
  onStatusChange: (status: UserOnlineStatus[]) => void,
  onNewStatus: (status: UserOnlineStatus) => void
) {
  // subscribe to room events

  const room = supabase.channel('default_room_name', {
    config: {
      presence: {
        key: `chat-presence-${userName}`,
      },
    },
  });

  async function updateStatus(newStatus: UserStatusType) {
    await room.track({
      userName,
      status: newStatus,
    });
  }

  async function cleanup() {
    await supabase.removeChannel(room);
  }

  async function poke() {
    room.send({
      event: 'poke',
      type: 'broadcast',
      payload: {
        message: `you got poked by ${userName}!`,
      },
    });
  }

  room
    .on('presence', { event: 'sync' }, () => {
      console.log('sync', room.presenceState());
      const changes: UserOnlineStatus[] = [];
      for (const [key, val] of Object.entries(
        room.presenceState<UserOnlineStatus>()
      )) {
        changes.push(val[0]);
      }
      onStatusChange(changes);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      // typing madness
      onNewStatus(newPresences[0] as unknown as UserOnlineStatus);
      console.log('join', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('leave', key, leftPresences);
    })
    .on('broadcast', { event: 'poke' }, (event) => {
      onPoke(event.payload.message as string);
    })
    .subscribe((stats, err) => {
      if (stats == 'SUBSCRIBED') {
        console.log('connection success');
        updateStatus('Online');
      }
    });

  return {
    updateStatus,
    cleanup,
    poke,
  };
}

interface CommentType {
  message: string;
  userName: string;
}

export function watchComment(
  onComment: (username: string, comment: string) => void,
  onMostRecent: (username: string, comment: string) => void
) {
  const channel = supabase.channel('comment_channel'); // NOTE, each client can only listen to once channel of the same name at a time

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'simpleComments',
      },
      (payload) => {
        const newRow = payload.new as CommentType;
        console.log(newRow);
        onComment(newRow.userName, newRow.message);
      }
    )
    .on<CommentType>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'mostRecentComment',
      },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          return;
        }

        const newComment = payload.new;

        onMostRecent(newComment.userName, newComment.message);
      }
    )
    .subscribe();

  return {
    addComment: async (userName: string, message: string) => {
      await supabase.from('simpleComments').insert({
        userName,
        message,
      });

      await supabase
        .from('mostRecentComment')
        .update({
          id: 0,
          userName,
          message,
        })
        .eq('id', 0);
    },
    cleanup: () => {
      supabase.removeChannel(channel);
    },
  };
}
