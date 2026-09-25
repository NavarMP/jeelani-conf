import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface OfflineCheckIn {
  id?: number;
  token: string;
  gate: string;
  checkedInBy: string;
  timestamp: number;
}

export interface StaffInfo {
  id: string;
  name: string;
  role: string;
  assigned_gate: string | null;
  permissions: string[];
}

export interface JeelaniOfflineDB extends DBSchema {
  sync_queue: {
    key: number;
    value: OfflineCheckIn;
    indexes: { 'by-timestamp': number };
  };
  staff_store: {
    key: string;
    value: StaffInfo;
  };
  attendees_store: {
    key: string; // registration_id
    value: any;
    indexes: { 'by-name': string, 'by-phone': string, 'by-reg_id': string };
  };
  sessions_store: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<JeelaniOfflineDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<JeelaniOfflineDB>('jeelani-offline-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore('sync_queue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-timestamp', 'timestamp');
        db.createObjectStore('staff_store', {
          keyPath: 'id',
        });
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('attendees_store')) {
          const attendeeStore = db.createObjectStore('attendees_store', { keyPath: 'id' }); // Actually let's use id for UUID
          attendeeStore.createIndex('by-name', 'name');
          attendeeStore.createIndex('by-phone', 'phone');
          attendeeStore.createIndex('by-reg_id', 'registration_id');
        }
        if (!db.objectStoreNames.contains('sessions_store')) {
          db.createObjectStore('sessions_store', { keyPath: 'slug' });
        }
      }
    },
  });
}

// Sync Queue Operations
export async function addToSyncQueue(item: Omit<OfflineCheckIn, 'id'>) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.add('sync_queue', item as OfflineCheckIn);
}

export async function getSyncQueue(): Promise<OfflineCheckIn[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAllFromIndex('sync_queue', 'by-timestamp');
}

export async function clearSyncQueueItem(id: number) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('sync_queue', id);
}

export async function clearEntireSyncQueue() {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.clear('sync_queue');
}

// Staff Operations
export async function cacheStaffInfo(staff: StaffInfo) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('staff_store', staff);
}

export async function getCachedStaffInfo(id: string): Promise<StaffInfo | undefined> {
  if (!dbPromise) return undefined;
  const db = await dbPromise;
  return db.get('staff_store', id);
}

export async function getAllCachedStaff(): Promise<StaffInfo[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('staff_store');
}

// Attendee & Session Cache Operations
export async function cacheAttendees(attendees: any[]) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('attendees_store', 'readwrite');
  await tx.store.clear(); // Clear old cache
  for (const attendee of attendees) {
    tx.store.put(attendee);
  }
  await tx.done;
}

export async function cacheSessions(sessions: any[]) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('sessions_store', 'readwrite');
  await tx.store.clear();
  for (const session of sessions) {
    tx.store.put(session);
  }
  await tx.done;
}

export async function searchOfflineAttendees(query: string, filters: { sessionSlug?: string, place?: string, onlyUnchecked?: boolean }): Promise<any[]> {
  if (!dbPromise || !query.trim() && !filters.sessionSlug && !filters.place) return [];
  const db = await dbPromise;
  
  // To keep it simple, we fetch all from store and filter in memory, 
  // since the number of attendees is likely < 50,000 which is fast enough in JS.
  const allAttendees = await db.getAll('attendees_store');
  const lowerQuery = query.toLowerCase();
  
  return allAttendees.filter(a => {
    // Search match
    const matchesSearch = !query.trim() || 
      (a.name && a.name.toLowerCase().includes(lowerQuery)) ||
      (a.phone && a.phone.includes(query)) ||
      (a.registration_id && a.registration_id.toLowerCase().includes(lowerQuery));
      
    if (!matchesSearch) return false;
    
    // Filter match
    if (filters.sessionSlug && a.session_slug !== filters.sessionSlug) return false;
    if (filters.place && a.place !== filters.place) return false;
    if (filters.onlyUnchecked && a.checked_in) return false;
    
    return true;
  }).slice(0, 50); // Limit results
}

export async function getOfflineSessions(): Promise<any[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('sessions_store');
}
