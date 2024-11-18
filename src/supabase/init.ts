'use client';
const SUPABASE_PUBLIC_URL = 'https://tzbfjxyddrzjldadxumw.supabase.co';
const SUPABASE_PUBLIC_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YmZqeHlkZHJ6amxkYWR4dW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4ODY1OTAsImV4cCI6MjA0NzQ2MjU5MH0.f1P7Do52ntubBRUupsdTM33TUoux8pIsnAtSM0mNm9I';

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(SUPABASE_PUBLIC_URL, SUPABASE_PUBLIC_KEY);
