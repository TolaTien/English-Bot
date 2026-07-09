window.tts = {
  speak(text) {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Default config to UK English
    utterance.lang = "en-GB";
    utterance.rate = 0.85; // Slightly slower for clarity
    
    // Try to explicitly pick a high-quality UK voice if available
    const voices = window.speechSynthesis.getVoices();
    const ukVoices = voices.filter(v => v.lang.startsWith("en-GB") || v.lang.startsWith("en_GB"));
    
    if (ukVoices.length > 0) {
      // Try to pick a Google or Premium voice if possible, else just the first UK one
      const premiumVoice = ukVoices.find(v => v.name.includes("Premium") || v.name.includes("Google"));
      utterance.voice = premiumVoice || ukVoices[0];
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

// Force the browser to load voices immediately
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  // Chrome fires an event when voices are ready
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
