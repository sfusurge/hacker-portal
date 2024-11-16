import QRCode from 'qrcode';

export default async function generateQRCode(data: string) {
    try {
        const base64Image: string = await QRCode.toDataURL(data);
        return base64Image.replace(/^data:image\/png;base64,/, ''); // Remove the data URL prefix
    } catch (err) {
        console.error("Error generating QR code:", err);
        throw err;
    }
}