// AlertSoundManager.js - Sound management utility for earthquake alerts
class AlertSoundManager {
  constructor() {
    this.audioContext = null;
    this.alertBuffer = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.isEnabled = true;
    this.currentSource = null;
    this.gainNode = null;
    
    // Load user preferences from localStorage
    this.loadUserPreferences();
    
    // Initialize audio context on user interaction
    this.isInitialized = false;
    this.initPromise = null;
  }

  // Load user preferences from localStorage
  loadUserPreferences() {
    try {
      const savedVolume = localStorage.getItem('earthquake-alert-volume');
      const savedEnabled = localStorage.getItem('earthquake-alert-enabled');
      
      if (savedVolume !== null) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
      }
      
      if (savedEnabled !== null) {
        this.isEnabled = savedEnabled === 'true';
      }
    } catch (error) {
      console.warn('Failed to load sound preferences:', error);
    }
  }

  // Save user preferences to localStorage
  saveUserPreferences() {
    try {
      localStorage.setItem('earthquake-alert-volume', this.volume.toString());
      localStorage.setItem('earthquake-alert-enabled', this.isEnabled.toString());
    } catch (error) {
      console.warn('Failed to save sound preferences:', error);
    }
  }

  // Initialize audio context and generate alert sound
  async initialize() {
    if (this.isInitialized || this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Resume audio context if suspended (required by browser policies)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Generate earthquake alert sound
      await this.generateAlertSound();
      
      this.isInitialized = true;
      console.log('AlertSoundManager initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize AlertSoundManager:', error);
      throw error;
    }
  }

  // Generate a synthetic earthquake alert sound
  async generateAlertSound() {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      // Create a 3-second alert sound buffer
      const sampleRate = this.audioContext.sampleRate;
      const duration = 3.0; // 3 seconds
      const frameCount = sampleRate * duration;
      
      // Create audio buffer
      this.alertBuffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
      const channelData = this.alertBuffer.getChannelData(0);

      // Generate a more urgent siren-like alert sound
      for (let i = 0; i < frameCount; i++) {
        const time = i / sampleRate;
        
        // Create a rising and falling siren sound
        const sirenCycle = (time * 1.5) % 2; // 1.33-second cycle for slower siren
        let frequency;
        
        if (sirenCycle < 1) {
          // Rising frequency from 400Hz to 1400Hz
          frequency = 400 + (sirenCycle * 1000);
        } else {
          // Falling frequency from 1400Hz to 400Hz
          frequency = 1400 - ((sirenCycle - 1) * 1000);
        }
        
        // Add urgency with rapid amplitude modulation
        const rapidBeep = Math.sin(2 * Math.PI * 10 * time); // 10Hz modulation for urgency
        const envelope = (rapidBeep > 0) ? 0.9 : 0.4; // Create urgent pulsing
        
        // Generate the main siren tone
        const mainTone = Math.sin(2 * Math.PI * frequency * time);
        
        // Add harmonic for more piercing sound
        const harmonic = Math.sin(2 * Math.PI * frequency * 1.8 * time) * 0.4;
        
        // Add sub-harmonic for fuller sound
        const subHarmonic = Math.sin(2 * Math.PI * frequency * 0.5 * time) * 0.3;
        
        // Combine all components
        channelData[i] = (mainTone + harmonic + subHarmonic) * envelope * 0.35;
        
        // Add fade in/out
        if (time < 0.1) {
          channelData[i] *= time / 0.1; // Fade in
        } else if (time > duration - 0.2) {
          channelData[i] *= (duration - time) / 0.2; // Fade out
        }
      }

      console.log('Alert sound generated successfully');
      
    } catch (error) {
      console.error('Failed to generate alert sound:', error);
      throw error;
    }
  }

  // Play earthquake alert sound (continuous loop)
  async playAlert() {
    if (!this.isEnabled) {
      console.log('Alert sound is disabled');
      return;
    }

    if (this.isPlaying) {
      console.log('Alert sound already playing');
      return;
    }

    try {
      // Initialize if not done yet
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.alertBuffer || !this.audioContext) {
        throw new Error('Alert sound not ready');
      }

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isPlaying = true;
      console.log('Starting continuous alert sound');
      
      // Start the looping alert
      this._playLoopingAlert();
      
    } catch (error) {
      console.error('Failed to play alert sound:', error);
      this.isPlaying = false;
      this.currentSource = null;
      this.gainNode = null;
    }
  }

  // Internal method to play looping alert
  _playLoopingAlert() {
    if (!this.isPlaying || !this.audioContext) {
      return;
    }

    try {
      // Create audio source and gain node for this loop
      this.currentSource = this.audioContext.createBufferSource();
      this.gainNode = this.audioContext.createGain();
      
      // Set up audio graph
      this.currentSource.buffer = this.alertBuffer;
      this.gainNode.gain.value = this.volume;
      
      this.currentSource.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      // Set up event handler for continuous loop
      this.currentSource.onended = () => {
        this.currentSource = null;
        this.gainNode = null;
        
        // Continue looping if still playing
        if (this.isPlaying) {
          // Small delay before next loop to prevent audio glitches
          setTimeout(() => {
            if (this.isPlaying) {
              this._playLoopingAlert();
            }
          }, 50);
        }
      };
      
      // Start playing this loop
      this.currentSource.start();
      
    } catch (error) {
      console.error('Failed to play alert loop:', error);
      // Try to restart after a brief delay
      if (this.isPlaying) {
        setTimeout(() => {
          if (this.isPlaying) {
            this._playLoopingAlert();
          }
        }, 100);
      }
    }
  }

  // Stop current alert sound
  stopAlert() {
    try {
      if (this.currentSource && this.isPlaying) {
        this.currentSource.stop();
        this.currentSource = null;
        this.gainNode = null;
        this.isPlaying = false;
        console.log('Alert sound stopped');
      }
    } catch (error) {
      console.error('Failed to stop alert sound:', error);
      // Reset state anyway
      this.isPlaying = false;
      this.currentSource = null;
      this.gainNode = null;
    }
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // Update current playing sound if any
    if (this.gainNode && this.isPlaying) {
      this.gainNode.gain.value = this.volume;
    }
    
    // Save preference
    this.saveUserPreferences();
    console.log('Volume set to:', this.volume);
  }

  // Get current volume
  getVolume() {
    return this.volume;
  }

  // Toggle sound on/off
  toggleEnabled() {
    this.isEnabled = !this.isEnabled;
    
    // Stop current sound if disabling
    if (!this.isEnabled && this.isPlaying) {
      this.stopAlert();
    }
    
    // Save preference
    this.saveUserPreferences();
    console.log('Alert sound', this.isEnabled ? 'enabled' : 'disabled');
    
    return this.isEnabled;
  }

  // Check if sound is enabled
  isEnabledStatus() {
    return this.isEnabled;
  }

  // Check if currently playing
  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  // Get audio context state (for debugging)
  getAudioContextState() {
    return this.audioContext ? this.audioContext.state : 'not-initialized';
  }

  // Test the alert sound (for settings/testing)
  async testAlert() {
    console.log('Testing alert sound...');
    await this.playAlert();
  }

  // Cleanup resources
  destroy() {
    try {
      this.stopAlert();
      
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }
      
      this.audioContext = null;
      this.alertBuffer = null;
      this.isInitialized = false;
      this.initPromise = null;
      
      console.log('AlertSoundManager destroyed');
      
    } catch (error) {
      console.error('Error during AlertSoundManager cleanup:', error);
    }
  }

  // Static method to create and initialize manager
  static async create() {
    const manager = new AlertSoundManager();
    
    // Don't auto-initialize to respect browser policies
    // Initialization will happen on first playAlert() call
    
    return manager;
  }
}

// Export for ES6 modules
export default AlertSoundManager;