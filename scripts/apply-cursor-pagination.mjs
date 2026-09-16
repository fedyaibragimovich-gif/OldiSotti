import fs from 'node:fs';

function replaceOnce(source, oldText, newText, label) {
  const first = source.indexOf(oldText);
  if (first < 0) throw new Error(`Could not find ${label}`);
  if (source.indexOf(oldText, first + oldText.length) >= 0) throw new Error(`Expected one ${label}`);
  return source.slice(0, first) + newText + source.slice(first + oldText.length);
}

let firebase = fs.readFileSync('src/lib/firebase.ts', 'utf8');
firebase = replaceOnce(
  firebase,
  `export function subscribeToListings(\n  onSuccess: (listings: Listing[], hasMore?: boolean) => void,`,
  `export function subscribeToListings(\n  onSuccess: (listings: Listing[], hasMore?: boolean, lastPublicCreatedAt?: string) => void,`,
  'subscribeToListings callback signature'
);

firebase = replaceOnce(
  firebase,
  `    const queries = isCurrentAdmin()\n      ? [query(collection(db, LISTINGS_COLLECTION), limit(pageSize))]\n      : [\n          query(collection(db, LISTINGS_COLLECTION), where('status', '==', 'active'), limit(pageSize)),\n          ...(user && !user.isAnonymous ? [query(collection(db, LISTINGS_COLLECTION), where('userId', '==', user.uid), limit(pageSize))] : [])\n        ];`,
  `    const admin = isCurrentAdmin();\n    const queries = admin\n      ? [query(collection(db, LISTINGS_COLLECTION), orderBy('createdAt', 'desc'), limit(LISTINGS_REALTIME_LIMIT))]\n      : [\n          query(\n            collection(db, LISTINGS_COLLECTION),\n            where('status', '==', 'active'),\n            orderBy('createdAt', 'desc'),\n            limit(pageSize)\n          ),\n          ...(user && !user.isAnonymous\n            ? [query(collection(db, LISTINGS_COLLECTION), where('userId', '==', user.uid), limit(LISTINGS_REALTIME_LIMIT))]\n            : [])\n        ];`,
  'listing query definitions'
);

firebase = replaceOnce(
  firebase,
  `        const activeCount = docCounts.get(0) || 0;\n        const hasMore = activeCount >= pageSize;\n        onSuccess(sorted, hasMore);`,
  `        const activeCount = docCounts.get(0) || 0;\n        const publicItems = sources.get(0) || [];\n        const lastPublicCreatedAt = admin ? undefined : publicItems[publicItems.length - 1]?.createdAt;\n        const hasMore = admin ? false : activeCount >= pageSize;\n        onSuccess(sorted, hasMore, lastPublicCreatedAt);`,
  'listing subscription cursor metadata'
);

firebase = replaceOnce(
  firebase,
  `  } catch (err) {\n    console.error('fetchListingsPage failed:', err);\n    return { listings: [], hasMore: false };\n  }\n}`,
  `  } catch (err) {\n    console.error('fetchListingsPage failed:', err);\n    throw err instanceof Error ? err : new Error('Failed to load the next listings page');\n  }\n}`,
  'cursor fetch error handling'
);

fs.writeFileSync('src/lib/firebase.ts', firebase);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = replaceOnce(
  app,
  `  subscribeToListings,\n  fetchListingById,`,
  `  subscribeToListings,\n  fetchListingsPage,\n  fetchListingById,`,
  'App Firebase import'
);

const oldPaginationBlock = `  // Pagination and progressive loading states\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(12);\n  const [firestoreQueryLimit, setFirestoreQueryLimit] = useState(24);\n  const [hasMoreInDb, setHasMoreInDb] = useState(false);\n  const [isLoadingMore, setIsLoadingMore] = useState(false);\n\n  // Real-time Cloud Database (Firestore) synchronization - Listings with pagination limit\n  useEffect(() => {\n    let isMounted = true;\n\n    // Resilient fallback: if network is offline or Firestore connection is delayed, show initial listings\n    const fallbackTimer = setTimeout(() => {\n      if (isMounted) {\n        setListings((prev) => (prev.length === 0 ? mockListings : prev));\n        setIsLoadingListings(false);\n      }\n    }, 2500);\n\n    // 1. Listings real-time listener with server-side limit\n    const unsubscribeListings = subscribeToListings(\n      async (dbListings, hasMore) => {\n        if (!isMounted) return;\n        clearTimeout(fallbackTimer);\n        setIsDbConnected(true);\n        setIsLoadingListings(false);\n        setIsLoadingMore(false);\n        setHasMoreInDb(Boolean(hasMore));\n        if (dbListings.length === 0) {\n          setListings(mockListings);\n        } else {\n          setListings(dbListings);\n        }\n      },\n      (err) => {\n        console.warn('Firestore subscription failed:', err);\n        clearTimeout(fallbackTimer);\n        setIsDbConnected(false);\n        setIsLoadingListings(false);\n        setIsLoadingMore(false);\n        setListings((prev) => (prev.length === 0 ? mockListings : prev));\n      },\n      () => { if (isMounted) { setIsLoadingListings(true); setIsDbConnected(false); } },\n      firestoreQueryLimit\n    );\n\n    return () => {\n      isMounted = false;\n      clearTimeout(fallbackTimer);\n      unsubscribeListings();\n    };\n  }, [firestoreQueryLimit]);`;

