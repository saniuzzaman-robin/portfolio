/* eslint-disable @typescript-eslint/no-explicit-any */
// Sound effects utility using Web Audio API
const audioContext =
  typeof window !== 'undefined'
    ? new (window.AudioContext || (window as any).webkitAudioContext)()
    : null;

function playTone(
  frequency: number,
  duration: number,
  type: 'sine' | 'square' | 'sawtooth' = 'sine',
  volume: number = 0.3
) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

export const sounds = {
  // Eat/pickup sound - ascending beep
  eat: () => {
    playTone(400, 0.1, 'square', 0.25);
    setTimeout(() => playTone(600, 0.1, 'square', 0.25), 100);
  },

  // Game over/crash sound - descending beeps
  gameOver: () => {
    playTone(800, 0.15, 'square', 0.3);
    setTimeout(() => playTone(600, 0.15, 'square', 0.3), 150);
    setTimeout(() => playTone(400, 0.2, 'square', 0.3), 300);
  },

  // Start sound
  start: () => {
    playTone(600, 0.1, 'sine', 0.25);
    setTimeout(() => playTone(800, 0.1, 'sine', 0.25), 120);
  },

  // Tetris line clear - ascending tones
  lineClear: () => {
    playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 110);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 220);
  },

  // Block placed sound
  blockPlace: () => {
    playTone(330, 0.08, 'square', 0.2);
    setTimeout(() => playTone(440, 0.08, 'square', 0.2), 85);
  },

  // Card flip sound - quick beep
  flip: () => {
    playTone(800, 0.06, 'square', 0.15);
  },

  // Match sound - two ascending tones
  match: () => {
    playTone(600, 0.12, 'sine', 0.25);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.25), 130);
  },

  // Victory/win sound - ascending scale
  victory: () => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 150);
    });
  },

  // Mismatch sound - low tone
  mismatch: () => {
    playTone(300, 0.2, 'sine', 0.2);
  },
};
