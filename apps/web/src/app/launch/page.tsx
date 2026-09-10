'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

// ============================================================================
// CONFIGURATION — SINGLE SOURCE OF TRUTH
// ============================================================================
const LAUNCH_CONFIG = {
  // Configurable destination URL:
  websiteUrl: '/',
  
  // Brand details (derived from official Mahal records):
  brandName: 'MAHEALL DIGITAL',
  brandSubtitle: 'MUNDUPARA MAHAL. NOW DIGITAL.',
  masjidName: 'MUNDUPARA MUHIYUDHEEN JUMA MASJID',
  mahalName: 'MUNDUPARA',
  tagline: 'ONE DIGITAL HOME FOR MUNDUPARA MAHAL.',
  subTagline: 'MUNDUPARA MAHAL. YOUR COMMUNITY.',
  heritageTag: 'ESTD. 1954 • REG. KSWB/CLT/2018/489',

  // Production Stage Timings (milliseconds) - Target ~35s total:
  durations: {
    countdownDigit: 1000,   // 1s per number (10 to 1) = 10s
    silencePause: 1500,     // 1.5s total blackout
    statement1: 2000,       // "FOR GENERATIONS,"
    statement2: 2400,       // "WE HAVE STAYED CONNECTED."
    statement3: 1600,       // "TODAY,"
    statement4: 2400,       // "WE TAKE THE NEXT STEP."
    brandReveal: 4200,      // Official Logo + MAHEALL DIGITAL Reveal
    featurePrayer: 2600,    // Feature 1: Prayer Times
    featurePassport: 2600,  // Feature 2: Member Passport
    featureCerts: 2600,     // Feature 3: Digital Certificates
    featureAnnounce: 2600,  // Feature 4: Announcements
    finalHome: 2000,        // "ONE DIGITAL HOME"
    finalMahal: 2000,       // "FOR OUR MAHAL."
    finalBrand: 2600,       // "MAHEALL DIGITAL: YOUR MAHAL. YOUR COMMUNITY."
    transition: 1800,       // Smooth morph to live website
  },

  // Test Mode Timings (milliseconds) - Fast rehearsal ~12s total:
  testDurations: {
    countdownDigit: 400,    // Only 3, 2, 1 in test mode
    silencePause: 600,
    statement1: 800,
    statement2: 900,
    statement3: 600,
    statement4: 900,
    brandReveal: 1600,
    featurePrayer: 1100,
    featurePassport: 1100,
    featureCerts: 1100,
    featureAnnounce: 1100,
    finalHome: 700,
    finalMahal: 700,
    finalBrand: 1000,
    transition: 1000,
  },
};

// ============================================================================
// STAGE SOUND ENGINE (Pure Web Audio API — No External Dependencies)
// ============================================================================
class StageSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
  }

  getMuted() {
    return this.isMuted;
  }

  playCountdownPulse(number: number) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const isIntense = number <= 3;

    // Sub oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isIntense ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isIntense ? 95 : 75, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + (isIntense ? 0.45 : 0.3));

    gain.gain.setValueAtTime(isIntense ? 0.4 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isIntense ? 0.45 : 0.3));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // High accent click/ping
    const ping = this.ctx.createOscillator();
    const pingGain = this.ctx.createGain();
    ping.type = 'sine';
    ping.frequency.setValueAtTime(isIntense ? 880 : 520, now);
    ping.frequency.exponentialRampToValueAtTime(200, now + 0.12);

    pingGain.gain.setValueAtTime(isIntense ? 0.08 : 0.04, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    ping.connect(pingGain);
    pingGain.connect(this.ctx.destination);
    ping.start(now);
    ping.stop(now + 0.15);
  }

  playZeroImpact() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(28, now + 0.8);

    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + 1.0);
  }

  playBrandReveal() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    // Harmonic institutional swell (Calm, resonant chord)
    const freqs = [174.61, 261.63, 349.23, 523.25]; // F3, C4, F4, C5
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07 / (idx + 1), now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 2.3);
    });
  }

  playFeatureStep() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(554.37, now + 0.2); // C#

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

const soundEngine = new StageSoundEngine();

