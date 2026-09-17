import React from 'react';

// Interaction-only UI stays out of the initial marketplace bundle. App.tsx can
// keep its named imports while Vite redirects them here; @/ paths deliberately
// bypass those exact aliases and load the real implementations as lazy chunks.
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
