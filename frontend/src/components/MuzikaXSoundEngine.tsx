'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
type SoundProfile = 'natural' | 'deep-bass' | 'clarity' | 'party' | 'focus' | 'vocal-boost' | 'dance' | 'custom' | 'ai-smart';
type ReverbPreset = 'none' | 'room' | 'hall' | 'concert' | 'club';

interface EQSettings {
  bass: number; // 60Hz
  lowMid: number; // 250Hz
  mid: number; // 1kHz
  highMid: number; // 4kHz
  treble: number; // 16kHz
}

interface SpatialAudioSettings {
  width: number; // Stereo width 0-100
  position: number; // Left/Right balance -100 to 100
  distance: number; // Distance simulation 0-100
}

interface SavedPreset {
  id: string;
  name: string;
  profile: SoundProfile;
  eqSettings: EQSettings;
  bassBoostIntensity: number;
  spatialAudio: SpatialAudioSettings;
  isStereoEnhanced: boolean;
  isBeatReactive: boolean;
  createdAt: number;
}

interface MuzikaXSoundEngineProps {
  audioElement: HTMLAudioElement | null;
  onClose: () => void;
  existingAudioContext?: AudioContext | null; // Optional: reuse existing context
  existingAnalyser?: AnalyserNode | null; // Optional: reuse existing analyser
}

