import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, SkipForward, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

type Props = {
  chapterIndex: number;
  paragraphs: string[];
  autoPlay: boolean;
  hasNext: boolean;
  onEnded: () => void;
  onStop: () => void;
};

// A Bangla voice is preferred, but browsers ship a different set of voices (and
// some ship none at all), so we fall back to the default voice rather than
// refusing to read. The reader still gets a spoken chapter either way.
function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("bn")) ??
    voices.find((voice) => /bangla|bengali/i.test(voice.name)) ??
    voices.find((voice) => voice.default) ??
    voices[0]
  );
}

export function ChapterListener({
  chapterIndex,
  paragraphs,
  autoPlay,
  hasNext,
  onEnded,
  onStop,
}: Props) {
  const { t } = useLanguage();
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [currentParagraph, setCurrentParagraph] = useState(0);

  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const sessionRef = useRef(0);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  // Voices load asynchronously in Chrome, so capture them whenever they arrive.
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const load = () => {
      voicesRef.current = synth.getVoices();
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, [supported]);

  const stop = useCallback(
    (notify = true) => {
      sessionRef.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(false);
      setPaused(false);
      if (notify) onStop();
    },
    [onStop],
  );

  const speak = useCallback(
    (index: number) => {
      if (!supported) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const session = (sessionRef.current += 1);
      const voice = pickVoice(voicesRef.current);
      const queue = paragraphs.map((text) => text.trim()).filter(Boolean);
      setCurrentParagraph(index);
      setSpeaking(true);
      setPaused(false);

      queue.forEach((text, i) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (voice) utterance.voice = voice;
        utterance.lang = voice?.lang ?? "bn-BD";
        utterance.rate = rateRef.current;
        utterance.pitch = 1;
        utterance.onstart = () => {
          if (session === sessionRef.current) setCurrentParagraph(i);
        };
        utterance.onend = () => {
          if (session !== sessionRef.current) return;
          if (i === queue.length - 1) {
            setSpeaking(false);
            onEnded();
          }
        };
        utterance.onerror = () => {
          if (session === sessionRef.current) setSpeaking(false);
        };
        synth.speak(utterance);
      });
    },
    [supported, paragraphs, onEnded],
  );

  // Auto-advance: whenever the shown chapter changes while listening is on, the
  // new chapter is read from the top, so chapters flow one into the next.
  useEffect(() => {
    if (!supported || !autoPlay) return;
    speak(0);
    return () => {
      // Cancel this chapter's queued speech before the next one starts.
      sessionRef.current += 1;
      window.speechSynthesis.cancel();
    };
  }, [supported, autoPlay, chapterIndex, speak]);

  if (!supported) {
    return (
      <div className="listen-bar listen-unsupported">
        <Headphones size={16} /> {t("reader.listenUnsupported")}
      </div>
    );
  }

  const playing = speaking && !paused;

  return (
    <div className="listen-bar">
      <div className="listen-left">
        <Headphones size={17} />
        <span className="listen-label">
          {playing ? t("reader.listenPlaying") : t("reader.listen")}
        </span>
      </div>
      <div className="listen-controls">
        <Button
          variant="ghost"
          size="icon"
          aria-label={playing ? t("reader.listenPause") : t("reader.listenResume")}
          onClick={() => {
            const synth = window.speechSynthesis;
            if (!speaking) {
              speak(currentParagraph);
              return;
            }
            if (paused) {
              synth.resume();
              setPaused(false);
            } else {
              synth.pause();
              setPaused(true);
            }
          }}
        >
          {playing ? <Pause /> : <Play />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("reader.listenStop")}
          disabled={!speaking}
          onClick={() => stop()}
        >
          <Square />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("reader.listenNext")}
          disabled={!hasNext}
          onClick={() => {
            setSpeaking(false);
            onEnded();
          }}
        >
          <SkipForward />
        </Button>
        <label className="listen-rate">
          {t("reader.listenRate")}
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.1}
            value={rate}
            onChange={(event) => {
              const next = Number(event.target.value);
              setRate(next);
              // Restart mid-chapter so the new speed takes effect immediately.
              if (speaking) speak(currentParagraph);
            }}
            aria-label={t("reader.listenRate")}
          />
        </label>
      </div>
      {playing && (
        <span className="listen-progress" aria-hidden="true">
          {currentParagraph + 1}/{paragraphs.length}
        </span>
      )}
    </div>
  );
}