const newPaginationBlock = `  // Pagination and progressive loading states. The newest public page stays realtime;\n  // older pages are fetched once with a Firestore startAfter() cursor so loading\n  // 48/72/96 items never re-reads the preceding documents.\n  const FIRESTORE_PAGE_SIZE = 24;\n  const [currentPage, setCurrentPage] = useState(1);\n  const [itemsPerPage, setItemsPerPage] = useState(12);\n  const [hasMoreInDb, setHasMoreInDb] = useState(false);\n  const [isLoadingMore, setIsLoadingMore] = useState(false);\n  const olderListingsRef = useRef<Listing[]>([]);\n  const listingCursorRef = useRef<string | null>(null);\n  const cursorPagingStartedRef = useRef(false);\n  const loadingMoreRef = useRef(false);\n\n  const mergeListingsById = (primary: Listing[], secondary: Listing[]) => {\n    const merged = new Map<string, Listing>();\n    [...secondary, ...primary].forEach((item) => merged.set(item.id, item));\n    return [...merged.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));\n  };\n\n  // Real-time first page + private own listings. Older public pages are appended\n  // through fetchListingsPage() instead of increasing the realtime query limit.\n  useEffect(() => {\n    let isMounted = true;\n\n    const fallbackTimer = setTimeout(() => {\n      if (isMounted) {\n        setListings((prev) => (prev.length === 0 ? mockListings : prev));\n        setIsLoadingListings(false);\n      }\n    }, 2500);\n\n    const unsubscribeListings = subscribeToListings(\n      async (dbListings, hasMore, lastPublicCreatedAt) => {\n        if (!isMounted) return;\n        clearTimeout(fallbackTimer);\n        setIsDbConnected(true);\n        setIsLoadingListings(false);\n        setIsLoadingMore(false);\n\n        if (!cursorPagingStartedRef.current) {\n          listingCursorRef.current = lastPublicCreatedAt || null;\n          setHasMoreInDb(Boolean(hasMore));\n        }\n\n        if (dbListings.length === 0 && olderListingsRef.current.length === 0) {\n          setListings(mockListings);\n        } else {\n          setListings(mergeListingsById(dbListings, olderListingsRef.current));\n        }\n      },\n      (err) => {\n        console.warn('Firestore subscription failed:', err);\n        clearTimeout(fallbackTimer);\n        setIsDbConnected(false);\n        setIsLoadingListings(false);\n        setIsLoadingMore(false);\n        setListings((prev) => (prev.length === 0 ? mockListings : prev));\n      },\n      () => { if (isMounted) { setIsLoadingListings(true); setIsDbConnected(false); } },\n      FIRESTORE_PAGE_SIZE\n    );\n\n    return () => {\n      isMounted = false;\n      clearTimeout(fallbackTimer);\n      unsubscribeListings();\n    };\n  }, []);\n\n  // A login/logout switches the private owner query. Public cursor pages are reset\n  // as well so data belonging to the previous session can never linger in memory.\n  useEffect(() => {\n    olderListingsRef.current = [];\n    listingCursorRef.current = null;\n    cursorPagingStartedRef.current = false;\n    loadingMoreRef.current = false;\n    setHasMoreInDb(false);\n    setIsLoadingMore(false);\n    setCurrentPage(1);\n  }, [currentUser?.uid]);\n\n  const loadNextFirestorePage = async () => {\n    if (loadingMoreRef.current || !hasMoreInDb || !listingCursorRef.current || isAdminUser(currentUser)) return;\n    loadingMoreRef.current = true;\n    cursorPagingStartedRef.current = true;\n    setIsLoadingMore(true);\n    try {\n      const previousCursor = listingCursorRef.current;\n      const page = await fetchListingsPage(FIRESTORE_PAGE_SIZE, previousCursor);\n      const existingIds = new Set(olderListingsRef.current.map((item) => item.id));\n      const newUniqueCount = page.listings.filter((item) => !existingIds.has(item.id)).length;\n      olderListingsRef.current = mergeListingsById(page.listings, olderListingsRef.current);\n      setListings((prev) => mergeListingsById(page.listings, prev));\n      if (page.lastVisibleCreatedAt) listingCursorRef.current = page.lastVisibleCreatedAt;\n      const cursorAdvanced = Boolean(page.lastVisibleCreatedAt && page.lastVisibleCreatedAt !== previousCursor);\n      setHasMoreInDb(Boolean(page.hasMore && (newUniqueCount > 0 || cursorAdvanced)));\n    } catch (err) {\n      console.warn('Could not load the next Firestore cursor page:', err);\n      // Keep hasMoreInDb true so the user can retry after a transient failure.\n    } finally {\n      loadingMoreRef.current = false;\n      setIsLoadingMore(false);\n    }\n  };`;

