<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 w-full bg-red-600 text-white z-50 px-4 py-3">
      <div class="flex items-center">
        <h1 class="text-lg font-semibold">预警设置</h1>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-16 pb-20 px-4 space-y-4">
      <!-- Test Alert Button (moved to top) with sound status -->
      <div class="top-controls">
        <button @click="testAlert" class="test-alert-btn">
          🚨 测试预警
        </button>

      </div>

      <!-- Alert Status -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <i class="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-800">预警状态</h3>
              <p class="text-sm text-gray-600">{{ alertEnabled ? '已开启' : '已关闭' }} · 监测范围 {{ monitoringRadius }}km</p>
            </div>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="alertEnabled" class="hidden" id="alertToggle">
            <label for="alertToggle" class="w-14 h-8 rounded-full cursor-pointer block transition-all duration-300" :class="alertEnabled ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-6 h-6 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': alertEnabled }"></span>
            </label>
          </div>
        </div>
        <div class="mt-3 text-sm text-gray-600">
          最近预警：{{ lastAlertTime }}
        </div>
      </div>

      <!-- Basic Settings -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center mb-4">
          <i class="fas fa-cog text-red-600 mr-2"></i>
          <h3 class="font-semibold text-gray-800">偏好设置</h3>
        </div>
        
        <!-- Language Setting -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-language text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">语言</span>
          </div>
          <select v-model="language" class="bg-gray-100 px-3 py-1 rounded-lg text-sm border-none focus:outline-none focus:ring-2 focus:ring-red-600">
            <option value="zh-CN">中文</option>
            <option value="en-US">English</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        <!-- Dark Mode -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-moon text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">深色模式</span>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="darkMode" class="hidden" id="darkModeToggle">
            <label for="darkModeToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="darkMode ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': darkMode }"></span>
            </label>
          </div>
        </div>

        <!-- Magnitude Threshold -->
        <div class="py-3">
          <div class="flex items-center mb-3">
            <i class="fas fa-chart-line text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">震级阈值：{{ magnitudeThreshold }}级</span>
          </div>
          <div class="px-3">
            <input type="range" v-model="magnitudeThreshold" min="2.0" max="9.0" step="0.1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between mt-1">
              <span class="text-xs text-gray-500">2.0</span>
              <span class="text-xs text-gray-500">9.0</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Accessibility Settings -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center mb-4">
          <i class="fas fa-universal-access text-red-600 mr-2"></i>
          <h3 class="font-semibold text-gray-800">无障碍设置</h3>
        </div>

        <!-- Font Size -->
        <div class="py-3 border-b border-gray-100">
          <div class="flex items-center mb-3">
            <i class="fas fa-font text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">字体大小：{{ fontSize }}px</span>
          </div>
          <div class="px-3">
            <input type="range" v-model="fontSize" min="12" max="24" step="1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between mt-1">
              <span class="text-xs text-gray-500">小</span>
              <span class="text-xs text-gray-500">大</span>
            </div>
          </div>
        </div>

        <!-- High Contrast -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-adjust text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">高对比度</span>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="highContrast" class="hidden" id="contrastToggle">
            <label for="contrastToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="highContrast ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': highContrast }"></span>
            </label>
          </div>
        </div>

        <!-- Screen Reader -->
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center">
            <i class="fas fa-volume-up text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">屏幕阅读</span>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="screenReader" class="hidden" id="readerToggle">
            <label for="readerToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="screenReader ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': screenReader }"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Cluster Services -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center mb-4">
          <i class="fas fa-network-wired text-red-600 mr-2"></i>
          <h3 class="font-semibold text-gray-800">集成服务</h3>
        </div>

        <!-- Smart Home -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-home text-red-600 mr-3 w-5"></i>
            <div>
              <div class="text-gray-700">智能家居</div>
              <div class="text-xs text-gray-500">地震时自动控制智能设备</div>
            </div>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="smartHome" class="hidden" id="smartHomeToggle">
            <label for="smartHomeToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="smartHome ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': smartHome }"></span>
            </label>
          </div>
        </div>

        <!-- Emergency Services -->
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center">
            <i class="fas fa-ambulance text-red-600 mr-3 w-5"></i>
            <div>
              <div class="text-gray-700">紧急服务</div>
              <div class="text-xs text-gray-500">自动通知紧急救援中心</div>
            </div>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="emergencyServices" class="hidden" id="emergencyToggle">
            <label for="emergencyToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="emergencyServices ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': emergencyServices }"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Monitoring Range Settings -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center mb-4">
          <i class="fas fa-map-marker-alt text-red-600 mr-2"></i>
          <h3 class="font-semibold text-gray-800">监测范围设置</h3>
        </div>

        <!-- Current Location -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-location-arrow text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">当前位置</span>
          </div>
          <span class="text-sm text-gray-600">{{ currentLocation }}</span>
        </div>

        <!-- Monitoring Radius -->
        <div class="py-3">
          <div class="flex items-center mb-3">
            <span class="text-gray-700">监测半径：{{ monitoringRadius }}km</span>
          </div>
          <div class="px-3">
            <input type="range" v-model="monitoringRadius" min="1" max="200" step="1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer">
            <div class="flex justify-between mt-1">
              <span class="text-xs text-gray-500">1km</span>
              <span class="text-xs text-gray-500">200km</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center mb-4">
          <i class="fas fa-bell text-red-600 mr-2"></i>
          <h3 class="font-semibold text-gray-800">通知设置</h3>
        </div>

        <!-- Sound Alert -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-volume-up text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">声音提醒</span>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="soundAlert" class="hidden" id="soundToggle">
            <label for="soundToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="soundAlert ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': soundAlert }"></span>
            </label>
          </div>
        </div>

        <!-- Vibration Alert -->
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center">
            <i class="fas fa-mobile-alt text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">震动提醒</span>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="vibrationAlert" class="hidden" id="vibrationToggle">
            <label for="vibrationToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="vibrationAlert ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': vibrationAlert }"></span>
            </label>
          </div>
        </div>

        <!-- Popup Alert -->
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center">
            <i class="fas fa-window-maximize text-red-600 mr-3 w-5"></i>
            <span class="text-gray-700">弹窗提醒</span>
          </div>
          <div class="relative">
            <input type="checkbox" v-model="popupAlert" class="hidden" id="popupToggle">
            <label for="popupToggle" class="w-12 h-6 rounded-full cursor-pointer block transition-all duration-300" :class="popupAlert ? 'bg-red-600' : 'bg-gray-300'">
              <span class="w-4 h-4 bg-white rounded-full block transform transition-transform duration-300 mt-1 ml-1" :class="{ 'translate-x-6': popupAlert }"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Emergency Contacts -->
      <div class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex items-center mb-4">
          <i class="fas fa-address-book text-red-600 mr-2"></i>
          <h3 class="font-semibold text-gray-800">紧急联系人</h3>
        </div>
        
        <div class="space-y-3">
          <div v-for="(contact, index) in emergencyContacts" :key="index" class="flex items-center justify-between py-2">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-user text-red-600"></i>
              </div>
              <div>
                <div class="font-medium text-gray-800">{{ contact.name }}</div>
                <div class="text-sm text-gray-600">{{ contact.phone }}</div>
              </div>
            </div>
            <button @click="removeContact(index)" class="text-gray-400 hover:text-red-600 transition-colors">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          
          <button @click="showAddContact = true" class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-600 hover:text-red-600 transition-colors">
            <i class="fas fa-plus mr-2"></i>添加联系人
          </button>
        </div>
      </div>


    </main>
  </div>

  <!-- Add Contact Modal -->
  <div v-if="showAddContact" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div class="bg-white w-full max-w-sm rounded-xl overflow-hidden">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-800">添加紧急联系人</h3>
      </div>
      <div class="p-4">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input v-model="newContact.name" type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-600" placeholder="请输入姓名">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
            <input v-model="newContact.phone" type="tel" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-red-600" placeholder="请输入手机号码">
          </div>
        </div>
      </div>
      <div class="p-4 border-t flex space-x-3">
        <button @click="cancelAddContact" class="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          取消
        </button>
        <button @click="addContact" class="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          确认
        </button>
      </div>
    </div>
  </div>

  <!-- Test Alert Modal - Enhanced Earthquake Alert Popup -->
  <div v-if="showTestAlert" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg w-[90%] max-w-sm overflow-hidden">
      <div class="bg-red-600 p-4 text-white text-center animate-flash">
        <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
        <h2 class="text-xl font-bold">地震预警！</h2>
        <div class="text-4xl font-bold my-3">震级 {{ magnitudeThreshold }}</div>
        <div class="text-lg font-semibold">
          <span v-if="countdownSeconds > 0" class="text-yellow-200 bg-black bg-opacity-20 px-3 py-1 rounded-lg">
            预计到达时间：<span class="text-xl font-bold animate-pulse">{{ formatCountdown(countdownSeconds) }}</span>
          </span>
          <span v-else class="text-red-200 animate-pulse bg-red-800 bg-opacity-50 px-3 py-1 rounded-lg text-xl font-bold">
            🚨 地震波已到达！
          </span>
        </div>
      </div>
      <div class="p-4">
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <h3 class="font-semibold text-gray-800 mb-2">最近的避难所：</h3>
          <div class="space-y-2">
            <div v-for="(shelter, index) in nearestShelters" :key="index" class="flex items-center">
              <i class="fas fa-building text-red-600 mr-2"></i>
              <div class="flex-1">
                <div class="text-sm font-medium text-gray-800">{{ shelter.name }}</div>
                <div class="text-xs text-gray-600">{{ shelter.distance }} • {{ shelter.address }}</div>
              </div>
            </div>
          </div>
        </div>
        <p class="text-gray-600 mb-4">长按关闭此警报</p>
        <button
          @touchstart="startLongPress"
          @touchend="endLongPress"
          @mousedown="startLongPress"
          @mouseup="endLongPress"
          @mouseleave="endLongPress"
          class="w-full bg-red-600 text-white py-3 rounded-lg relative overflow-hidden"
        >
          <div class="absolute left-0 bottom-0 h-1 bg-white" :style="{ width: `${dismissProgress}%` }"></div>
          <span>长按关闭</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import GlobalSoundManager from '@/utils/GlobalSoundManager.js';

