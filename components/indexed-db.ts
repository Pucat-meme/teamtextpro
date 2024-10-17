'use client'

let db: IDBDatabase | null = null;

export interface User {
  id?: number;
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface Message {
  id?: number;
  channelId: number;
  userId: number;
  content: string;
  type: 'text' | 'image' | 'audio' | 'link';
  timestamp: number;
}

export interface Channel {
  id?: number;
  name: string;
}

const DB_NAME = 'DiscordLikeMessengerDB';
const DB_VERSION = 1;

export function openDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve();
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        usersStore.createIndex('username', 'username', { unique: true });
      }

      if (!db.objectStoreNames.contains('channels')) {
        const channelsStore = db.createObjectStore('channels', { keyPath: 'id', autoIncrement: true });
        channelsStore.createIndex('name', 'name', { unique: true });
      }

      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
        messagesStore.createIndex('channelId', 'channelId');
        messagesStore.createIndex('userId', 'userId');
        messagesStore.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

export async function addUser(user: User): Promise<number> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.add(user);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

export async function getUser(username: string): Promise<User | undefined> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('users', 'readonly');
    const store = transaction.objectStore('users');
    const index = store.index('username');
    const request = index.get(username);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function addChannel(channel: Channel): Promise<number> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('channels', 'readwrite');
    const store = transaction.objectStore('channels');
    const request = store.add(channel);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

export async function getChannels(): Promise<Channel[]> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('channels', 'readonly');
    const store = transaction.objectStore('channels');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function updateChannel(channel: Channel): Promise<void> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('channels', 'readwrite');
    const store = transaction.objectStore('channels');
    const request = store.put(channel);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteChannel(channelId: number): Promise<void> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction(['channels', 'messages'], 'readwrite');
    const channelStore = transaction.objectStore('channels');
    const messageStore = transaction.objectStore('messages');

    const deleteChannelRequest = channelStore.delete(channelId);
    deleteChannelRequest.onerror = () => reject(deleteChannelRequest.error);

    const messageIndex = messageStore.index('channelId');
    const messageRequest = messageIndex.openCursor(IDBKeyRange.only(channelId));

    messageRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };

    messageRequest.onerror = () => reject(messageRequest.error);
  });
}

export async function addMessage(message: Message): Promise<number> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.add(message);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as number);
  });
}

export async function getMessages(channelId: number): Promise<Message[]> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('messages', 'readonly');
    const store = transaction.objectStore('messages');
    const index = store.index('channelId');
    const request = index.getAll(IDBKeyRange.only(channelId));

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteMessage(messageId: number): Promise<void> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('messages', 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.delete(messageId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateUser(user: User): Promise<void> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.put(user);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('users', 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.delete(userId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAllUsers(): Promise<User[]> {
  await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db!.transaction('users', 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}