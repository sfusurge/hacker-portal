import { Realtime } from 'ably';

async function realtimeSubscript() {
  const ably = new Realtime(process.env.bleh!);
}
