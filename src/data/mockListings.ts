import { Conversation, Listing } from '../types';

/**
 * Production must never fall back to fabricated marketplace inventory or chats.
 *
 * Keep these exports for compatibility with older development code paths, but
 * intentionally leave them empty. Real listings and conversations come from
 * Firestore; an empty/unavailable database must render an empty/error state
 * instead of presenting sample content as genuine user data.
 */
export const mockListings: Listing[] = [];
export const mockConversations: Conversation[] = [];
