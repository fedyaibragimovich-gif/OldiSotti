import React from 'react';

// Keep heavy, interaction-only UI out of the initial marketplace bundle.
// App.tsx can continue using its existing named imports while Vite aliases those
// imports to this lightweight module. The @/ paths below deliberately bypass the
// exact ./components/* aliases so the real implementations remain dynamic chunks.
export const ListingDetailModal = React.lazy(() =>
  import('@/src/components/ListingDetailModal').then((module) => ({ default: module.ListingDetailModal }))
);

export const PostAdModal = React.lazy(() =>
  import('@/src/components/PostAdModal').then((module) => ({ default: module.PostAdModal }))
);

export const AuthModal = React.lazy(() =>
  import('@/src/components/AuthModal').then((module) => ({ default: module.AuthModal }))
);

export const ChatDrawer = React.lazy(() =>
  import('@/src/components/ChatDrawer').then((module) => ({ default: module.ChatDrawer }))
);

export const FavoritesDrawer = React.lazy(() =>
  import('@/src/components/FavoritesDrawer').then((module) => ({ default: module.FavoritesDrawer }))
);

export const MyAdsModal = React.lazy(() =>
  import('@/src/components/MyAdsModal').then((module) => ({ default: module.MyAdsModal }))
);

export const InfoPagesModal = React.lazy(() =>
  import('@/src/components/InfoPagesModal').then((module) => ({ default: module.InfoPagesModal }))
);

export const AdminPanelModal = React.lazy(() =>
  import('@/src/components/AdminPanelModal').then((module) => ({ default: module.AdminPanelModal }))
);
