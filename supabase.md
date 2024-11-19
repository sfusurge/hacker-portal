# Notes on Supabase and drizzle integration

## Tables

Tables that we directly interact with should be create/modified via drizzle exclusively,
using supabase's migration tools will confuse drizzle-kit, perhaps the reverse if true as well but thats not tested.

Drizzle creates tables with RLS(row level security) off by default, for prod we need to make sure each table has proper read/write access controls.

## Real time

Supabase uses named `channel` objects to track a connection, which can have any number of `.on()` event callbacks to handle readtime event.
Typescript support is _fine_, but easy to miss.
Warning, each channel can only be created once, if a second channel with the same name is created on a client, the old one is replaced.

Supabase provides 3 methods of real time connection types

- Presence

  - triggered when `track()` is called to set a state for a particular connection client
  - typically used for online status or other user state
  - State is ethereal, in the sense that the state is not saved in db.
  - join and leave event is guaranteed to trigger for client join/leave/state change
  - state change triggers leave, then join event sequetially. Order is guaranteed
  - When client loses connection, intentionally or unintentionally, leave event for other client is guaranteed to fire.

  * Warning, state of each client connected is in an array for reason, not sure when could a client have more than 1 state.

- Broadcast

  - sends a ethereal message to all other clients
  - optional loopback
  - optional wait for ack

- Db change
  - watches changes when a particular table of a schema changes
  - can subscribe to update, insert, delete, or all events
  - changes triggers on a row level basis
  - has basic amount of filters to only watch some part of the table (reduced query set to keep efficiency)
  - table being watched needs to be marked "realtime enabled" in cloud console
    - using `.on()` on a non-realtime table seems to break the entire channel, watch out!
  - When triggering change via tRPC, supabase realtime db change event still fires!
