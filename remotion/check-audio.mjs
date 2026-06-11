// Prüft, ob die gerenderten Intro-MP4s eine Tonspur haben (Mediabunny).
//   node check-audio.mjs
import { Input, ALL_FORMATS, FilePathSource } from "mediabunny";

for (const f of ["../assets/intro-de.mp4", "../assets/intro-en.mp4"]) {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new FilePathSource(new URL(f, import.meta.url).pathname.replace(/^\//, "")),
  });
  const audio = await input.getPrimaryAudioTrack();
  const dur = await input.computeDuration();
  console.log(
    `${f}: dauer=${dur.toFixed(2)}s, audio=${audio ? `ja (${audio.codec}, ${audio.sampleRate} Hz)` : "NEIN"}`
  );
}