// ============================================================================
// STAGE LAUNCH CONTROLLER COMPONENT
// ============================================================================
export default function StageLaunchPage() {
  // Scene stages:
  // 'STANDBY' -> 'COUNTDOWN' -> 'SILENCE' -> 'BRAND' -> 'FEATURES' -> 'FINAL' -> 'TRANSITION'
  const [scene, setScene] = useState<string>('STANDBY');
  const [countdownValue, setCountdownValue] = useState<number>(10);
  const [silenceStep, setSilenceStep] = useState<number>(0);
  const [featureStep, setFeatureStep] = useState<number>(0);
  const [finalStep, setFinalStep] = useState<number>(0);

  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOperatorPanel, setShowOperatorPanel] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Safe timer scheduler
  const schedule = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  }, []);

  // Get active durations based on mode
  const d = isTestMode ? LAUNCH_CONFIG.testDurations : LAUNCH_CONFIG.durations;

  // Check URL query param for ?test=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('test') === 'true' || params.get('mode') === 'test') {
        setIsTestMode(true);
      }
    }
  }, []);

  // Fullscreen state sync
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Elapsed time tracker when launch is running
  useEffect(() => {
    if (scene !== 'STANDBY' && scene !== 'TRANSITION') {
      const start = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scene]);

  // ==========================================================================
  // SCENE ORCHESTRATION
  // ==========================================================================

  // Step 6: Final transition into real website
  const executeTransition = useCallback(() => {
    clearAllTimers();
    setScene('TRANSITION');
    schedule(() => {
      window.location.href = LAUNCH_CONFIG.websiteUrl;
    }, d.transition);
  }, [clearAllTimers, d.transition, schedule]);

  // Step 5: Final Reveal & Brand Statement
  const runFinalScene = useCallback(() => {
    clearAllTimers();
    setScene('FINAL');
    setFinalStep(1); // "ONE DIGITAL HOME"

    schedule(() => {
      setFinalStep(2); // "FOR OUR MAHAL."
    }, d.finalHome);

    schedule(() => {
      setFinalStep(3); // "MAHEALL DIGITAL - YOUR MAHAL. YOUR COMMUNITY."
      soundEngine.playBrandReveal();
    }, d.finalHome + d.finalMahal);

    schedule(() => {
      executeTransition();
    }, d.finalHome + d.finalMahal + d.finalBrand);
  }, [clearAllTimers, d.finalBrand, d.finalHome, d.finalMahal, executeTransition, schedule]);

  // Step 4: Digital Features Sequence
  const runFeaturesScene = useCallback(() => {
    clearAllTimers();
    setScene('FEATURES');
    setFeatureStep(1); // 1. Prayer Times
    soundEngine.playFeatureStep();

    schedule(() => {
      setFeatureStep(2); // 2. Member Passport
      soundEngine.playFeatureStep();
    }, d.featurePrayer);

    schedule(() => {
      setFeatureStep(3); // 3. Certificates
      soundEngine.playFeatureStep();
    }, d.featurePrayer + d.featurePassport);

    schedule(() => {
      setFeatureStep(4); // 4. Announcements
      soundEngine.playFeatureStep();
    }, d.featurePrayer + d.featurePassport + d.featureCerts);

    schedule(() => {
      runFinalScene();
    }, d.featurePrayer + d.featurePassport + d.featureCerts + d.featureAnnounce);
  }, [clearAllTimers, d.featureAnnounce, d.featureCerts, d.featurePassport, d.featurePrayer, runFinalScene, schedule]);

  // Step 3: Brand Reveal Scene
  const runBrandScene = useCallback(() => {
    clearAllTimers();
    setScene('BRAND');
    soundEngine.playBrandReveal();

    schedule(() => {
      runFeaturesScene();
    }, d.brandReveal);
  }, [clearAllTimers, d.brandReveal, runFeaturesScene, schedule]);

  // Step 2: Silence & Message Scene
  const runSilenceScene = useCallback(() => {
    clearAllTimers();
    setScene('SILENCE');
    setSilenceStep(0); // Total blackout

    schedule(() => {
      setSilenceStep(1); // "FOR GENERATIONS,"
    }, d.silencePause);

    schedule(() => {
      setSilenceStep(2); // "WE HAVE STAYED CONNECTED."
    }, d.silencePause + d.statement1);

    schedule(() => {
      setSilenceStep(3); // "TODAY,"
    }, d.silencePause + d.statement1 + d.statement2);

    schedule(() => {
      setSilenceStep(4); // "WE TAKE THE NEXT STEP."
    }, d.silencePause + d.statement1 + d.statement2 + d.statement3);

    schedule(() => {
      runBrandScene();
    }, d.silencePause + d.statement1 + d.statement2 + d.statement3 + d.statement4);
  }, [clearAllTimers, d.silencePause, d.statement1, d.statement2, d.statement3, d.statement4, runBrandScene, schedule]);

  // Step 1: Countdown Scene
  const runCountdownScene = useCallback(() => {
    clearAllTimers();
    setScene('COUNTDOWN');
    const startNum = isTestMode ? 3 : 10;
    setCountdownValue(startNum);
    soundEngine.playCountdownPulse(startNum);

    let current = startNum;
    const tick = () => {
      current -= 1;
      if (current >= 1) {
        setCountdownValue(current);
        soundEngine.playCountdownPulse(current);
        schedule(tick, d.countdownDigit);
      } else {
        // Zero impact
        setCountdownValue(0);
        soundEngine.playZeroImpact();
        schedule(() => {
          runSilenceScene();
        }, 400);
      }
    };

    schedule(tick, d.countdownDigit);
  }, [clearAllTimers, d.countdownDigit, isTestMode, runSilenceScene, schedule]);

  // Start Launch Trigger (from Standby)
  const handleStartLaunch = useCallback(() => {
    soundEngine.init();
    soundEngine.setMute(isAudioMuted);
    runCountdownScene();
  }, [isAudioMuted, runCountdownScene]);

  // Restart Launch
  const handleRestart = useCallback(() => {
    clearAllTimers();
    setScene('STANDBY');
    setCountdownValue(isTestMode ? 3 : 10);
    setSilenceStep(0);
    setFeatureStep(0);
    setFinalStep(0);
    setElapsedSeconds(0);
  }, [clearAllTimers, isTestMode]);

  // Skip Current Scene
  const handleSkipScene = useCallback(() => {
    clearAllTimers();
    if (scene === 'STANDBY' || scene === 'COUNTDOWN') {
      runSilenceScene();
    } else if (scene === 'SILENCE') {
      runBrandScene();
    } else if (scene === 'BRAND') {
      runFeaturesScene();
    } else if (scene === 'FEATURES') {
      runFinalScene();
    } else if (scene === 'FINAL') {
      executeTransition();
    }
  }, [clearAllTimers, executeTransition, runBrandScene, runFeaturesScene, runFinalScene, runSilenceScene, scene]);

  // Toggle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Toggle Audio Mute
  const toggleMute = useCallback(() => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundEngine.setMute(next);
  }, [isAudioMuted]);

  // ==========================================================================
  // OPERATOR KEYBOARD SHORTCUTS
  // ==========================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Operator Drawer Toggle: Ctrl + Shift + L
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
        e.preventDefault();
        setShowOperatorPanel((prev) => !prev);
        return;
      }

      // If typing in an input, don't trigger stage hotkeys
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName?.toLowerCase())) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (scene === 'STANDBY') {
            handleStartLaunch();
          }
          break;
        case 'KeyR':
          e.preventDefault();
          handleRestart();
          break;
        case 'KeyS':
          e.preventDefault();
          handleSkipScene();
          break;
        case 'KeyW':
          e.preventDefault();
          // Emergency: Open Real Website Immediately
          window.location.href = LAUNCH_CONFIG.websiteUrl;
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (showOperatorPanel) {
            setShowOperatorPanel(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleRestart,
    handleSkipScene,
    handleStartLaunch,
    scene,
    showOperatorPanel,
    toggleFullscreen,
    toggleMute,
  ]);

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-1000 ${
        scene === 'TRANSITION' ? 'bg-[#F7F8F5]' : 'bg-[#022C27]'
      }`}
      style={{
        // Institutional CSS Variable Design System
        ['--brand-primary' as string]: '#063F35',
        ['--brand-primary-dark' as string]: '#022C27',
        ['--brand-secondary' as string]: '#0A5C4D',
        ['--brand-surface' as string]: '#FFFFFF',
        ['--brand-canvas' as string]: '#F7F8F5',
        ['--brand-border' as string]: '#D3E4DE',
      }}
    >
      {/* Background Architectural Subtle Ambient Grid */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          scene === 'TRANSITION' ? 'opacity-0' : 'opacity-25'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at center, #0A5C4D 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Subtle stage light bloom at center */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          scene === 'STANDBY' || scene === 'COUNTDOWN' || scene === 'BRAND'
            ? 'opacity-40'
            : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(10, 92, 77, 0.35) 0%, transparent 70%)',
        }}
      />

      {/* =================================================================== */}
      {/* SCENE 0: STANDBY / OPERATOR PRE-LAUNCH DECK                        */}
      {/* =================================================================== */}
      {scene === 'STANDBY' && (
        <section className="absolute inset-0 flex flex-col items-center justify-between p-8 sm:p-14 z-10 text-white animate-fade-in">
          {/* Top Bar: Masjid & Stage Readiness Badge */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold tracking-widest text-emerald-300 uppercase">
                  LIVE STAGE CONSOLE • 16:9 LED CALIBRATED
                </span>
                <span className="text-[11px] text-stone-400">
                  {LAUNCH_CONFIG.masjidName} • {LAUNCH_CONFIG.heritageTag}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isTestMode && (
                <span className="px-3 py-1 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold">
                  TEST REHEARSAL MODE (3S)
                </span>
              )}
              <button
                onClick={toggleFullscreen}
                type="button"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold tracking-wide transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN (F)'}</span>
              </button>
            </div>
          </div>

          {/* Center Stage: Minimal Hero Card & Launch Button */}
          <div className="flex flex-col items-center text-center max-w-2xl space-y-8 my-auto">
            {/* Architectural Logo Medallion (Un-recolored official logo on pure white architectural card) */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-3 shadow-2xl border border-[#D3E4DE] flex items-center justify-center">
              <Image
                src="/mundupara_logo.png"
                alt="Official Mahal Logo"
                width={120}
                height={120}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white leading-tight">
                {LAUNCH_CONFIG.brandName}
              </h1>
              <p className="text-sm sm:text-base text-stone-300 font-medium tracking-wide">
                Official Digital Platform Launch Presentation
              </p>
            </div>

            {/* Launch Primary CTA Button */}
            <button
              id="btn-start-launch"
              onClick={handleStartLaunch}
              type="button"
              className="group px-10 py-4 rounded-2xl bg-white hover:bg-stone-100 text-[#022C27] font-bold text-base sm:text-lg tracking-wider transition-all duration-200 shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-3 border-2 border-white"
            >
              <svg className="w-6 h-6 text-[#063F35] fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>START LAUNCH SEQUENCE</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#063F35]/10 text-[#063F35]">
                SPACE
              </span>
            </button>
          </div>

          {/* Bottom Bar: Operator Shortcut Cheat Sheet */}
          <div className="w-full flex flex-wrap items-center justify-between text-xs text-stone-400 gap-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-6">
              <span><strong className="text-white font-mono">SPACE</strong> Start</span>
              <span><strong className="text-white font-mono">R</strong> Restart</span>
              <span><strong className="text-white font-mono">S</strong> Skip Scene</span>
              <span><strong className="text-white font-mono">W</strong> Open Website</span>
              <span><strong className="text-white font-mono">M</strong> Mute/Unmute</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOperatorPanel(true)}
                className="hover:text-white transition underline underline-offset-4"
              >
                Operator Panel (<span className="font-mono">Ctrl+Shift+L</span>)
              </button>
              <span className="font-mono text-stone-500">Target: {LAUNCH_CONFIG.websiteUrl}</span>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* SCENE 1: COUNTDOWN (10 to 1)                                        */}
      {/* =================================================================== */}
      {scene === 'COUNTDOWN' && (
        <section className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
          <div className="relative flex flex-col items-center justify-center">
            {/* Ambient concentric pulse on final digits */}
            {countdownValue <= 3 && countdownValue > 0 && (
              <div className="absolute w-[450px] h-[450px] rounded-full border border-emerald-400/20 animate-ping pointer-events-none" />
            )}

            {/* Giant Cinematic Number */}
            <div
              key={countdownValue}
              className={`font-mono font-black select-none tracking-tighter leading-none transition-all duration-300 ${
                countdownValue <= 3 ? 'text-emerald-300 scale-105' : 'text-white scale-100'
              }`}
              style={{
                fontSize: 'clamp(140px, 26vw, 320px)',
                textShadow: '0 8px 40px rgba(0,0,0,0.6)',
              }}
            >
              {countdownValue > 0 ? countdownValue : ''}
            </div>

            {/* Sub-label */}
            <div className="mt-4 text-xs sm:text-sm font-mono tracking-widest uppercase text-stone-400">
              {countdownValue <= 3 && countdownValue > 0 ? (
                <span className="text-emerald-400 font-bold">ANTICIPATION</span>
              ) : (
                <span>COUNTDOWN</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* SCENE 2: SILENCE + TYPOGRAPHY REVEAL                                */}
      {/* =================================================================== */}
      {scene === 'SILENCE' && (
        <section className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white px-8 sm:px-16 text-center">
          {silenceStep === 0 && (
            // Pure total blackout
            <div className="w-full h-full bg-black" />
          )}

          {silenceStep >= 1 && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              {silenceStep === 1 && (
                <p
                  className="font-serif font-light text-stone-300 tracking-wide leading-tight"
                  style={{ fontSize: 'clamp(32px, 5.5vw, 68px)' }}
                >
                  FOR GENERATIONS,
                </p>
              )}

              {silenceStep === 2 && (
                <p
                  className="font-serif font-semibold text-white tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(36px, 6.5vw, 78px)' }}
                >
                  WE HAVE STAYED CONNECTED.
                </p>
              )}

              {silenceStep === 3 && (
                <p
                  className="font-serif font-light text-stone-300 tracking-wide leading-tight"
                  style={{ fontSize: 'clamp(32px, 5.5vw, 68px)' }}
                >
                  TODAY,
                </p>
              )}

              {silenceStep === 4 && (
                <p
                  className="font-serif font-bold text-emerald-200 tracking-tight leading-tight"
                  style={{ fontSize: 'clamp(38px, 7vw, 84px)' }}
                >
                  WE TAKE THE NEXT STEP.
                </p>
              )}

              <div className="pt-8 text-xs font-mono text-stone-400 tracking-widest uppercase">
                {LAUNCH_CONFIG.masjidName}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =================================================================== */}
      {/* SCENE 3: MAHEALL DIGITAL HERO REVEAL                               */}
      {/* =================================================================== */}
      {scene === 'BRAND' && (
        <section className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white px-8 text-center animate-fade-in">
          <div className="flex flex-col items-center space-y-8 max-w-3xl">
            {/* Official Logo Presentation:
                Authentic black logo, un-recolored, presented on a pure white architectural card */}
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-white p-4 shadow-2xl border border-[#D3E4DE] flex items-center justify-center transform transition-all duration-700 hover:scale-102">
              <Image
                src="/mundupara_logo.png"
                alt="Official Mahal Logo"
                width={180}
                height={180}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            {/* Brand Typography */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono tracking-widest uppercase">
                <span>{LAUNCH_CONFIG.masjidName}</span>
                <span className="text-emerald-500">•</span>
                <span>{LAUNCH_CONFIG.heritageTag}</span>
              </div>

              <h1
                className="font-serif font-black tracking-tight text-white leading-none"
                style={{ fontSize: 'clamp(44px, 7vw, 92px)' }}
              >
                {LAUNCH_CONFIG.brandName}
              </h1>

              <p
                className="text-stone-300 font-medium tracking-widest uppercase"
                style={{ fontSize: 'clamp(18px, 2.5vw, 28px)' }}
              >
                {LAUNCH_CONFIG.brandSubtitle}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* SCENE 4: DIGITAL WEBSITE FEATURES (Using Real Website UI)           */}
      {/* =================================================================== */}
      {scene === 'FEATURES' && (
        <section className="absolute inset-0 flex flex-col items-center justify-between p-8 sm:p-14 z-10 text-white animate-fade-in">
          {/* Top Scene Identifier */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center">
                <Image
                  src="/mundupara_logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                />
              </div>
              <span className="font-serif font-bold text-white text-base sm:text-lg">
                {LAUNCH_CONFIG.brandName}
              </span>
            </div>

            {/* Feature Sequence Indicator */}
            <div className="flex items-center gap-2 font-mono text-xs text-stone-300">
              <span className={featureStep === 1 ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                01 PRAYER TIMES
              </span>
              <span className="text-stone-600">/</span>
              <span className={featureStep === 2 ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                02 MEMBER PASSPORT
              </span>
              <span className="text-stone-600">/</span>
              <span className={featureStep === 3 ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                03 CERTIFICATES
              </span>
              <span className="text-stone-600">/</span>
              <span className={featureStep === 4 ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
                04 ANNOUNCEMENTS
              </span>
            </div>
          </div>

          {/* Center Card Stage: Real Component UI */}
          <div className="w-full max-w-4xl my-auto flex flex-col items-center justify-center">
            {/* FEATURE 1: PRAYER TIMES */}
            {featureStep === 1 && (
              <div className="w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-[#102522] border-2 border-[#D3E4DE] animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-[#063F35] animate-pulse" />
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#063F35]">
                      Prayer Times
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-[#063F35]/10 text-[#063F35] text-xs font-mono font-bold">
                    SHAFI&apos;I TIMETABLE • CONFIRMED
                  </span>
                </div>

                {/* 6 Prayers Strip */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
                  {[
                    { name: 'Fajr', azan: '05:08 AM', iq: '05:30' },
                    { name: 'Sunrise', azan: '06:18 AM', iq: '—' },
                    { name: 'Dhuhr', azan: '12:28 PM', iq: '12:40' },
                    { name: 'Asr', azan: '03:44 PM', iq: '03:55', next: true },
                    { name: 'Maghrib', azan: '06:32 PM', iq: '06:37' },
                    { name: 'Isha', azan: '07:42 PM', iq: '08:00' },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        p.next
                          ? 'bg-[#063F35]/10 border-2 border-[#063F35] text-[#063F35] scale-102 shadow-md'
                          : 'bg-stone-50 border-stone-200 text-stone-700'
                      }`}
                    >
                      <div className="text-[11px] font-bold uppercase">{p.name}</div>
                      <div className="text-base sm:text-lg font-mono font-black mt-1 text-[#102522]">
                        {p.azan}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">Iq: {p.iq}</div>
                    </div>
                  ))}
                </div>

                {/* Live Countdown Banner */}
                <div className="mt-6 p-4 rounded-2xl bg-[#063F35] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <span>Next Prayer:</span>
                    <span className="text-emerald-300 font-black">Asr (03:44 PM)</span>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-black text-emerald-300">
                    02 : 18 : 36
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 2: MEMBER PASSPORT */}
            {featureStep === 2 && (
              <div className="w-full bg-[#022C27] rounded-3xl p-6 sm:p-10 shadow-2xl text-white border-2 border-emerald-500/40 relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-mono font-bold">
                        DIGITAL HOUSEHOLD PASSPORT
                      </span>
                      <span className="px-3 py-1 rounded-lg bg-white/15 border border-white/20 text-white text-xs font-mono font-bold">
                        FAMILY #104
                      </span>
                      <span className="text-xs text-stone-300 font-medium">
                        Ward 3 - Valiya Parambu
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-3xl sm:text-4xl font-serif font-black text-white">
                        Baitul Noor
                      </h3>
                      <p className="text-xs text-stone-300">
                        {LAUNCH_CONFIG.masjidName} • Member Register
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                      <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Head of Family
                        </span>
                        <span className="font-bold text-white text-sm">Abdurahiman Musliyar</span>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Door / House No
                        </span>
                        <span className="font-bold font-mono text-white text-sm">14/280-B</span>
                      </div>
                      <div className="bg-white/10 p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Registered Members
                        </span>
                        <span className="font-bold text-emerald-300 text-sm font-mono">
                          6 Active Members
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instant QR Badge */}
                  <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center text-[#102522] shrink-0 mx-auto sm:mx-0">
                    <div className="w-24 h-24 bg-stone-900 rounded-lg flex items-center justify-center text-white font-mono text-xs font-bold">
                      VERIFIED QR
                    </div>
                    <span className="text-[10px] font-mono font-bold mt-2 text-[#063F35]">
                      INSTANT COUNTER SCAN
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURE 3: CERTIFICATES */}
            {featureStep === 3 && (
              <div className="w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-[#102522] border-2 border-[#D3E4DE] animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#063F35]">
                      Official Digital Certificates
                    </h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Tamper-proof, QR-verifiable issuance with official Mahal seal
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    OFFICIAL WAQF VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Mahal Membership',
                      ref: 'MAH/MEM/2026/089',
                      badge: 'PERMANENT RECORD',
                      desc: 'Official family membership credential for government & institutional purposes.',
                    },
                    {
                      title: 'Nikah Marriage Certificate',
                      ref: 'MAH/NKH/2026/042',
                      badge: 'OFFICIAL REGISTER',
                      desc: 'Registered Islamic marriage documentation with Wakf Board conformity.',
                    },
                    {
                      title: 'Madrasa NOC / Transfer',
                      ref: 'MAH/MDR/2026/115',
                      badge: 'SKIMVB ACCREDITED',
                      desc: 'Accredited certificate for Madrasa admissions and student records.',
                    },
                  ].map((cert) => (
                    <div
                      key={cert.title}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                          {cert.badge}
                        </span>
                        <h4 className="text-sm font-bold text-[#063F35] pt-1">{cert.title}</h4>
                        <p className="text-xs text-stone-600 leading-relaxed">{cert.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
                        <span>Ref: {cert.ref}</span>
                        <span className="text-emerald-700 font-bold">✓ VERIFIED</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURE 4: ANNOUNCEMENTS */}
            {featureStep === 4 && (
              <div className="w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-[#102522] border-2 border-[#D3E4DE] animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 animate-ping" />
                    <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#063F35]">
                      Community Announcements & Circulars
                    </h2>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-mono font-bold">
                    REAL-TIME BROADCAST
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      category: 'EVENT',
                      title: 'Students Cultural Fest & Annual Milad 2026',
                      desc: 'Join us for an evening of knowledge, culture and unity at the Main Masjid Auditorium.',
                      badge: 'HIGH PRIORITY',
                    },
                    {
                      category: 'FINANCE',
                      title: 'Monthly Mahal Pirivu & Madrasa Fee Online Collection',
                      desc: 'Members can now pay monthly pirivu collections and madrasa fees directly online through UPI.',
                      badge: 'OFFICIAL NOTICE',
                    },
                    {
                      category: 'WELFARE',
                      title: 'Free Medical Screening Camp by Mahal Relief Cell',
                      desc: 'Comprehensive health checkup, sugar, BP and doctor consultation at Mahal Community Hall.',
                      badge: 'COMMUNITY SERVICE',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#063F35]/10 text-[#063F35]">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 font-medium">
                            {item.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#102522]">{item.title}</h4>
                        <p className="text-xs text-stone-600">{item.desc}</p>
                      </div>
                      <span className="text-xs font-semibold text-[#063F35] shrink-0 self-end sm:self-center">
                        Read Circular →
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Feature Navigation Hint */}
          <div className="w-full flex items-center justify-center text-xs font-mono text-stone-400">
            INTEGRATED DIGITAL MAHAL OPERATING SYSTEM
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* SCENE 5: FINAL REVEAL & SMOOTH TRANSITION                          */}
      {/* =================================================================== */}
      {(scene === 'FINAL' || scene === 'TRANSITION') && (
        <section className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 text-center">
          <div
            className={`flex flex-col items-center space-y-8 max-w-4xl transition-all duration-1000 ${
              scene === 'TRANSITION'
                ? 'scale-90 -translate-y-8 opacity-80'
                : 'scale-100 translate-y-0 opacity-100'
            }`}
          >
            {/* Logo Medallion */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white p-3 shadow-2xl border border-[#D3E4DE] flex items-center justify-center">
              <Image
                src="/mundupara_logo.png"
                alt="Logo"
                width={140}
                height={140}
                className="object-contain w-full h-full"
                priority
              />
            </div>

            {/* Timed Statements */}
            <div className="space-y-4">
              {finalStep === 1 && (
                <h2
                  className="font-serif font-black tracking-tight text-white leading-tight animate-fade-in"
                  style={{ fontSize: 'clamp(38px, 6.5vw, 76px)' }}
                >
                  {LAUNCH_CONFIG.tagline}
                </h2>
              )}

              {finalStep === 2 && (
                <h2
                  className="font-serif font-black tracking-tight text-emerald-200 leading-tight animate-fade-in"
                  style={{ fontSize: 'clamp(42px, 7vw, 84px)' }}
                >
                  FOR OUR MAHAL.
                </h2>
              )}

              {finalStep >= 3 && (
                <div className="space-y-3 animate-fade-in">
                  <h1
                    className={`font-serif font-black tracking-tight leading-tight transition-colors duration-1000 ${
                      scene === 'TRANSITION' ? 'text-[#063F35]' : 'text-white'
                    }`}
                    style={{ fontSize: 'clamp(44px, 7.5vw, 92px)' }}
                  >
                    {LAUNCH_CONFIG.brandName}
                  </h1>

                  <p
                    className={`font-medium tracking-widest uppercase transition-colors duration-1000 ${
                      scene === 'TRANSITION' ? 'text-stone-600' : 'text-stone-300'
                    }`}
                    style={{ fontSize: 'clamp(18px, 2.8vw, 32px)' }}
                  >
                    {LAUNCH_CONFIG.subTagline}
                  </p>
                </div>
              )}
            </div>

            {/* Transitioning Indicator */}
            {scene === 'TRANSITION' && (
              <div className="pt-4 flex items-center gap-3 text-xs font-mono font-bold text-[#063F35] animate-pulse">
                <span>OPENING LIVE PLATFORM...</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================================================== */}
      {/* HIDDEN OPERATOR CONTROL DRAWER (CTRL + SHIFT + L)                   */}
      {/* =================================================================== */}
      {showOperatorPanel && (
        <aside
          role="dialog"
          aria-label="Operator Control Panel"
          className="fixed inset-y-0 right-0 w-full max-w-md bg-stone-950/95 backdrop-blur-xl border-l border-white/10 p-6 z-50 text-white shadow-2xl flex flex-col justify-between animate-slide-left"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-emerald-400">
                  STAGE OPERATOR PANEL
                </h3>
                <p className="text-[11px] text-stone-400">
                  Scene: <strong className="text-white">{scene}</strong> | Elapsed: {elapsedSeconds}s
                </p>
              </div>
              <button
                onClick={() => setShowOperatorPanel(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Scene Selectors */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-stone-400 block">
                Direct Scene Jump
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    handleRestart();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium transition"
                >
                  0. Standby
                </button>
                <button
                  onClick={() => {
                    soundEngine.init();
                    runCountdownScene();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium transition"
                >
                  1. Countdown
                </button>
                <button
                  onClick={() => {
                    runSilenceScene();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium transition"
                >
                  2. Silence &amp; Message
                </button>
                <button
                  onClick={() => {
                    runBrandScene();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium transition"
                >
                  3. Brand Reveal
                </button>
                <button
                  onClick={() => {
                    runFeaturesScene();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium transition"
                >
                  4. Features
                </button>
                <button
                  onClick={() => {
                    runFinalScene();
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-left font-medium transition"
                >
                  5. Final Statement
                </button>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono uppercase text-stone-400 block">
                Controls &amp; Modes
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-medium">Test Rehearsal Mode</span>
                <button
                  onClick={() => {
                    const next = !isTestMode;
                    setIsTestMode(next);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    isTestMode ? 'bg-amber-400 text-stone-900' : 'bg-white/10 text-stone-300'
                  }`}
                >
                  {isTestMode ? 'ON (3s Rehearsal)' : 'OFF (Production)'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-medium">Sound Output</span>
                <button
                  onClick={toggleMute}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    isAudioMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isAudioMuted ? 'MUTED' : 'UNMUTED'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xs font-medium">Display Mode</span>
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-white/10 text-white hover:bg-white/20 transition"
                >
                  {isFullscreen ? 'EXIT FULLSCREEN' : 'GO FULLSCREEN'}
                </button>
              </div>
            </div>
          </div>

          {/* Emergency / Failsafe Actions */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <button
              onClick={handleSkipScene}
              type="button"
              className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs tracking-wider transition font-mono flex items-center justify-center gap-2"
            >
              <span>SKIP CURRENT SCENE</span>
              <span className="text-stone-400">(S)</span>
            </button>

            <button
              onClick={() => {
                window.location.href = LAUNCH_CONFIG.websiteUrl;
              }}
              type="button"
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider transition shadow-lg flex items-center justify-center gap-2 uppercase font-mono"
            >
              <span>OPEN REAL WEBSITE NOW</span>
              <span className="text-emerald-200">(W)</span>
            </button>

            <p className="text-[10px] text-center text-stone-500 font-mono">
              Press ESC or Ctrl+Shift+L to dismiss panel
            </p>
          </div>
        </aside>
      )}
    </main>
  );
}
