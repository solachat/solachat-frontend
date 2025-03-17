import { createImage } from './loadImage';

export default async function getCroppedImg(imageSrc: string, croppedAreaPixels: any, rotation = 0): Promise<Blob> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not found');
    }

    const radians = (rotation * Math.PI) / 180;
    const { width, height, x, y } = croppedAreaPixels;

    canvas.width = width;
    canvas.height = height;

    ctx.translate(width / 2, height / 2);
    ctx.rotate(radians);
    ctx.drawImage(
        image,
        x,
        y,
        width,
        height,
        -width / 2,
        -height / 2,
        width,
        height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg');
    });
}
