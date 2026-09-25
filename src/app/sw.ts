/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Listen for background sync events
self.addEventListener("sync", (event: SyncEvent) => {
  if (event.tag === "sync-checkins") {
    console.log("[Service Worker] Syncing check-ins...");
    // The actual sync logic can be handled by notifying the client via postMessage
    // or doing the fetch here. For simplicity and access to complex state (Supabase client),
    // we notify the client that the network is back, and the client handles the sync.
    // However, if the client is closed, we'd need to do it here.
    
    // In our robust plan, we will handle sync when the client is online via `window.addEventListener('online')`
    // combined with the ServiceWorker for advanced background sync if needed.
    // To keep the initial offline IndexedDB transition simple, we rely on the client's online event.
  }
});