// Alert Settings
const alertEnabled = ref(true);
const lastAlertTime = ref('2025-03-25 14:30:00');

// Basic Settings
const language = ref('zh-CN');
const darkMode = ref(false);
const magnitudeThreshold = ref(4.0);

// Accessibility Settings
const fontSize = ref(16);
const highContrast = ref(false);
const screenReader = ref(false);

// Cluster Services
const smartHome = ref(false);
const emergencyServices = ref(false);

// Monitoring Range
const currentLocation = ref('成都市武侯区');
const monitoringRadius = ref(50);

// Notification Settings
const soundAlert = ref(true);
const vibrationAlert = ref(true);
const popupAlert = ref(true);

// Emergency Contacts
const emergencyContacts = ref([
  { name: '李明', phone: '138 8888 8888' },
  { name: '张华', phone: '139 9999 9999' }
]);

// Sound Management (using Global Sound Manager)
const isSoundPlaying = ref(false);

// Modal States
const showAddContact = ref(false);
const showTestAlert = ref(false);
const dismissProgress = ref(0);
const longPressTimer = ref(null);
const countdownTimer = ref(null);
const countdownSeconds = ref(0);
const testAlertLongPressTimer = ref(null);
const currentTestAlert = ref(null);

// Shelter data for the enhanced alert
const nearestShelters = ref([
  { name: '避难所1', distance: '0.3 公里', address: '川大路1号' },
  { name: '避难所2', distance: '0.8 公里', address: '川大路2号' },
  { name: '避难所3', distance: '1.2 公里', address: '川大路3号' }
]);

