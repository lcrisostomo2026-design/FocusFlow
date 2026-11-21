export function playCompletionChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return;
    }
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5 soft triad
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.14);

      gain.gain.setValueAtTime(0.0001, now + index * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.14 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.14 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + index * 0.14);
      osc.stop(now + index * 0.14 + 0.95);
    });
  } catch {
    // Ignore audio context restriction errors
  }
}