app = replaceOnce(app, oldPaginationBlock, newPaginationBlock, 'App pagination subscription block');

const oldLoadMore = `  const handleLoadMore = () => {\n    const nextDisplayed = (currentPage + 1) * itemsPerPage;\n    setCurrentPage((prev) => prev + 1);\n\n    // If approaching or exceeding current database limit and there's more in Firestore, fetch next batch!\n    if (nextDisplayed >= firestoreQueryLimit && hasMoreInDb) {\n      setIsLoadingMore(true);\n      setFirestoreQueryLimit((prev) => prev + 24);\n    }\n  };`;

const newLoadMore = `  const handleLoadMore = () => {\n    const nextDisplayed = (currentPage + 1) * itemsPerPage;\n    setCurrentPage((prev) => prev + 1);\n\n    // Preload the next server page only when the UI is about to exhaust the\n    // currently loaded filtered results. startAfter() prevents cumulative reads.\n    if (nextDisplayed >= filteredListings.length && hasMoreInDb) {\n      void loadNextFirestorePage();\n    }\n  };`;
app = replaceOnce(app, oldLoadMore, newLoadMore, 'App load-more handler');

const oldPageSize = `  const handlePageSizeChange = (newSize: number) => {\n    setItemsPerPage(newSize);\n    setCurrentPage(1);\n    if (newSize > firestoreQueryLimit && hasMoreInDb) {\n      setFirestoreQueryLimit(newSize + 12);\n    }\n  };`;
const newPageSize = `  const handlePageSizeChange = (newSize: number) => {\n    setItemsPerPage(newSize);\n    setCurrentPage(1);\n    if (newSize > filteredListings.length && hasMoreInDb) {\n      void loadNextFirestorePage();\n    }\n  };`;
app = replaceOnce(app, oldPageSize, newPageSize, 'App page-size handler');

fs.writeFileSync('src/App.tsx', app);

const cursorTest = `import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport fs from 'node:fs';\n\nconst firebase = fs.readFileSync(new URL('../src/lib/firebase.ts', import.meta.url), 'utf8');\nconst app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');\n\ntest('public realtime page is ordered and older pages use startAfter', () => {\n  assert.match(firebase, /where\\('status', '==', 'active'\\)[\\s\\S]*orderBy\\('createdAt', 'desc'\\)/);\n  assert.match(firebase, /startAfter\\(lastCreatedAt\\)/);\n  assert.match(app, /fetchListingsPage\\(FIRESTORE_PAGE_SIZE, previousCursor\\)/);\n  assert.match(app, /listingCursorRef/);\n});\n\ntest('progressive loading no longer grows and re-reads the Firestore limit', () => {\n  assert.doesNotMatch(app, /setFirestoreQueryLimit/);\n  assert.doesNotMatch(app, /firestoreQueryLimit/);\n  assert.match(app, /olderListingsRef/);\n  assert.match(app, /cursorPagingStartedRef/);\n});\n\ntest('admin and owner-private inventory retain broader realtime coverage', () => {\n  assert.match(firebase, /isCurrentAdmin\\(\\)[\\s\\S]*LISTINGS_REALTIME_LIMIT/);\n  assert.match(firebase, /where\\('userId', '==', user\\.uid\\)[\\s\\S]*LISTINGS_REALTIME_LIMIT/);\n});\n`;
fs.writeFileSync('tests/cursor-pagination.test.mjs', cursorTest);

let ci = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
ci = replaceOnce(
  ci,
  `      - name: Progressive pagination regression tests\n        run: node --test tests/progressive-pagination.test.mjs\n`,
  `      - name: Progressive pagination regression tests\n        run: node --test tests/progressive-pagination.test.mjs\n\n      - name: Cursor pagination regression tests\n        run: node --test tests/cursor-pagination.test.mjs\n`,
  'CI progressive pagination step'
);
fs.writeFileSync('.github/workflows/ci.yml', ci);
