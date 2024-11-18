'use client';
import { useState } from 'react';
import { trpc } from '../trpc/client';

export default function Home() {
  const appHealthCheck = trpc.health_check.useQuery();

  return <div></div>;
}
