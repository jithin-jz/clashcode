/**
 * Play a short ascending notification tone using the Web Audio API.
 * No external audio files needed.
 */
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Two quick ascending beeps
    const frequencies = [880, 1100];
    const duration = 0.08;
    const gap = 0.06;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + i * (duration + gap));

      gain.gain.setValueAtTime(0, now + i * (duration + gap));
      gain.gain.linearRampToValueAtTime(0.15, now + i * (duration + gap) + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + i * (duration + gap) + duration,
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * (duration + gap));
      osc.stop(now + i * (duration + gap) + duration);
    });

    // Auto-close audio context after sound finishes
    setTimeout(() => {
      if (ctx.state !== "closed") ctx.close();
    }, 500);
  } catch {
    // Silently fail if audio is blocked
  }
}
