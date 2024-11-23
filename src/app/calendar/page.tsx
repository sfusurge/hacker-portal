'use client';

import { useState } from 'react';

export default function Calendar() {
  const [state1, setstate1] = useState(false);
  const [state2, setstate2] = useState(false);

  return (
    <div>
      <h1>Calendar Test page</h1>

      <button
        onClick={() => {
          setstate1(!state1);
        }}
      >
        B1
      </button>
      <button
        onClick={() => {
          setstate2(!state2);
        }}
      >
        B2
      </button>

      {state1 && <Stuff name="ITEM 1"></Stuff>}

      {state2 && <Stuff name="ITEM 2"></Stuff>}
    </div>
  );
}

function Stuff({ name }: { name: string }) {
  console.log('rendering: ', name);

  return <h2>{name}</h2>;
}
