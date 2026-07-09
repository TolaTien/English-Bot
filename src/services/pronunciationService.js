const axios = require("axios");

const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function fetchPronunciation(word) {
  const key = word.trim().toLowerCase();
  
  // Check cache
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`
    );
    
    const entries = response.data;
    if (!Array.isArray(entries) || entries.length === 0) {
      cache.set(key, { data: null, timestamp: Date.now() });
      return null;
    }

    // Find first phonetic with audio
    let audioUrl = "";
    let phonetic = "";
    
    for (const entry of entries) {
      // Check top-level phonetic
      if (!phonetic && entry.phonetic) {
        phonetic = entry.phonetic;
      }
      
      if (Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (p.audio && !audioUrl) {
            audioUrl = p.audio;
          }
          if (p.text && !phonetic) {
            phonetic = p.text;
          }
          if (audioUrl && phonetic) break;
        }
      }
      if (audioUrl && phonetic) break;
    }

    const result = audioUrl ? { audioUrl, phonetic, source: "dictionary-api" } : null;
    cache.set(key, { data: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    // 404 means word not found - cache that too
    if (error.response && error.response.status === 404) {
      cache.set(key, { data: null, timestamp: Date.now() });
    }
    return null;
  }
}

module.exports = { fetchPronunciation };
