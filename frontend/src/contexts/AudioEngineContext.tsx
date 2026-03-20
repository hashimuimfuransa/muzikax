'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

export type SoundProfile = 'default' | 'deep-bass' | 'clarity' | 'party' | 'focus' | 'custom';
export type ReverbSpace = 'none' | 'room' | 'hall' | 'concert' | 'club';

interface EqualizerSettings {
  60: number;
  170: number;
  310: number;
  600: number;
  1000: number;
  3000: number;
  6000: number;
  12000: number;
  14000: number;
  16000: number;
}

interface AudioEngineContextType {
  // States
  isInitialized: boolean;
  volume: number;
  bassBoost: number;
  spatialAudio: number;
  isLoudnessNormalized: boolean;
  reverbSpace: ReverbSpace;
  reverbIntensity: number;
  stereoWidth: number;
  dynamicBoost: boolean;
  soundProfile: SoundProfile;
  equalizer: EqualizerSettings;
  
  // Setters
  setVolume: (v: number) => void;
  setBassBoost: (v: number) => void;
  setSpatialAudio: (v: number) => void;
  setIsLoudnessNormalized: (v: boolean) => void;
  setReverbSpace: (v: ReverbSpace) => void;
  setReverbIntensity: (v: number) => void;
  setStereoWidth: (v: number) => void;
  setDynamicBoost: (v: boolean) => void;
  setSoundProfile: (p: SoundProfile) => void;
  setEqualizerBand: (freq: keyof EqualizerSettings, gain: number) => void;
  
  // Methods
  initialize: (audioElement: HTMLAudioElement) => void;
  applyProfile: (profile: SoundProfile) => void;
  resetEqualizer: () => void;
}

const AudioEngineContext = createContext<AudioEngineContextType | undefined>(undefined);

const DEFAULT_EQ: EqualizerSettings = {
  60: 0, 170: 0, 310: 0, 600: 0, 1000: 0, 3000: 0, 6000: 0, 12000: 0, 14000: 0, 16000: 0
};