// New Contact Form
const newContact = ref({
  name: '',
  phone: ''
});

// Methods
const addContact = () => {
  if (newContact.value.name.trim() && newContact.value.phone.trim()) {
    emergencyContacts.value.push({
      name: newContact.value.name.trim(),
      phone: newContact.value.phone.trim()
    });
    newContact.value = { name: '', phone: '' };
    showAddContact.value = false;
    saveSettings();
  }
};

const cancelAddContact = () => {
  newContact.value = { name: '', phone: '' };
  showAddContact.value = false;
};

const removeContact = (index) => {
  emergencyContacts.value.splice(index, 1);
  saveSettings();
};

// Monitor sound state to ensure it only plays when modal is open
watch(showTestAlert, (isOpen) => {
  if (!isOpen && isSoundPlaying.value) {
    console.log('测试预警弹窗关闭，确保声音停止');
    GlobalSoundManager.stopAlert();
    isSoundPlaying.value = false;
  }
});



// Test alert function with Global Sound Manager (统一音效)
const testAlert = async () => {
  console.log('\n=== 测试预警按钮点击（使用全局统一音效） ===');
  
  try {
    // Create test earthquake data
    const testEarthquake = {
      magnitude: magnitudeThreshold.value.toString(),
      location: '四川省成都市',
      time: new Date().toLocaleString('zh-CN'),
      depth: '10公里',
      epicenter: '成都市区'
    };
    
    // Show test alert popup
    console.log('显示测试预警弹窗');
    showTestAlert.value = true;
    currentTestAlert.value = testEarthquake;
    isSoundPlaying.value = true;
    
    // Start countdown with random time between 15-45 seconds
    const randomSeconds = Math.floor(Math.random() * 31) + 15;
    startCountdown(randomSeconds);
    
    // Use Global Sound Manager for unified sound (和监测界面一样的音效)
    if (soundAlert.value) {
      console.log('使用全局声音管理器播放统一音效...');
      
      const soundStarted = await GlobalSoundManager.startAlert('AlertView');
      
      if (soundStarted) {
        console.log('✅ 预警界面统一音效播放成功');
        isSoundPlaying.value = true;
      } else {
        console.error('❌ 预警界面统一音效播放失败');
        isSoundPlaying.value = false;
      }
    } else {
      console.log('声音提醒已禁用');
      isSoundPlaying.value = false;
    }
    
    // Vibration if enabled
    if (vibrationAlert.value && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    
  } catch (error) {
    console.error('测试预警过程中出错:', error);
    isSoundPlaying.value = false;
  }
};

// Close test alert with Global Sound Manager cleanup
const closeTestAlert = () => {
  console.log('\n=== 关闭测试预警（使用全局声音管理器） ===');
  
  // Use Global Sound Manager to stop sound (统一音效管理)
  GlobalSoundManager.stopAlert();
  console.log('全局声音管理器已停止声音');
  
  // Close popup
  showTestAlert.value = false;
  currentTestAlert.value = null;
  isSoundPlaying.value = false;
  
  // Stop countdown
  stopCountdown();
  
  // Reset progress
  dismissProgress.value = 0;
  
  console.log('测试预警弹窗已关闭，统一音效已停止');
};



// Enhanced alert functionality
const formatCountdown = (seconds) => {
  if (seconds <= 0) return '0秒';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  } else {
    return `${remainingSeconds}秒`;
  }
};

