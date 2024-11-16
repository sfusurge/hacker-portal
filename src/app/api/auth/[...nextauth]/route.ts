// https://next-auth.js.org/configuration/initialization

import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';

export const authProviders = [
  GoogleProvider({
    clientId: process.env.GOOGLE_ID || '',
    clientSecret: process.env.GOOGLE_SECRET || '',
  }),
  GithubProvider({
    clientId: process.env.GITHUB_ID || '',
    clientSecret: process.env.GITHUB_SECRET || '',
  }),
];
