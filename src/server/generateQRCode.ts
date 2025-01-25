'use server';

import QRCode from 'qrcode';

export type QROptions = {
    margin: number;
    scale: number;
    color: {
        dark: string;
        light: string;
    };
};

export default async function generateQRCode(data: string, opts: QROptions) {
    try {
        return await QRCode.toDataURL(data, opts);
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw err;
    }
}
