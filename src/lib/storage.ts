import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { app, auth } from './firebase';

const storage = getStorage(app);
export interface ListingImageUploadResult { images: string[]; uploadedImages: string[]; }

// Only touch objects in this app's own bucket. External/preset images are never deleted.
export async function deleteListingImages(images: string[], ownerUid: string, listingId: string): Promise<void> {
  for (const image of images) {
    if (!image.startsWith('https://firebasestorage.googleapis.com/')) continue;
    const object = ref(storage, image);
    if (object.bucket !== ref(storage).bucket || !object.fullPath.startsWith(`users/${ownerUid}/listings/${listingId}/`)) continue;
    try { await deleteObject(object); }
    catch (error: any) { if (error?.code !== 'storage/object-not-found') throw error; }
  }
}

export async function uploadListingImagesToStorage(listingId: string, images: string[]): Promise<ListingImageUploadResult> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) throw new Error('Rasm yuklash uchun akkauntga kiring.');
  if (!images.length || images.length > 4) throw new Error('1–4 ta rasm tanlang.');
  const output: string[] = [];
  const uploadedImages: string[] = [];
  try {
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      if (!image.startsWith('data:image/')) { output.push(image); continue; }
      const mime = /^data:(image\/(?:jpeg|png|webp));base64,/.exec(image)?.[1];
      if (!mime || Math.ceil(image.split(',')[1].length * 3 / 4) > 10 * 1024 * 1024) throw new Error('Rasm formati yoki hajmi noto‘g‘ri.');
      const object = ref(storage, `users/${user.uid}/listings/${listingId}/${crypto.randomUUID()}`);
      await uploadString(object, image, 'data_url', { contentType: mime, customMetadata: { listingId, ownerUid: user.uid } });
      // Retain a deletable reference even if obtaining the download URL fails.
      const objectUrl = `https://firebasestorage.googleapis.com/v0/b/${object.bucket}/o/${encodeURIComponent(object.fullPath)}`;
      uploadedImages.push(objectUrl);
      output.push(await getDownloadURL(object));
    }
    return { images: output, uploadedImages };
  } catch (error) {
    await deleteListingImages(uploadedImages, user.uid, listingId).catch(cleanupError => console.warn('Upload cleanup failed', cleanupError));
    throw error;
  }
}
