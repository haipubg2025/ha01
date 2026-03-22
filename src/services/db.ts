import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ai_simulator_db';
const DB_VERSION = 1;

export interface GameData {
  id: string;
  gameSettings: any;
  storyHistory: any[];
  chatHistoryForGemini: any[];
  knowledgeBase: any;
  memories: any[];
  worldKnowledge: any[];
  generatedScenes: any[];
  currentStory: string;
  currentChoices: any[];
  createdAt: string;
  lastUpdated: string;
  status: string;
}

export interface MemoryEntry {
  id: string;
  gameId: string;
  content: string;
  embedding?: number[];
  pinned: boolean;
  timestamp: number;
}

export interface KnowledgeEntry {
  id: string;
  gameId: string;
  content: string;
  embedding?: number[];
  enabled: boolean;
  timestamp: number;
}

export interface AppConfig {
  key: string;
  proxy1Url: string;
  proxy1Key: string;
  proxyName: string;
  mode: string;
  model: string;
  proxyModel: string;
  lastUpdated: string;
}

class DatabaseService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Games store
        if (!db.objectStoreNames.contains('games')) {
          db.createObjectStore('games', { keyPath: 'id' });
        }
        // Config store
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'id' });
        }
        // Memories store (for RAG)
        if (!db.objectStoreNames.contains('memories')) {
          const store = db.createObjectStore('memories', { keyPath: 'id' });
          store.createIndex('gameId', 'gameId');
        }
        // World Knowledge store (for RAG)
        if (!db.objectStoreNames.contains('knowledge')) {
          const store = db.createObjectStore('knowledge', { keyPath: 'id' });
          store.createIndex('gameId', 'gameId');
        }
      },
    });
  }

  // Config
  async saveConfig(config: AppConfig) {
    const db = await this.dbPromise;
    return db.put('config', { ...config, id: 'main' });
  }

  async getConfig(): Promise<AppConfig | null> {
    const db = await this.dbPromise;
    return db.get('config', 'main');
  }

  // Games
  async saveGame(game: GameData) {
    const db = await this.dbPromise;
    return db.put('games', game);
  }

  async getGame(id: string): Promise<GameData | null> {
    const db = await this.dbPromise;
    return db.get('games', id);
  }

  async getAllGames(): Promise<GameData[]> {
    const db = await this.dbPromise;
    return db.getAll('games');
  }

  async deleteGame(id: string) {
    const db = await this.dbPromise;
    await db.delete('games', id);
    // Also delete associated memories and knowledge
    const tx = db.transaction(['memories', 'knowledge'], 'readwrite');
    const memoriesStore = tx.objectStore('memories');
    const knowledgeStore = tx.objectStore('knowledge');
    
    const memories = await memoriesStore.index('gameId').getAllKeys(id);
    for (const key of memories) await memoriesStore.delete(key);
    
    const knowledge = await knowledgeStore.index('gameId').getAllKeys(id);
    for (const key of knowledge) await knowledgeStore.delete(key);
    
    return tx.done;
  }

  // Memories (RAG)
  async addMemory(memory: MemoryEntry) {
    const db = await this.dbPromise;
    return db.put('memories', memory);
  }

  async getMemoriesByGame(gameId: string): Promise<MemoryEntry[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('memories', 'gameId', gameId);
  }

  // Knowledge (RAG)
  async addKnowledge(knowledge: KnowledgeEntry) {
    const db = await this.dbPromise;
    return db.put('knowledge', knowledge);
  }

  async getKnowledgeByGame(gameId: string): Promise<KnowledgeEntry[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('knowledge', 'gameId', gameId);
  }
}

export const dbService = new DatabaseService();
