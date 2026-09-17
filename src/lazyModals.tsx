import React from 'react';

// Keep heavy, interaction-only UI out of the initial marketplace bundle.
// App.tsx can continue using its existing named imports while Vite aliases those
// imports to this lightweight module. Each implementation is fetched only when
// React renders the corresponding modal/drawer inside the existing Suspense.
export const ListingDetailModal = React.lazy(() =>
  import('./components/ListingDetailModal').then((module) => ({ default: module.ListingDetailModal }))
);

export const PostAdModal = React.lazy(() =>
  import('./components/PostAdModal').then((module) => ({ default: module.PostAdModal }))
);

export const AuthModal = React.lazy(() =>
  import('./components/AuthModal').then((module) => ({ default: module.AuthModal }))
);

export const ChatDrawer = React.lazy(() =>
  import('./components/ChatDrawer').then((module) => ({ default: module.ChatDrawer }))
);

export const FavoritesDrawer = React.lazy(() =>
  import('./components/FavoritesDrawer').then((module) => ({ default: module.FavoritesDrawer }))
);

export const MyAdsModal = React.lazy(() =>
  import('./components/MyAdsModal').then((module) => ({ default: module.MyAdsModal }))
);

export const InfoPagesModal = React.lazy(() =>
  import('./components/InfoPagesModal').then((module) => ({ default: module.InfoPagesModal }))
);

export const AdminPanelModal = React.lazy(() =>
  import('./components/AdminPanelModal').then((module) => ({ default: module.AdminPanelModal }))
);
