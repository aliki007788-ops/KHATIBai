/** تلفظ با موتور گفتار مرورگر؛ اگر صدای عربی نصب نباشد ممکن است بی‌صدا بماند. */
export function speak(text: string) {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const v =
      voices.find((x) => x.lang.toLowerCase().startsWith("ar-iq")) ??
      voices.find((x) => x.lang.toLowerCase().startsWith("ar"));
    if (v) u.voice = v;
    u.lang = v?.lang ?? "ar-SA";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
