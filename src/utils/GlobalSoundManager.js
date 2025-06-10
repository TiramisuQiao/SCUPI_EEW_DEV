// GlobalSoundManager.js - Unified sound management for the entire application
import AlertSoundManager from './AlertSoundManager.js';

class GlobalSoundManager {
  constructor() {
    this.currentAlertSound = null;
    this.isPlaying = false;
    this.currentComponent = null;
    this.allowedComponents = ['EarthquakeMonitoring', 'AlertView'];
    this.isInitialized = false;
    this.initPromise = null;
    
    console.log('🔊 全局声音管理器初始化');
  }

  // Initialize the global sound manager
  async initialize() {
    if (this.isInitialized || this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  async _doInitialize() {
    try {
      // Create a single AlertSoundManager instance for the entire app
      this.currentAlertSound = new AlertSoundManager();
      await this.currentAlertSound.initialize();
      
      this.isInitialized = true;
      console.log('✅ 全局声音管理器初始化成功');
      
      return true;
    } catch (error) {
      console.error('❌ 全局声音管理器初始化失败:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  // Start alert sound from a specific component
  async startAlert(componentName) {
    console.log(`\n=== 全局声音管理器：${componentName} 请求播放声音 ===`);
    
    // Check if component is allowed to play sound
    if (!this.allowedComponents.includes(componentName)) {
      console.warn(`❌ 组件 ${componentName} 不允许播放声音`);
      return false;
    }

    try {
      // Initialize if not done yet
      if (!this.isInitialized) {
        console.log('初始化全局声音管理器...');
        await this.initialize();
      }

      // Stop any currently playing sound first
      if (this.isPlaying) {
        console.log(`停止来自 ${this.currentComponent} 的声音，切换到 ${componentName}`);
        this.stopAlert();
      }

      // Start the new alert sound
      console.log(`开始播放来自 ${componentName} 的统一音效`);
      await this.currentAlertSound.playAlert();
      
      // Update state
      this.isPlaying = true;
      this.currentComponent = componentName;
      
      console.log(`✅ ${componentName} 统一音效播放成功`);
      return true;
      
    } catch (error) {
      console.error(`❌ ${componentName} 统一音效播放失败:`, error);
      this.isPlaying = false;
      this.currentComponent = null;
      return false;
    }
  }

  // Stop currently playing alert sound
  stopAlert() {
    console.log('\n=== 全局声音管理器：停止声音 ===');
    
    try {
      if (this.currentAlertSound && this.isPlaying) {
        console.log(`停止来自 ${this.currentComponent} 的声音`);
        this.currentAlertSound.stopAlert();
        
        // Reset state
        this.isPlaying = false;
        this.currentComponent = null;
        
        console.log('✅ 全局声音已停止');
      } else {
        console.log('ℹ️ 没有正在播放的声音需要停止');
      }
    } catch (error) {
      console.error('❌ 停止声音时出错:', error);
      // Reset state anyway to prevent stuck states
      this.isPlaying = false;
      this.currentComponent = null;
    }
  }

  // Get current sound status
  getCurrentStatus() {
    return {
      isPlaying: this.isPlaying,
      currentComponent: this.currentComponent,
      hasActiveSound: !!this.currentAlertSound,
      audioContextState: this.currentAlertSound ? this.currentAlertSound.getAudioContextState() : 'not-initialized',
      isInitialized: this.isInitialized
    };
  }

  // Check if currently playing
  isCurrentlyPlaying() {
    return this.isPlaying;
  }

  // Get which component is currently playing sound
  getCurrentPlayingComponent() {
    return this.currentComponent;
  }

  // Set volume for the global sound manager
  async setVolume(volume) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (this.currentAlertSound) {
        this.currentAlertSound.setVolume(volume);
        console.log(`🔊 全局音量设置为: ${volume}`);
      }
    } catch (error) {
      console.error('设置音量失败:', error);
    }
  }

  // Get current volume
  getVolume() {
    if (this.currentAlertSound) {
      return this.currentAlertSound.getVolume();
    }
    return 0.7; // Default volume
  }

  // Toggle sound enabled/disabled
  async toggleEnabled() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      if (this.currentAlertSound) {
        const enabled = this.currentAlertSound.toggleEnabled();
        console.log(`🔊 全局声音${enabled ? '启用' : '禁用'}`);
        
        // Stop current sound if disabling
        if (!enabled && this.isPlaying) {
          this.stopAlert();
        }
        
        return enabled;
      }
    } catch (error) {
      console.error('切换声音状态失败:', error);
    }
    
    return false;
  }

  // Check if sound is enabled
  isEnabled() {
    if (this.currentAlertSound) {
      return this.currentAlertSound.isEnabledStatus();
    }
    return true; // Default enabled
  }

  // Test alert sound
  async testAlert() {
    console.log('\n=== 全局声音管理器：测试音效 ===');
    
    try {
      const success = await this.startAlert('TestMode');
      
      if (success) {
        console.log('✅ 测试音效播放成功');
        
        // Stop after 3 seconds for testing
        setTimeout(() => {
          if (this.currentComponent === 'TestMode') {
            this.stopAlert();
            console.log('测试音效自动停止');
          }
        }, 3000);
      }
      
      return success;
    } catch (error) {
      console.error('❌ 测试音效失败:', error);
      return false;
    }
  }

  // Force stop all sounds (emergency cleanup)
  forceStopAll() {
    console.log('\n=== 全局声音管理器：强制停止所有声音 ===');
    
    try {
      if (this.currentAlertSound) {
        this.currentAlertSound.stopAlert();
      }
      
      // Reset all state
      this.isPlaying = false;
      this.currentComponent = null;
      
      console.log('✅ 所有声音已强制停止');
    } catch (error) {
      console.error('❌ 强制停止声音时出错:', error);
      // Reset state anyway
      this.isPlaying = false;
      this.currentComponent = null;
    }
  }

  // Cleanup resources
  destroy() {
    console.log('\n=== 全局声音管理器：销毁资源 ===');
    
    try {
      this.forceStopAll();
      
      if (this.currentAlertSound) {
        this.currentAlertSound.destroy();
        this.currentAlertSound = null;
      }
      
      this.isInitialized = false;
      this.initPromise = null;
      
      console.log('✅ 全局声音管理器已销毁');
    } catch (error) {
      console.error('❌ 销毁全局声音管理器时出错:', error);
    }
  }

  // Get detailed debug information
  getDebugInfo() {
    const status = this.getCurrentStatus();
    return {
      ...status,
      allowedComponents: this.allowedComponents,
      volume: this.getVolume(),
      enabled: this.isEnabled(),
      managerExists: !!this.currentAlertSound
    };
  }

  // Static method to prevent accidental multiple instances
  static getInstance() {
    if (!GlobalSoundManager._instance) {
      GlobalSoundManager._instance = new GlobalSoundManager();
    }
    return GlobalSoundManager._instance;
  }
}

// Create and export singleton instance
const globalSoundManager = new GlobalSoundManager();

// Make sure only one instance exists
GlobalSoundManager._instance = globalSoundManager;

export default globalSoundManager;