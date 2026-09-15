import { getStorage, ref, uploadString, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app, auth } from './firebase';

const storage = getStorage(app);
export interface ListingImageUploadResult {
  images: string[];
  uploadedImages: string[];
}

export function isCloudStorageUrl(url: string): boolean {
  return typeof url === 'string' && (
    url.startsWith('https://firebasestorage.googleapis.com/') ||
    url.startsWith('https://storage.googleapis.com/')
  );
}

// Only touch objects in this app's own bucket. External/preset images are never deleted.
export async function deleteListingImages(images: string[], ownerUid: string, listingId: string): Promise<void> {
  for (const image of images) {
    if (!isCloudStorageUrl(image)) continue;
    try {
      const object = ref(storage, image);
      if (object.bucket !== ref(storage).bucket || !object.fullPath.startsWith(`users/${ownerUid}/listings/${listingId}/`)) {
        continue;
      }
      await deleteObject(object);
    } catch (error: any) {
      if (error?.code !== 'storage/object-not-found') throw error;
    }
  }
}

export async function uploadListingImagesToStorage(
  listingId: string,
  images: (string | Blob)[],
  onProgress?: (current: number, total: number) => void
): Promise<ListingImageUploadResult> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    throw new Error('Rasm yuklash uchun akkauntga kiring.');
  }
  if (!images.length || images.length > 4) {
    throw new Error('1–4 ta rasm tanlang.');
  }

  const output: string[] = [];
  const uploadedImages: string[] = [];

  try {
    for (let index = 0; index < images.length; index++) {
      onProgress?.(index + 1, images.length);
      const item = images[index];

      // If already a remote URL (e.g. Unsplash or existing Cloud Storage URL), keep as is
      if (typeof item === 'string' && !item.startsWith('data:image/')) {
        output.push(item);
        continue;
      }

      const fileId = `${Date.now()}-${crypto.randomUUID()}`;
      const object = ref(storage, `users/${user.uid}/listings/${listingId}/${fileId}.jpg`);

      if (typeof item === 'string') {
        const mime = /^data:(image\/(?:jpeg|png|webp));base64,/.exec(item)?.[1] || 'image/jpeg';
        const base64Data = item.split(',')[1] || '';
        if (Math.ceil(base64Data.length * 3 / 4) > 10 * 1024 * 1024) {
          throw new Error('Rasm hajmi 10 MB dan oshmasligi kerak.');
        }

        await uploadString(object, item, 'data_url', {
          contentType: mime,
          customMetadata: { listingId, ownerUid: user.uid }
        });
      } else {
        // Blob upload (binary efficiency)
        if (item.size > 10 * 1024 * 1024) {
          throw new Error('Rasm hajmi 10 MB dan oshmasligi kerak.');
        }
        await uploadBytes(object, item, {
          contentType: item.type || 'image/jpeg',
          customMetadata: { listingId, ownerUid: user.uid }
        });
      }

      // Retain a deletable reference even if obtaining download URL fails
      const objectUrl = `https://firebasestorage.googleapis.com/v0/b/${object.bucket}/o/${encodeURIComponent(object.fullPath)}`;
      uploadedImages.push(objectUrl);

      const downloadUrl = await getDownloadURL(object);
      output.push(downloadUrl);
    }

    return { images: output, uploadedImages };
  } catch (error) {
    await deleteListingImages(uploadedImages, user.uid, listingId).catch(cleanupError =>
      console.warn('Upload cleanup failed', cleanupError)
    );
    throw error;
  }
}

