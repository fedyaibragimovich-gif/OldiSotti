import type { Listing } from '../types';

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const string = (value: unknown) => typeof value === 'string' ? value : '';
const optionalString = (value: unknown) => typeof value === 'string' ? value : undefined;
const LEGACY_DEMO_ID = /^olx-0*(?:[1-9]|1\d|20)$/i;
const PUBLIC_DEMO_ID = /^oldisotdi-demo-0*(?:[1-9]|1\d|20)$/i;

function normalizeCreatedAt(raw: unknown): string {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    return raw;
  }
  return '2026-09-01T00:00:00.000Z';
}

export function readListing(value: unknown, id: string): Listing | null {
  const normalizedId = String(id || '').trim();
  if (LEGACY_DEMO_ID.test(normalizedId) || PUBLIC_DEMO_ID.test(normalizedId)) return null;
  if (!record(value) || !record(value.seller) || !record(value.location)) return null;
  if (typeof value.title !== 'string' || !value.title.trim() || typeof value.description !== 'string') return null;
  if (typeof value.price !== 'number' || !Number.isFinite(value.price) || value.price < 0) return null;
  if (!['active','pending','reserved','sold','rejected'].includes(string(value.status))) return null;
  if (!['USD','UZS'].includes(string(value.currency))) return null;
  const images = Array.isArray(value.images) ? value.images.filter((v): v is string => typeof v === 'string' && (/^https?:\/\//i.test(v) || /^data:image\//i.test(v))).slice(0,4) : [];
  if (!images.length) return null;
  const seller = value.seller, location = value.location;
  const latitude = typeof location.latitude === 'number' && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 ? location.latitude : undefined;
  const longitude = typeof location.longitude === 'number' && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180 ? location.longitude : undefined;
  return {
    ...value, id: normalizedId, images, title:value.title, description:value.description, price:value.price,
    currency:value.currency as Listing['currency'], status:value.status as Listing['status'],
    categoryId:string(value.categoryId), subcategoryId:optionalString(value.subcategoryId),
    brand:optionalString(value.brand), userId:optionalString(value.userId),
    createdAt:normalizeCreatedAt(value.createdAt), condition:value.condition === 'new' ? 'new' : 'used',
    isVip:value.isVip === true, isTop:value.isTop === true,
    isNegotiable:value.isNegotiable === true, isDeliveryAvailable:value.isDeliveryAvailable === true,
    deliveryNote:optionalString(value.deliveryNote), rejectionReason:optionalString(value.rejectionReason),
    viewsCount:typeof value.viewsCount === 'number' && Number.isFinite(value.viewsCount) ? Math.max(0,value.viewsCount) : 0,
    attributes:record(value.attributes) ? Object.fromEntries(Object.entries(value.attributes).filter(([,v]) => typeof v === 'string')) as Record<string,string> : undefined,
    seller:{
      id:string(seller.id), name:string(seller.name), phone:string(seller.phone),
      avatar:optionalString(seller.avatar), telegram:optionalString(seller.telegram),
      registeredSince:string(seller.registeredSince), responseTime:string(seller.responseTime),
      isVerified:seller.isVerified === true, rating:typeof seller.rating === 'number' ? seller.rating : 0,
      activeAdsCount:typeof seller.activeAdsCount === 'number' ? seller.activeAdsCount : 0
    },
    location:{region:string(location.region),district:optionalString(location.district),address:optionalString(location.address),
      ...(latitude !== undefined && longitude !== undefined ? {latitude,longitude} : {})}
  };
}