export default function MuzikaXSoundEngine({ audioElement, onClose, existingAudioContext, existingAnalyser }: MuzikaXSoundEngineProps) {
  const [activeProfile, setActiveProfile] = useState<SoundProfile>('natural');
  const [bassBoostIntensity, setBassBoostIntensity] = useState(0);
  const [eqSettings, setEqSettings] = useState<EQSettings>({
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    treble: 0
  });
  const [spatialAudio, setSpatialAudio] = useState<SpatialAudioSettings>({
    width: 100,
    position: 0,
    distance: 0
  });
  const [reverbPreset, setReverbPreset] = useState<ReverbPreset>('none');
  const [isStereoEnhanced, setIsStereoEnhanced] = useState(false);
  const [isBeatReactive, setIsBeatReactive] = useState(false);
  const [isAILearning, setIsAILearning] = useState(false);
  const [aiConfidence, setAIConfidence] = useState(0);
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [currentGenre, setCurrentGenre] = useState<string>('Unknown');
  const [audioAnalysis, setAudioAnalysis] = useState({
    bassLevel: 0,
    midLevel: 0,
    highLevel: 0,
    dynamicRange: 0
  });
  const [isInitialized, setIsInitialized] = useState(false); // Track initialization state
  const [initError, setInitError] = useState<string | null>(null); // Track errors
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const stereoNodeRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const learningDataRef = useRef<number[]>([]);

  // Load saved presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('muzikax_sound_presets');
    if (saved) {
      try {
        const presets = JSON.parse(saved);
        setSavedPresets(presets);
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
    
    // Load last used settings
    const lastSettings = localStorage.getItem('muzikax_last_settings');
    if (lastSettings) {
      try {
        const settings = JSON.parse(lastSettings);
        setActiveProfile(settings.activeProfile || 'natural');
        setBassBoostIntensity(settings.bassBoostIntensity || 0);
        setEqSettings(settings.eqSettings || { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 });
        setSpatialAudio(settings.spatialAudio || { width: 100, position: 0, distance: 0 });
        setIsStereoEnhanced(settings.isStereoEnhanced || false);
        setIsBeatReactive(settings.isBeatReactive || false);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      activeProfile,
      bassBoostIntensity,
      eqSettings,
      spatialAudio,
      isStereoEnhanced,
      isBeatReactive
    };
    localStorage.setItem('muzikax_last_settings', JSON.stringify(settings));
  }, [activeProfile, bassBoostIntensity, eqSettings, spatialAudio, isStereoEnhanced, isBeatReactive]);

  // Initialize Web Audio API - MOBILE OPTIMIZED & STABLE
  useEffect(() => {
    if (!audioElement || audioContextRef.current || isInitialized) return;

    const initAudioEngine = async () => {
      try {
        setInitError(null);
        
        // Use existing context from AudioPlayerContext if available, otherwise create new one
        const ctx = existingAudioContext || new AudioContext();
        
        // Mobile: Resume audio context (required for iOS Safari)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        
        // Verify audio element has crossorigin for cross-origin audio
        if (!audioElement.hasAttribute('crossorigin')) {
          console.warn('⚠️ Audio missing crossorigin attribute');
        }

        let source: MediaElementAudioSourceNode;
        
        // Attempt to create source node
        try {
          source = ctx.createMediaElementSource(audioElement);
        } catch (e: any) {
          if (e.message.includes('already connected')) {
            // Audio already connected elsewhere - this is OK
            console.log('ℹ️ Audio already connected to Web Audio API');
            setIsInitialized(true);
            return; // Exit gracefully, don't create duplicate chain
          }
          throw e;
        }
        
        // Create optimized 5-band EQ nodes
        const eqFilters: BiquadFilterNode[] = [];
        const frequencies = [60, 250, 1000, 4000, 16000];
        
        frequencies.forEach((freq, index) => {
          const filter = ctx.createBiquadFilter();
          // Use appropriate filter types for each band
          filter.type = index === 0 ? 'lowshelf' : index === 4 ? 'highshelf' : 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = index === 0 || index === 4 ? 0.7 : 1.0; // Optimized Q values
          filter.gain.value = 0;
          eqFilters.push(filter);
        });

        // Create stereo panner
        const stereo = ctx.createStereoPanner();
        stereo.pan.value = 0;

        // Create gain node (unity gain)
        const gain = ctx.createGain();
        gain.gain.value = 1;

        // Use existing analyser or create new one
        const analyzer = existingAnalyser || ctx.createAnalyser();
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.8; // Smoother readings

        // Build audio chain: source → EQ → stereo → gain → analyzer → destination
        source.connect(eqFilters[0]);
        
        // Connect EQ filters in series
        for (let i = 0; i < eqFilters.length - 1; i++) {
          eqFilters[i].connect(eqFilters[i + 1]);
        }
        
        // Connect last EQ to stereo
        eqFilters[eqFilters.length - 1].connect(stereo);
        stereo.connect(gain);
        gain.connect(analyzer);
        
        // Only connect to destination if we created the analyzer
        if (!existingAnalyser) {
          analyzer.connect(ctx.destination);
        }

        // Store all refs
        audioContextRef.current = ctx;
        sourceNodeRef.current = source;
        eqNodesRef.current = eqFilters;
        stereoNodeRef.current = stereo;
        gainNodeRef.current = gain;
        analyzerRef.current = analyzer;

        setIsInitialized(true);
        console.log('✅ Sound Engine initialized successfully');

        // Cleanup function
        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
          try {
            // Disconnect all nodes safely
            source.disconnect();
            eqFilters.forEach(f => f.disconnect());
            stereo.disconnect();
            gain.disconnect();
            if (!existingAnalyser && analyzerRef.current) {
              analyzerRef.current.disconnect();
            }
          } catch (e) {
            // Ignore disconnect errors
          }
          
          // Only close context if we created it (not shared)
          if (!existingAudioContext) {
            // Delay closure to prevent audio pops
            setTimeout(() => {
              try {
                ctx.close();
              } catch (e) {
                // Ignore close errors
              }
            }, 200);
          }
          
          setIsInitialized(false);
        };
        
      } catch (error) {
        console.error('❌ Sound Engine init failed:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown error');
        setIsInitialized(false);
      }
    };

    // Initialize with small delay to ensure audio element is ready
    const timer = setTimeout(initAudioEngine, 50);
    return () => clearTimeout(timer);
    
  }, [audioElement, existingAudioContext, existingAnalyser, isInitialized]);

  // Sound profiles configuration
  const applySoundProfile = useCallback((profile: SoundProfile) => {
    const eqNodes = eqNodesRef.current;
    const ctx = audioContextRef.current;
    if (!eqNodes.length || !ctx) return;

    const profiles: Omit<Record<SoundProfile, EQSettings>, 'custom' | 'ai-smart'> = {
      'natural': { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
      'deep-bass': { bass: 9, lowMid: 5, mid: -2, highMid: 3, treble: 4 },
      'clarity': { bass: -2, lowMid: 3, mid: 5, highMid: 7, treble: 9 },
      'party': { bass: 7, lowMid: 4, mid: 2, highMid: 5, treble: 7 },
      'focus': { bass: 3, lowMid: 4, mid: 6, highMid: 4, treble: 3 },
      'vocal-boost': { bass: -3, lowMid: 3, mid: 7, highMid: 5, treble: 2 },
      'dance': { bass: 8, lowMid: 6, mid: 0, highMid: 6, treble: 8 }
    };

    const settings = profiles[profile as Exclude<SoundProfile, 'custom' | 'ai-smart'>] || profiles['natural'];
    const keys = Object.keys(settings) as Array<keyof EQSettings>;
    
    keys.forEach((key, index) => {
      eqNodes[index].gain.setTargetAtTime(settings[key], ctx.currentTime, 0.1);
    });

    setEqSettings(settings);
    setActiveProfile(profile);
    setBassBoostIntensity(0); // Reset bass boost when changing profiles
  }, []);

  // AI Smart Analysis - Analyze audio frequencies in real-time
  const analyzeAudio = useCallback(() => {
    const analyzer = analyzerRef.current;
    if (!analyzer) return;

    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(dataArray);

    // Calculate frequency bands
    const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const mids = dataArray.slice(10, 50).reduce((a, b) => a + b, 0) / 40;
    const highs = dataArray.slice(50, 128).reduce((a, b) => a + b, 0) / 78;
    const dynamic = Math.max(...dataArray) - Math.min(...dataArray);

    setAudioAnalysis({
      bassLevel: bass,
      midLevel: mids,
      highLevel: highs,
      dynamicRange: dynamic
    });

    // AI Learning - detect user preferences
    if (isAILearning) {
      learningDataRef.current.push(bass);
      if (learningDataRef.current.length > 300) { // 5 seconds at 60fps
        const avgBass = learningDataRef.current.reduce((a, b) => a + b, 0) / learningDataRef.current.length;
        
        // AI suggests optimal settings based on genre detection
        let detectedGenre = 'Unknown';
        let suggestedProfile: SoundProfile = 'natural';
        
        if (avgBass > 220) {
          detectedGenre = 'EDM/Hip-Hop';
          suggestedProfile = 'deep-bass';
        } else if (avgBass > 180 && mids > 200) {
          detectedGenre = 'Rock/Pop';
          suggestedProfile = 'party';
        } else if (highs > 180 && mids < 150) {
          detectedGenre = 'Classical/Jazz';
          suggestedProfile = 'clarity';
        } else if (mids > 180 && bass < 150) {
          detectedGenre = 'Vocal/Acoustic';
          suggestedProfile = 'vocal-boost';
        }

        setCurrentGenre(detectedGenre);
        setAIConfidence(Math.min(100, Math.floor((learningDataRef.current.length / 300) * 100)));
        
        learningDataRef.current = [];
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isAILearning]);

  // Start AI analysis when beat reactive or AI learning is enabled
  useEffect(() => {
    if ((isBeatReactive || isAILearning) && analyzerRef.current) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isBeatReactive, isAILearning, analyzeAudio]);

  // AI Auto-Optimize - Suggest best settings for current track
  const handleAIOptimize = useCallback(() => {
    const { bassLevel, midLevel, highLevel } = audioAnalysis;
    
    // AI determines optimal EQ based on audio content
    if (bassLevel < 150) {
      // Track is bass-light, boost it
      handleEQChange('bass', 6);
      handleEQChange('lowMid', 3);
    } else if (bassLevel > 220) {
      // Track is bass-heavy, reduce to prevent distortion
      handleEQChange('bass', -2);
      handleEQChange('lowMid', 1);
    }
    
    if (midLevel < 150) {
      // Vocals are quiet, boost them
      handleEQChange('mid', 5);
      handleEQChange('highMid', 3);
    }
    
    if (highLevel < 120) {
      // Track lacks clarity, add sparkle
      handleEQChange('treble', 4);
      handleEQChange('highMid', 3);
    }

    // Enable stereo enhancement for wider sound
    setIsStereoEnhanced(true);
    
    // Set moderate bass boost
    setBassBoostIntensity(40);
    
    setActiveProfile('ai-smart');
    
    // Show notification
    showNotification('AI Optimization Applied! 🤖✨');
  }, [audioAnalysis]);

  // Notification system
  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.5)] animate-slideUp font-bold flex items-center gap-2';
    notification.innerHTML = `<span>✨</span> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  };

  // Save current preset
  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      profile: activeProfile,
      eqSettings: { ...eqSettings },
      bassBoostIntensity,
      spatialAudio: { ...spatialAudio },
      isStereoEnhanced,
      isBeatReactive,
      createdAt: Date.now()
    };
    
    const updatedPresets = [...savedPresets, newPreset];
    setSavedPresets(updatedPresets);
    localStorage.setItem('muzikax_sound_presets', JSON.stringify(updatedPresets));
    
    setPresetName('');
    setShowSavePreset(false);
    showNotification(`Preset "${newPreset.name}" saved! 💾`);
  };

  // Load saved preset
  const handleLoadPreset = (preset: SavedPreset) => {
    setActiveProfile(preset.profile);
    setEqSettings(preset.eqSettings);
    setBassBoostIntensity(preset.bassBoostIntensity);
    setSpatialAudio(preset.spatialAudio);
    setIsStereoEnhanced(preset.isStereoEnhanced);
    setIsBeatReactive(preset.isBeatReactive);
    showNotification(`Loaded "${preset.name}" 🎵`);
  };

  // Delete saved preset
  const handleDeletePreset = (id: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updatedPresets);
    localStorage.setItem('muzikax_sound_presets', JSON.stringify(updatedPresets));
    showNotification('Preset deleted 🗑️');
  };

  // Toggle AI Learning mode
  const toggleAILearning = () => {
    setIsAILearning(!isAILearning);
    learningDataRef.current = [];
    if (!isAILearning) {
      showNotification('AI Learning Mode Enabled 🧠');
    } else {
      showNotification('AI Learning Mode Disabled');
    }
  };

  // Apply bass boost intensity
  useEffect(() => {
    const eqNodes = eqNodesRef.current;
    const ctx = audioContextRef.current;
    if (!eqNodes[0] || !ctx) return;

    const intensity = (bassBoostIntensity / 100) * 15; // Max 15dB boost
    eqNodes[0].gain.setTargetAtTime(intensity, ctx.currentTime, 0.1);
  }, [bassBoostIntensity]);

  // Apply spatial audio positioning
  useEffect(() => {
    const stereo = stereoNodeRef.current;
    const ctx = audioContextRef.current;
    if (!stereo || !ctx) return;

    const panValue = spatialAudio.position / 100;
    stereo.pan.setTargetAtTime(panValue, ctx.currentTime, 0.1);
  }, [spatialAudio.position]);

  // Toggle stereo enhancer
  useEffect(() => {
    const eqNodes = eqNodesRef.current;
    const ctx = audioContextRef.current;
    if (!eqNodes[3] || !eqNodes[4] || !ctx) return;

    if (isStereoEnhanced) {
      eqNodes[3].gain.setTargetAtTime(5, ctx.currentTime, 0.1);
      eqNodes[4].gain.setTargetAtTime(7, ctx.currentTime, 0.1);
    } else {
      const currentSettings = activeProfile !== 'natural' 
        ? getProfileSettings(activeProfile)
        : eqSettings;
      eqNodes[3].gain.setTargetAtTime(currentSettings.highMid, ctx.currentTime, 0.1);
      eqNodes[4].gain.setTargetAtTime(currentSettings.treble, ctx.currentTime, 0.1);
    }
  }, [isStereoEnhanced, activeProfile]);

  // Helper function to get profile settings
  const getProfileSettings = (profile: SoundProfile): EQSettings => {
    const profiles: Omit<Record<SoundProfile, EQSettings>, 'custom' | 'ai-smart'> = {
      'natural': { bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0 },
      'deep-bass': { bass: 9, lowMid: 5, mid: -2, highMid: 3, treble: 4 },
      'clarity': { bass: -2, lowMid: 3, mid: 5, highMid: 7, treble: 9 },
      'party': { bass: 7, lowMid: 4, mid: 2, highMid: 5, treble: 7 },
      'focus': { bass: 3, lowMid: 4, mid: 6, highMid: 4, treble: 3 },
      'vocal-boost': { bass: -3, lowMid: 3, mid: 7, highMid: 5, treble: 2 },
      'dance': { bass: 8, lowMid: 6, mid: 0, highMid: 6, treble: 8 }
    };
    return profiles[profile as Exclude<SoundProfile, 'custom' | 'ai-smart'>] || profiles['natural'];
  };

  // Beat reactive effect
  useEffect(() => {
    if (!isBeatReactive || !analyzerRef.current) return;

    const analyzer = analyzerRef.current;
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    let animationId: number;

    const detectBeat = () => {
      analyzer.getByteFrequencyData(dataArray);
      
      // Calculate average bass frequency (first few bins)
      const bassAverage = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      
      // If bass is strong, apply temporary boost
      if (bassAverage > 200 && eqNodesRef.current[0] && audioContextRef.current) {
        const ctx = audioContextRef.current;
        const originalGain = eqSettings.bass + (bassBoostIntensity / 100) * 15;
        eqNodesRef.current[0].gain.setTargetAtTime(originalGain + 4, ctx.currentTime, 0.05);
        setTimeout(() => {
          eqNodesRef.current[0].gain.setTargetAtTime(originalGain, ctx.currentTime, 0.1);
        }, 150);
      }

      animationId = requestAnimationFrame(detectBeat);
    };

    detectBeat();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isBeatReactive, eqSettings, bassBoostIntensity]);

  // Handle individual EQ band change
  const handleEQChange = (band: keyof EQSettings, value: number) => {
    const eqNodes = eqNodesRef.current;
    const ctx = audioContextRef.current;
    
    setEqSettings(prev => ({ ...prev, [band]: value }));
    setActiveProfile('custom');

    if (eqNodes.length > 0 && ctx) {
      const bands: (keyof EQSettings)[] = ['bass', 'lowMid', 'mid', 'highMid', 'treble'];
      const index = bands.indexOf(band);
      eqNodes[index].gain.setTargetAtTime(value, ctx.currentTime, 0.1);
    }
  };

  // Apply preset instantly
  const applyQuickPreset = (type: 'cinema' | 'gaming' | 'podcast' | 'workout') => {
    const presets = {
      'cinema': { profile: 'party' as SoundProfile, bass: 7, stereo: true, beat: false },
      'gaming': { profile: 'clarity' as SoundProfile, bass: 5, stereo: true, beat: false },
      'podcast': { profile: 'vocal-boost' as SoundProfile, bass: 0, stereo: false, beat: false },
      'workout': { profile: 'dance' as SoundProfile, bass: 9, stereo: true, beat: true }
    };
    
    const preset = presets[type];
    applySoundProfile(preset.profile);
    setBassBoostIntensity(preset.bass);
    setIsStereoEnhanced(preset.stereo);
    setIsBeatReactive(preset.beat);
    
    const labels = {
      'cinema': '🎬 Cinema Mode',
      'gaming': '🎮 Gaming Mode',
      'podcast': '🎙️ Podcast Mode',
      'workout': '💪 Workout Mode'
    };
    
    showNotification(`${labels[type]} Activated!`);
  };

  // Reset all settings
  const handleReset = () => {
    applySoundProfile('natural');
    setBassBoostIntensity(0);
    setSpatialAudio({ width: 100, position: 0, distance: 0 });
    setIsStereoEnhanced(false);
    setIsBeatReactive(false);
    setReverbPreset('none');
    setIsAILearning(false);
    setAIConfidence(0);
    setCurrentGenre('Unknown');
    showNotification('All settings reset 🔄');
  };

  // Retry initialization if it failed
  const handleRetryInit = () => {
    setIsInitialized(false);
    setInitError(null);
    // Trigger re-initialization by clearing refs
    audioContextRef.current = null;
    sourceNodeRef.current = null;
    eqNodesRef.current = [];
  };

  return (
    <div 
      className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black via-black/95 to-transparent pb-8 pt-20 px-4 sm:px-8 animate-slideUp backdrop-blur-3xl border-t border-white/10 max-h-[85vh] overflow-y-auto"
      onTouchMove={(e) => e.stopPropagation()} // Prevent scroll conflicts
    >
      <div className="max-w-7xl mx-auto">
        {/* Error Banner - Show if initialization failed */}
        {initError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h4 className="font-bold text-red-300">Sound Engine Initialization Failed</h4>
                  <p className="text-sm text-red-200/70 mt-1">{initError}</p>
                  <p className="text-xs text-red-200/50 mt-2">Audio will continue playing normally. Some features may be unavailable.</p>
                </div>
              </div>
              <button
                onClick={handleRetryInit}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                🔄 Retry
              </button>
            </div>
          </div>
        )}

        {/* Close button for mobile - easier to dismiss */}
        <div className="flex justify-center mb-4 lg:hidden">
          <button
            onClick={onClose}
            className="w-12 h-1.5 bg-white/20 rounded-full active:bg-white/40 transition-all"
            aria-label="Close sound engine"
          />
        </div>
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/80 backdrop-blur-xl pb-4 -mx-4 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-pulse">
                🎧
              </div>
              {isAILearning && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-ping" />
              )}
              {!isInitialized && !initError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white/50 rounded-full animate-ping" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">MuzikaX Sound Engine</span>
                {isBeatReactive && (
                  <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 rounded-full animate-pulse font-bold shadow-[0_0_15px_rgba(168,85,247,0.6)]">
                    ⚡ AI ACTIVE
                  </span>
                )}
              </h3>
              <p className="text-sm text-white/50 mt-0.5 flex items-center gap-2">
                <span>🤖</span> AI-Powered Professional Audio Enhancement
                {currentGenre !== 'Unknown' && (
                  <span className="text-purple-300 font-semibold ml-2">• Detected: {currentGenre}</span>
                )}
                {!isInitialized && !initError && (
                  <span className="text-yellow-300 text-xs ml-2">• Initializing...</span>
                )}
                {initError && (
                  <span className="text-red-400 text-xs ml-2">• Error: {initError.substring(0, 30)}...</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white transition-all hover:bg-white/10 rounded-full hover:rotate-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* AI Quick Actions Bar */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-blue-900/50 rounded-2xl border border-purple-500/30 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAIOptimize}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_5px_20px_rgba(168,85,247,0.4)] flex items-center gap-2"
              >
                <span className="text-xl">🤖</span>
                <span>AI Optimize</span>
              </button>
              
              <button
                onClick={toggleAILearning}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${
                  isAILearning
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-[0_5px_20px_rgba(34,197,94,0.4)]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <span className="text-xl">{isAILearning ? '🧠' : '💡'}</span>
                <span>{isAILearning ? 'AI Learning...' : 'Learn My Taste'}</span>
              </button>

              <button
                onClick={() => setShowSavePreset(true)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span className="text-xl">💾</span>
                <span>Save Preset</span>
              </button>
            </div>

            {isAILearning && (
              <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-xl">
                <div className="text-xs text-white/50">AI Confidence:</div>
                <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${aiConfidence}%` }}
                  />
                </div>
                <div className="text-sm font-bold text-green-400 min-w-[3rem]">{aiConfidence}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Scenario Modes */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> Quick Scenario Modes
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'cinema', label: 'Cinema', icon: '🎬', desc: 'Immersive movie experience' },
              { id: 'gaming', label: 'Gaming', icon: '🎮', desc: 'Competitive audio edge' },
              { id: 'podcast', label: 'Podcast', icon: '🎙️', desc: 'Crystal clear voices' },
              { id: 'workout', label: 'Workout', icon: '💪', desc: 'Maximum energy boost' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => applyQuickPreset(mode.id as any)}
                className="p-4 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-2xl border border-white/10 transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{mode.icon}</div>
                <div className="text-sm font-bold text-white">{mode.label}</div>
                <div className="text-xs text-white/50 mt-1">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>
        {/* Sound Profiles */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider flex items-center gap-2">
            <span>🎛️</span> Premium Sound Profiles
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { id: 'natural', label: 'Natural', icon: '🎵', color: 'from-gray-500' },
              { id: 'deep-bass', label: 'Deep Bass', icon: '🔊', color: 'from-red-500' },
              { id: 'clarity', label: 'Clarity', icon: '✨', color: 'from-yellow-500' },
              { id: 'party', label: 'Party', icon: '🎉', color: 'from-orange-500' },
              { id: 'focus', label: 'Focus', icon: '🎯', color: 'from-green-500' },
              { id: 'vocal-boost', label: 'Vocal', icon: '🎤', color: 'from-cyan-500' },
              { id: 'dance', label: 'Dance', icon: '💃', color: 'from-pink-500' },
              { id: 'ai-smart', label: 'AI Smart', icon: '🤖', color: 'from-purple-500', special: true }
            ].map((profile) => (
              <button
                key={profile.id}
                onClick={() => applySoundProfile(profile.id as SoundProfile)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 group overflow-hidden ${
                  activeProfile === profile.id
                    ? `bg-gradient-to-br ${profile.color} to-purple-600 border-white/40 text-white shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-105`
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {profile.special && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                )}
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{profile.icon}</div>
                <div className="text-sm font-bold">{profile.label}</div>
                {activeProfile === profile.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/50" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 5-Band Equalizer */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎚️</span> Smart Equalizer
            </h4>
            <div className="flex justify-between gap-2 h-48 sm:h-56">
              {[
                { label: 'Bass', freq: '60Hz', setting: 'bass' as const, color: 'from-red-500' },
                { label: 'Low-Mid', freq: '250Hz', setting: 'lowMid' as const, color: 'from-orange-500' },
                { label: 'Mid', freq: '1kHz', setting: 'mid' as const, color: 'from-yellow-500' },
                { label: 'High-Mid', freq: '4kHz', setting: 'highMid' as const, color: 'from-green-500' },
                { label: 'Treble', freq: '16kHz', setting: 'treble' as const, color: 'from-blue-500' }
              ].map((band) => (
                <div key={band.label} className="flex flex-col items-center gap-2 flex-1 relative group">
                  {/* Touch-friendly hit area */}
                  <div className="absolute inset-0 -mx-2" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${band.color} to-transparent opacity-0 group-hover:opacity-20 group-active:opacity-30 rounded-lg transition-opacity`} />
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="0.5"
                    value={eqSettings[band.setting]}
                    onChange={(e) => handleEQChange(band.setting, parseFloat(e.target.value))}
                    className="w-full h-32 sm:h-40 appearance-none bg-white/10 rounded-lg cursor-pointer accent-purple-500 relative z-10 touch-none"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                  />
                  <div className={`text-xs sm:text-sm font-bold ${eqSettings[band.setting] !== 0 ? 'text-white' : 'text-white/50'}`}>
                    {eqSettings[band.setting] > 0 ? '+' : ''}{eqSettings[band.setting].toFixed(1)}
                  </div>
                  <div className="text-xs text-white/50 font-medium hidden sm:block">{band.label}</div>
                </div>
              ))}
            </div>
            {/* Mobile labels below sliders */}
            <div className="flex justify-between mt-2 sm:hidden">
              {['Bass', 'Low', 'Mid', 'High', 'Treble'].map((label, i) => (
                <div key={i} className="text-[10px] text-white/50 text-center w-1/5">{label}</div>
              ))}
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="space-y-4">
            {/* Bass Boost Intensity */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>🔥</span> Bass Boost Intensity
              </h4>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bassBoostIntensity}
                  onChange={(e) => setBassBoostIntensity(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-purple-900 to-purple-500 rounded-lg appearance-none cursor-pointer"
                />
                <div 
                  className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg pointer-events-none"
                  style={{ width: `${bassBoostIntensity}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-2">
                <span>Off</span>
                <span className="text-lg font-bold text-purple-400">{bassBoostIntensity}%</span>
                <span>Max 🔊</span>
              </div>
            </div>

            {/* Spatial Audio */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-5 border border-white/10">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>🌊</span> 3D Spatial Audio
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-white/50 mb-2">
                    <span>← Left</span>
                    <span className="font-bold text-blue-400">{spatialAudio.position > 0 ? `+${spatialAudio.position}` : spatialAudio.position}%</span>
                    <span>Right →</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={spatialAudio.position}
                    onChange={(e) => setSpatialAudio(prev => ({ ...prev, position: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Special Features */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsStereoEnhanced(!isStereoEnhanced)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isStereoEnhanced
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-blue-300 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">🎧</div>
                <div className="text-sm font-bold">Stereo+</div>
                <div className="text-xs text-white/50">Wider Sound</div>
              </button>
              <button
                onClick={() => setIsBeatReactive(!isBeatReactive)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  isBeatReactive
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-105 animate-pulse'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm font-bold">Beat Sync</div>
                <div className="text-xs text-white/50">AI Reactive</div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all text-sm font-bold border border-white/10 hover:scale-105 flex items-center gap-2"
          >
            <span>🔄</span> Reset All Settings
          </button>
          
          {activeProfile !== 'natural' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-purple-300 capitalize">{activeProfile.replace('-', ' ')} Active</span>
            </div>
          )}
          
          {isStereoEnhanced && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-blue-300">Stereo+ Enabled</span>
            </div>
          )}

          {isBeatReactive && (
            <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-full">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-pink-300">Beat Sync Active</span>
            </div>
          )}
        </div>

        {/* Saved Presets Section */}
        {savedPresets.length > 0 && (
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span>💾</span> Your Saved Presets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="relative p-4 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 group hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-bold text-white">{preset.name}</h5>
                      <p className="text-xs text-white/50 capitalize">{preset.profile.replace('-', ' ')}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="text-white/30 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete preset"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50 mb-3">
                    <span>Bass: {preset.bassBoostIntensity}%</span>
                    <span>•</span>
                    <span>{preset.isStereoEnhanced ? 'Stereo+' : 'Mono'}</span>
                    <span>•</span>
                    <span>{preset.isBeatReactive ? 'Beat Sync' : 'No Beat'}</span>
                  </div>
                  <button
                    onClick={() => handleLoadPreset(preset)}
                    className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all font-bold text-sm border border-purple-500/30"
                  >
                    ▶️ Load Preset
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Preset Modal */}
        {showSavePreset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>💾</span> Save Your Preset
              </h4>
              <p className="text-white/50 mb-6">Save your current sound settings for quick access later</p>
              
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Enter preset name (e.g., My Bass Boost)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-6"
                autoFocus
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSavePreset(false);
                    setPresetName('');
                  }}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_5px_20px_rgba(168,85,247,0.4)]"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
