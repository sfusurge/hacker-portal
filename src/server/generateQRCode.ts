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
    const base64Image = await QRCode.toDataURL(data, opts);
    return base64Image;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
}