const startCountdown = (initialSeconds) => {
  countdownSeconds.value = initialSeconds;
  countdownTimer.value = setInterval(() => {
    if (countdownSeconds.value > 0) {
      countdownSeconds.value--;
    } else {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
  }, 1000);
};

const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
};

const startLongPress = () => {
  longPressTimer.value = setInterval(() => {
    dismissProgress.value += 2;
    if (dismissProgress.value >= 100) {
      closeTestAlert();
      if (longPressTimer.value) {
        clearInterval(longPressTimer.value);
        longPressTimer.value = null;
      }
    }
  }, 20);
};

const endLongPress = () => {
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value);
    longPressTimer.value = null;
  }
  if (dismissProgress.value < 100) {
    dismissProgress.value = 0;
  }
};

// Settings Persistence
const saveSettings = () => {
  const settings = {
    alertEnabled: alertEnabled.value,
    language: language.value,
    darkMode: darkMode.value,
    magnitudeThreshold: magnitudeThreshold.value,
    fontSize: fontSize.value,
    highContrast: highContrast.value,
    screenReader: screenReader.value,
    smartHome: smartHome.value,
    emergencyServices: emergencyServices.value,
    monitoringRadius: monitoringRadius.value,
    soundAlert: soundAlert.value,
    vibrationAlert: vibrationAlert.value,
    popupAlert: popupAlert.value,
    emergencyContacts: emergencyContacts.value,
    currentLocation: currentLocation.value
  };
  localStorage.setItem('earthquakeSettings', JSON.stringify(settings));
};