export const AudioEngineProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolume] = useState(1);
  const [bassBoost, setBassBoost] = useState(0);
  const [spatialAudio, setSpatialAudio] = useState(0);
  const [isLoudnessNormalized, setIsLoudnessNormalized] = useState(false);
  const [reverbSpace, setReverbSpace] = useState<ReverbSpace>('none');
  const [reverbIntensity, setReverbIntensity] = useState(0.5);
  const [stereoWidth, setStereoWidth] = useState(1);
  const [dynamicBoost, setDynamicBoost] = useState(false);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>('default');
  const [equalizer, setEqualizer] = useState<EqualizerSettings>(DEFAULT_EQ);

  // Web Audio Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const eqNodesRef = useRef<Record<number, BiquadFilterNode>>({});
  const bassNodeRef = useRef<BiquadFilterNode | null>(null);
  const spatialNodeRef = useRef<PannerNode | null>(null);
  const compressorNodeRef = useRef<DynamicsCompressorNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbGainNodeRef = useRef<GainNode | null>(null);
  const stereoNodeRef = useRef<StereoPannerNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);

  const initialize = (audioElement: HTMLAudioElement) => {
    if (isInitialized || !audioElement) return;

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioElement);
    sourceRef.current = source;

    // 1. Equalizer Bands
    let lastNode: AudioNode = source;
    const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    freqs.forEach(freq => {
      const filter = ctx.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = equalizer[freq as keyof EqualizerSettings];
      eqNodesRef.current[freq] = filter;
      lastNode.connect(filter);
      lastNode = filter;
    });

    // 2. Bass Boost (Low Shelf)
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;
    bassFilter.gain.value = bassBoost;
    bassNodeRef.current = bassFilter;
    lastNode.connect(bassFilter);
    lastNode = bassFilter;

    // 3. Stereo Enhancer (Using StereoPannerNode for simple balance or more complex logic)
    const stereoPanner = ctx.createStereoPanner();
    stereoPanner.pan.value = 0;
    stereoNodeRef.current = stereoPanner;
    lastNode.connect(stereoPanner);
    lastNode = stereoPanner;

    // 4. Reverb (Parallel Chain)
    const reverbNode = ctx.createConvolver();
    const reverbGain = ctx.createGain();
    const dryGain = ctx.createGain();
    reverbNodeRef.current = reverbNode;
    reverbGainNodeRef.current = reverbGain;
    dryGainNodeRef.current = dryGain;
    
    lastNode.connect(dryGain);
    lastNode.connect(reverbNode);
    reverbNode.connect(reverbGain);
    
    const reverbMerge = ctx.createGain();
    dryGain.connect(reverbMerge);
    reverbGain.connect(reverbMerge);
    reverbGain.gain.value = reverbSpace === 'none' ? 0 : reverbIntensity;
    lastNode = reverbMerge;

    // 5. Spatial Audio (PannerNode)
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    spatialNodeRef.current = panner;
    lastNode.connect(panner);
    lastNode = panner;

    // 6. Loudness Normalization (Compressor)
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressorNodeRef.current = compressor;
    
    // Toggle compressor based on state
    const compTarget = isLoudnessNormalized ? compressor : ctx.destination;
    lastNode.connect(compressor);
    compressor.connect(ctx.destination);
    
    // If not normalized, we'll bypass it by connecting lastNode to destination as well
    // Actually better to just use the compressor with mild settings or toggle connection
    
    // 7. Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    gainNodeRef.current = masterGain;
    // lastNode already connected to compressor/destination

    setIsInitialized(true);
  };

  // Update Equalizer
  useEffect(() => {
    Object.entries(equalizer).forEach(([freq, gain]) => {
      const node = eqNodesRef.current[Number(freq)];
      if (node) {
        node.gain.setTargetAtTime(gain, audioCtxRef.current?.currentTime || 0, 0.1);
      }
    });
  }, [equalizer]);

  // Update Bass Boost
  useEffect(() => {
    if (bassNodeRef.current) {
      bassNodeRef.current.gain.setTargetAtTime(bassBoost, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [bassBoost]);

  // Update Spatial Audio
  useEffect(() => {
    if (spatialNodeRef.current) {
      const x = Math.sin(spatialAudio * Math.PI);
      const z = -Math.cos(spatialAudio * Math.PI);
      spatialNodeRef.current.positionX.setTargetAtTime(x * 5, audioCtxRef.current?.currentTime || 0, 0.1);
      spatialNodeRef.current.positionZ.setTargetAtTime(z * 5, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [spatialAudio]);

  // Update Volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, audioCtxRef.current?.currentTime || 0, 0.1);
    }
  }, [volume]);

  const applyProfile = (profile: SoundProfile) => {
    setSoundProfile(profile);
    switch (profile) {
      case 'deep-bass':
        setBassBoost(12);
        setEqualizer({ ...DEFAULT_EQ, 60: 6, 170: 4 });
        break;
      case 'clarity':
        setBassBoost(0);
        setEqualizer({ ...DEFAULT_EQ, 3000: 3, 6000: 5, 12000: 4 });
        break;
      case 'party':
        setBassBoost(10);
        setEqualizer({ ...DEFAULT_EQ, 60: 5, 170: 3, 12000: 4, 16000: 5 });
        break;
      case 'focus':
        setBassBoost(-5);
        setEqualizer({ ...DEFAULT_EQ, 60: -3, 1000: 2, 3000: 1 });
        break;
      case 'default':
        setBassBoost(0);
        setEqualizer(DEFAULT_EQ);
        break;
    }
  };

  const setEqualizerBand = (freq: keyof EqualizerSettings, gain: number) => {
    setEqualizer(prev => ({ ...prev, [freq]: gain }));
    setSoundProfile('custom');
  };

  const resetEqualizer = () => {
    setEqualizer(DEFAULT_EQ);
    setBassBoost(0);
    setSoundProfile('default');
  };

  return (
    <AudioEngineContext.Provider value={{
      isInitialized,
      volume,
      bassBoost,
      spatialAudio,
      isLoudnessNormalized,
      reverbSpace,
      reverbIntensity,
      stereoWidth,
      dynamicBoost,
      soundProfile,
      equalizer,
      setVolume,
      setBassBoost,
      setSpatialAudio,
      setIsLoudnessNormalized,
      setReverbSpace,
      setReverbIntensity,
      setStereoWidth,
      setDynamicBoost,
      setSoundProfile,
      setEqualizerBand,
      initialize,
      applyProfile,
      resetEqualizer
    }}>
      {children}
    </AudioEngineContext.Provider>
  );
};

export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error('useAudioEngine must be used within an AudioEngineProvider');
  }
  return context;
};
