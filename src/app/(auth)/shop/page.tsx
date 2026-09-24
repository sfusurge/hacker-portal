import { redirect } from 'next/navigation';

/** Hacker points + shop catalog live on Time Games. */
export default function ShopRedirectPage() {
    const timeGamesUrl =
        process.env.TIME_GAMES_URL ?? 'https://games.sfusurge.com';
    redirect(timeGamesUrl);
}
