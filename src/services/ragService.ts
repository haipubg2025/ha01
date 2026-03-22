/**
 * RAG Service for AI Simulator
 * Handles embeddings and vector search
 */

import { GoogleGenAI } from "@google/genai";

export interface RagContext {
  content: string;
  similarity: number;
}

export class RagService {
  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    
    // If lengths differ, we can't compare them properly.
    // In a real app, we'd handle this more gracefully (e.g., re-embedding).
    const len = Math.min(vecA.length, vecB.length);
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    // Calculate norms for the full vectors if possible, but at least for the compared part
    for (let i = len; i < vecA.length; i++) normA += vecA[i] * vecA[i];
    for (let i = len; i < vecB.length; i++) normB += vecB[i] * vecB[i];

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Generate embedding for a text using Gemini API
   */
  static async generateEmbedding(text: string, config: { key: string, proxyUrl?: string, proxyKey?: string, mode: string }): Promise<number[]> {
    try {
      const modelName = "gemini-embedding-2-preview"; // Recommended embedding model
      
      const baseUrl = config.proxyUrl ? config.proxyUrl.replace(/\/$/, '') : 'https://generativelanguage.googleapis.com';
      const isProxy = config.mode === 'proxy1' && !!config.proxyUrl;
      
      let effectiveKey = "";
      if (isProxy) {
        effectiveKey = config.proxyKey || "";
      } else {
        const rawKey = config.key || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');
        if (rawKey) {
          const keys = rawKey.split(/[\n,]+/).map(k => k.trim()).filter(k => k && !k.startsWith('http'));
          if (keys.length > 0) {
            effectiveKey = keys[Math.floor(Math.random() * keys.length)];
          }
        }
      }
      
      if (!effectiveKey && !isProxy) {
        console.warn("No API key available for embedding generation.");
        return new Array(768).fill(0);
      }

      // Check if it's an OpenAI compatible endpoint
      const isOpenAI = isProxy && baseUrl.includes('/v1') && !baseUrl.includes('generativelanguage.googleapis.com');

      if (isOpenAI) {
        const response = await fetch(`${baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey}`
          },
          body: JSON.stringify({
            model: "text-embedding-3-small", // Common OpenAI embedding model
            input: text,
            dimensions: 768 // Match Gemini's default dimension
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data[0] && data.data[0].embedding) {
            return data.data[0].embedding;
          }
        }
        // If OpenAI embedding fails, try to fall back or throw
        console.warn("OpenAI embedding failed, falling back...");
      }

      // Standard Gemini or Google-compatible Proxy
      const tryFetch = async (apiVersion: string, model: string) => {
        const url = isProxy 
          ? `${baseUrl}/${apiVersion}/models/${model}:embedContent?key=${effectiveKey}`
          : `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:embedContent?key=${effectiveKey}`;
        
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (isProxy && config.proxyKey) {
          headers['Authorization'] = `Bearer ${config.proxyKey}`;
        }

        return fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            content: { parts: [{ text }] }
          })
        });
      };

      // Try sequence of models and API versions
      let response = await tryFetch('v1beta', isProxy ? 'gemini-embedding-001' : modelName);
      
      if (!response.ok && response.status === 404) {
        // Try v1 instead of v1beta
        response = await tryFetch('v1', isProxy ? 'gemini-embedding-001' : modelName);
      }

      if (!response.ok && response.status === 404) {
        // Try alternative model
        response = await tryFetch('v1beta', 'gemini-embedding-001');
      }

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding.values;
    } catch (error) {
      // If it's a "Failed to fetch" error, it's likely a network/CORS issue
      if (error instanceof Error && error.message === "Failed to fetch") {
        console.warn("Network error during embedding generation. This is likely a CORS or connectivity issue with the proxy/API.");
      } else {
        console.error("Error generating embedding:", error);
      }
      // Return a zero vector of size 768 (standard for gemini-embedding-001) 
      // so the app doesn't crash and RAG just doesn't find anything.
      return new Array(768).fill(0);
    }
  }

  /**
   * Search for relevant context in a list of items with embeddings
   */
  static search(queryEmbedding: number[], items: { content: string, embedding?: number[] }[], limit: number = 5): RagContext[] {
    if (!queryEmbedding || queryEmbedding.length === 0) return [];

    const results = items
      .filter(item => item.embedding && item.embedding.length > 0)
      .map(item => ({
        content: item.content,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding!)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }
}