const loadSettings = () => {
  const saved = localStorage.getItem('earthquakeSettings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      alertEnabled.value = settings.alertEnabled ?? true;
      language.value = settings.language ?? 'zh-CN';
      darkMode.value = settings.darkMode ?? false;
      magnitudeThreshold.value = settings.magnitudeThreshold ?? 4.0;
      fontSize.value = settings.fontSize ?? 16;
      highContrast.value = settings.highContrast ?? false;
      screenReader.value = settings.screenReader ?? false;
      smartHome.value = settings.smartHome ?? false;
      emergencyServices.value = settings.emergencyServices ?? false;
      monitoringRadius.value = settings.monitoringRadius ?? 50;
      soundAlert.value = settings.soundAlert ?? true;
      vibrationAlert.value = settings.vibrationAlert ?? true;
      popupAlert.value = settings.popupAlert ?? true;
      if (settings.emergencyContacts) {
        emergencyContacts.value = settings.emergencyContacts;
      }
      currentLocation.value = settings.currentLocation ?? '成都市武侯区';
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }
};

// Apply font size changes immediately
watch(fontSize, (newSize) => {
  document.documentElement.style.fontSize = `${newSize}px`;
  saveSettings();
});

// Apply dark mode changes immediately
watch(darkMode, (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  saveSettings();
});

// Save settings when any setting changes
watch([alertEnabled, language, magnitudeThreshold, highContrast, screenReader, smartHome, emergencyServices, monitoringRadius, soundAlert, vibrationAlert, popupAlert], () => {
  saveSettings();
});

// Initialize with Global Sound Manager
onMounted(async () => {
  console.log('=== AlertView 组件挂载（使用全局声音管理器） ===');
  loadSettings();
  
  // Monitor global sound status
  const soundStatusInterval = setInterval(() => {
    const status = GlobalSoundManager.getCurrentStatus();
    isSoundPlaying.value = status.isPlaying && status.currentComponent === 'AlertView';
  }, 500);
  
  // Store interval ID for cleanup
  window.alertViewSoundInterval = soundStatusInterval;
  
  console.log('AlertView 已连接到全局声音管理器');
});

onUnmounted(() => {
  console.log('=== AlertView 组件卸载 ===');
  
  // Stop global sound if this component is playing
  GlobalSoundManager.stopAlert();
  
  // Clear sound monitoring interval
  if (window.alertViewSoundInterval) {
    clearInterval(window.alertViewSoundInterval);
    window.alertViewSoundInterval = null;
  }
  
  // Clear all timers
  if (longPressTimer.value) {
    clearInterval(longPressTimer.value);
  }
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
  if (testAlertLongPressTimer.value) {
    clearInterval(testAlertLongPressTimer.value);
  }
  
  console.log('AlertView 全局声音管理器资源已清理');
});
</script>

<style scoped>
/* Custom range slider styles */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #dc2626;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-track {
  background: #e5e7eb;
  height: 8px;
  border-radius: 4px;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  background: #dc2626;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  cursor: pointer;
}

/* Select dropdown styling */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  padding-right: 2rem;
}

/* Dark mode support */
.dark {
  color-scheme: dark;
}

/* High contrast mode */
.high-contrast {
  filter: contrast(150%);
}

/* Earthquake Alert Animations */
@keyframes flash {
  0%, 50%, 100% { background-color: #dc2626; }
  25%, 75% { background-color: #ef4444; }
}

.animate-flash {
  animation: flash 1s infinite;
}

.animate-pulse {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Top Controls Styling */
.top-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
}



.test-alert-btn {
  padding: 1rem 2rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.test-alert-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
}

.test-alert-btn:active {
  transform: translateY(0);
}
</style>