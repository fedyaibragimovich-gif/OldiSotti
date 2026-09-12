import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app, auth } from './firebase';

const storage = getStorage(app);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function estimateDataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return dataUrl.length;
  const base64 = dataUrl.slice(comma + 1);
  return Math.ceil((base64.length * 3) / 4);
}

export interface ListingImageUploadResult {
  images: string[];
  usedStorage: boolean;
  fallbackReason?: string;
}

export async function uploadListingImagesToStorage(
  listingId: string,
  images: string[]
): Promise<ListingImageUploadResult> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    throw new Error('Rasm yuklash uchun akkauntga kirish kerak.');
  }

  const output: string[] = [];
  let usedStorage = false;

  try {
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];

      // Existing remote/preset images are already URLs and do not need another upload.
      if (!image.startsWith('data:image/')) {
        output.push(image);
        continue;
      }

      if (estimateDataUrlBytes(image) > MAX_IMAGE_BYTES) {
        throw new Error('Har bir rasm maksimal 10 MB bo‘lishi mumkin.');
      }

      const fileRef = ref(
        storage,
        `users/${user.uid}/listings/${listingId}/${index + 1}-${Date.now()}.jpg`
      );

      await uploadString(fileRef, image, 'data_url', {
        contentType: 'image/jpeg',
        customMetadata: {
          listingId,
          ownerUid: user.uid
        }
      });
      output.push(await getDownloadURL(fileRef));
      usedStorage = true;
    }

    return { images: output, usedStorage };
  } catch (error: any) {
    // Keep posting available until Storage security rules are deployed. The caller
    // still applies the old Firestore embedded-image size guard to this fallback.
    console.warn('Firebase Storage upload unavailable; using embedded-image fallback:', error);
    return {
      images,
      usedStorage: false,
      fallbackReason: error?.code || error?.message || 'storage-unavailable'
    };
  }
}
