<template>
<div class="min-h-screen bg-white">
  <!-- Emergency Alert Modal -->
  <div v-if="showEmergencyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg w-[90%] max-w-sm overflow-hidden">
      <div class="bg-red-600 p-4 text-white text-center animate-flash">
        <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
        <h2 class="text-xl font-bold">地震预警！</h2>
        <div class="text-4xl font-bold my-3">震级 {{ emergencyData.magnitude }}</div>
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

  <!-- Navigation Bar -->
  <nav class="fixed top-0 w-full bg-red-600 text-white z-50 px-4 py-3">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold">地震监测</h1>
      <div class="flex items-center space-x-3">
        <i class="fas fa-wifi"></i>
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="pt-16 pb-20">
    <!-- Warning Banner -->
    <div v-if="showWarning" class="bg-red-500 text-white p-4 mb-4 animate-pulse">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <i class="fas fa-exclamation-triangle text-2xl mr-3"></i>
          <div>
            <h2 class="font-bold">紧急预警！</h2>
            <p>在成都市龙泉驿区检测到6.2级地震</p>
          </div>
        </div>
        <button @click="showWarning = false" class="text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Seismic Activity Graph -->
    <div class="px-4 mb-6">
      <div class="bg-white rounded-lg shadow-lg p-4">
        <h3 class="text-lg font-semibold mb-4">实时地震活动</h3>
        <div ref="chartContainer" style="height: 200px"></div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="px-4 mb-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-600">近期事件</div>
          <div class="text-2xl font-bold text-red-600">12</div>
          <div class="text-xs text-gray-500">过去24小时</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-sm text-gray-600">最高震级</div>
          <div class="text-2xl font-bold text-red-600">6.2</div>
          <div class="text-xs text-gray-500">今日</div>
        </div>
      </div>
    </div>

    <!-- Recent Activity List -->
    <div class="px-4">
      <h3 class="text-lg font-semibold mb-4">近期活动</h3>
      <div class="space-y-4">
        <div v-for="(event, index) in recentEvents" :key="index"
          @click="openHistoricalData"
          class="bg-white rounded-lg shadow p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
          <div>
            <div class="font-semibold">{{ event.location }}</div>
            <div class="text-sm text-gray-600">{{ event.time }}</div>
          </div>
          <div class="text-lg font-bold" :class="getMagnitudeColor(event.magnitude)">
            M {{ event.magnitude }}
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Emergency Phone Popup -->
  <div v-if="showPhonePopup" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closePhonePopup">
    <div class="bg-white rounded-lg w-[90%] max-w-sm mx-4 overflow-hidden" @click.stop>
      <!-- Header -->
      <div class="bg-red-600 text-white p-4 text-center relative">
        <h2 class="text-lg font-bold">紧急救援电话</h2>
        <button @click="showPhonePopup = false" class="absolute right-3 top-3 text-white hover:text-gray-200 text-xl">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Emergency Contacts -->
      <div class="p-4 space-y-3">
        <div v-for="contact in emergencyContacts" :key="contact.number" 
             class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg" :style="{backgroundColor: contact.color}">
              <i :class="contact.icon"></i>
            </div>
            <div>
              <div class="font-semibold text-gray-800">{{ contact.name }}</div>
              <div class="text-sm text-gray-600">{{ contact.description }}</div>
            </div>
          </div>
          <a :href="`tel:${contact.number}`" 
             class="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
            {{ contact.number }}
          </a>
        </div>
      </div>
      
      <!-- Additional Info -->
      <div class="px-4 pb-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex items-center space-x-2 text-yellow-800">
            <i class="fas fa-exclamation-triangle"></i>
            <span class="text-sm font-semibold">紧急提醒</span>
          </div>
          <p class="text-xs text-yellow-700 mt-1">请根据实际情况选择合适的救援电话。在地震等紧急情况下，保持冷静，准确描述您的位置和状况。</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Historical Data Modal -->
  <div v-if="showHistoricalModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeHistoricalModal">
    <div class="bg-white w-[90%] max-w-md mx-4 rounded-lg overflow-hidden max-h-[85vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="bg-red-600 text-white p-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">历史地震数据</h2>
        <button @click="showHistoricalModal = false" class="text-white hover:text-gray-200 text-xl">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- Filter Controls -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex space-x-3">
          <div class="flex-1">
            <select v-model="selectedTimePeriod" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-white">
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
              <option value="quarter">最近三月</option>
              <option value="year">最近一年</option>
            </select>
          </div>
          <div class="flex-1">
            <select v-model="selectedSortBy" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 bg-white">
              <option value="time">按时间</option>
              <option value="location">按地点</option>
              <option value="magnitude">按震级</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- Historical Data List -->
      <div class="flex-1 overflow-y-auto p-4">
        <div class="space-y-4">
          <div v-for="(earthquake, index) in filteredHistoricalData" :key="index" 
               @click="selectEarthquake(earthquake)"
               class="relative rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
               :class="selectedEarthquake?.id === earthquake.id ? 'ring-2 ring-red-500' : ''">
            <!-- Background Image -->
            <div class="relative h-32 bg-gradient-to-br from-gray-400 to-gray-600 flex items-end"
                 :style="earthquake.image ? `background-image: url(${earthquake.image}); background-size: cover; background-position: center;` : ''">
              <div class="absolute inset-0 bg-black bg-opacity-40"></div>
              <div class="relative z-10 p-3 text-white w-full">
                <div class="flex items-end justify-between">
                  <div>
                    <div class="font-bold text-lg">{{ earthquake.location }}</div>
                    <div class="text-sm opacity-90">{{ earthquake.date }} {{ earthquake.time }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold" :class="earthquake.magnitude >= 6 ? 'text-red-400' : earthquake.magnitude >= 4 ? 'text-orange-400' : 'text-yellow-400'">
                      M {{ earthquake.magnitude }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Details -->
            <div class="p-3 bg-white">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">距离:</span>
                  <span class="font-medium ml-1">{{ earthquake.distance }}</span>
                </div>
                <div>
                  <span class="text-gray-600">影响程度:</span>
                  <span class="font-medium ml-1">{{ earthquake.severity }}</span>
                </div>
                <div>
                  <span class="text-gray-600">伤亡情况:</span>
                  <span class="font-medium ml-1">{{ earthquake.casualties }}</span>
                </div>
                <div>
                  <span class="text-gray-600">损坏程度:</span>
                  <span class="font-medium ml-1">{{ earthquake.damage }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Selected Earthquake Details -->
      <div v-if="selectedEarthquake" class="border-t border-gray-200 p-4 bg-gray-50">
        <h4 class="font-bold text-gray-800 mb-2">详细信息</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <div><strong>震源深度:</strong> {{ selectedEarthquake.depth }}</div>
          <div><strong>预警时间:</strong> {{ selectedEarthquake.warningTime }}</div>
          <div><strong>受影响区域:</strong> {{ selectedEarthquake.affectedAreas }}</div>
          <div><strong>救援状态:</strong> {{ selectedEarthquake.rescueStatus }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Emergency FAB -->
  <button @click="showPhonePopup = true" class="fixed right-4 bottom-20 bg-red-600 text-white rounded-full p-4 shadow-lg cursor-pointer hover:bg-red-700 transition-colors animate-pulse">
    <i class="fas fa-phone-alt text-xl"></i>
  </button>
</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import AlertSoundManager from '../utils/AlertSoundManager.js';

const showWarning = ref(true);
const showEmergencyModal = ref(false);
const showPhonePopup = ref(false);
const showHistoricalModal = ref(false);
const selectedTimePeriod = ref('week');
const selectedSortBy = ref('time');
const selectedEarthquake = ref(null);
const dismissProgress = ref(0);
const longPressTimer = ref(null);
const countdownTimer = ref(null);
const countdownSeconds = ref(0);
const currentTime = ref('');
const chartContainer = ref(null);
let chart = null;

const emergencyData = ref({
  magnitude: 7.2,
  arrivalTime: '2 minutes'
});

// Sound management
const alertSoundManager = ref(null);
const soundEnabled = ref(true);
const soundVolume = ref(70);

const nearestShelters = ref([
  { name: '避难所1', distance: '0.3 公里', address: '川大路1号' },
  { name: '避难所2', distance: '0.8 公里', address: '川大路2号' },
  { name: '避难所3', distance: '1.2 公里', address: '川大路3号' }
]);

const recentEvents = ref([
  { location: '成都市龙泉驿区', magnitude: 6.2, time: '2 分钟前' },
  { location: '德阳市', magnitude: 4.5, time: '15 分钟前' },
  { location: '绵阳市', magnitude: 3.8, time: '45 分钟前' },
  { location: '资阳市', magnitude: 2.9, time: '1 小时前' }
]);

const emergencyContacts = ref([
  {
    name: '火警',
    number: '119',
    description: '火灾救援',
    icon: 'fas fa-fire',
    color: '#f56565'
  },
  {
    name: '急救',
    number: '120',
    description: '医疗急救',
    icon: 'fas fa-plus',
    color: '#48bb78'
  },
  {
    name: '报警',
    number: '110',
    description: '警察报警',
    icon: 'fas fa-shield-alt',
    color: '#4299e1'
  },
  {
    name: '地震局',
    number: '12322',
    description: '地震咨询',
    icon: 'fas fa-mountain',
    color: '#ed8936'
  },
  {
    name: '救援队',
    number: '12395',
    description: '专业救援',
    icon: 'fas fa-hands-helping',
    color: '#9f7aea'
  },
  {
    name: '市政热线',
    number: '12345',
    description: '政府服务',
    icon: 'fas fa-city',
    color: '#38b2ac'
  }
]);

// Historical earthquake data
const historicalEarthquakeData = ref([
  {
    id: 1,
    location: '成都市双流区',
    magnitude: 5.2,
    date: '2025-05-12',
    time: '14:28',
    distance: '10km',
    severity: '中等',
    casualties: '0人',
    damage: '部分建筑受损',
    depth: '15km',
    warningTime: '提前8秒',
    affectedAreas: '双流区、武侯区',
    rescueStatus: '救援完成',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNzQ3NDc0IiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0YjViNjgiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkaWVudCkiIC8+CiAgPCEtLSBCdWlsZGluZyBzaWxob3VldHRlcyAtLT4KICA8cmVjdCB4PSI1MCIgeT0iMTAwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNGE0YTRhIiAvPgogIDxyZWN0IHg9IjEwMCIgeT0iODAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiM0YTRhNGEiIC8+CiAgPHJlY3QgeD0iMTYwIiB5PSI2MCIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjE0MCIgZmlsbD0iIzRhNGE0YSIgLz4KICA8cmVjdCB4PSIyMjAiIHk9IjkwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTEwIiBmaWxsPSIjNGE0YTRhIiAvPgogIDxyZWN0IHg9IjI4MCIgeT0iNzAiIHdpZHRoPSI1NSIgaGVpZ2h0PSIxMzAiIGZpbGw9IiM0YTRhNGEiIC8+CiAgPCEtLSBDcmFja3MgLS0+CiAgPGxpbmUgeDE9IjEyNSIgeTE9IjgwIiB4Mj0iMTI1IiB5Mj0iMjAwIiBzdHJva2U9IiNmZjQ0NTciIHN0cm9rZS13aWR0aD0iMyIgLz4KICA8bGluZSB4MT0iMTgyIiB5MT0iNjAiIHgyPSIxODIiIHkyPSIyMDAiIHN0cm9rZT0iI2ZmNDQ1NyIgc3Ryb2tlLXdpZHRoPSIyIiAvPgo8L3N2Zz4='
  },
  {
    id: 2,
    location: '绵阳市涪城区',
    magnitude: 4.2,
    date: '2025-05-10',
    time: '08:15',
    distance: '15km',
    severity: '轻微',
    casualties: '0人',
    damage: '少量裂缝',
    depth: '12km',
    warningTime: '提前5秒',
    affectedAreas: '涪城区',
    rescueStatus: '无需救援',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzk5OTk5OSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNjY2NjY2IiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQyKSIgLz4KICA8IS0tIFNpbXBsZSB3YWxsIHdpdGggY3JhY2tzIC0tPgogIDxyZWN0IHg9IjAiIHk9IjEwMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNjY2NjY2MiIC8+CiAgPCEtLSBDcmFja3MgLS0+CiAgPGxpbmUgeDE9IjEwMCIgeTE9IjEwMCIgeDI9IjE1MCIgeTI9IjIwMCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjI1MCIgeTE9IjEwMCIgeDI9IjI4MCIgeTI9IjIwMCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjMwMCIgeTE9IjEyMCIgeDI9IjM1MCIgeTI9IjE4MCIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjEiIC8+Cjwvc3ZnPg=='
  },
  {
    id: 3,
    location: '德阳市中江县',
    magnitude: 6.8,
    date: '2025-04-28',
    time: '21:45',
    distance: '25km',
    severity: '严重',
    casualties: '3人轻伤',
    damage: '多处建筑倒塌',
    depth: '8km',
    warningTime: '提前12秒',
    affectedAreas: '中江县、罗江区',
    rescueStatus: '救援进行中',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY2NjY2NiIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzMzMzMzIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQzKSIgLz4KICA8IS0tIERhbWFnZWQgYnVpbGRpbmdzIC0tPgogIDxwb2x5Z29uIHBvaW50cz0iNTAsMjAwIDUwLDEwMCA5MCwyMDAgNjAsMjAwIiBmaWxsPSIjNGE0YTRhIiAvPgogIDxwb2x5Z29uIHBvaW50cz0iMTIwLDIwMCAxMDAsODAgMTYwLDcwIDE3MCwyMDAiIGZpbGw9IiM0YTRhNGEiIC8+CiAgPHBvbHlnb24gcG9pbnRzPSIyMDAsMjAwIDIyMCw2MCAyNzAsNjUgMjUwLDIwMCIgZmlsbD0iIzRhNGE0YSIgLz4KICA8IS0tIERlYnJpcyAtLT4KICA8Y2lyY2xlIGN4PSIxNDAiIGN5PSIxODAiIHI9IjgiIGZpbGw9IiM4ODg4ODgiIC8+CiAgPGNpcmNsZSBjeD0iMjMwIiBjeT0iMTkwIiByPSI2IiBmaWxsPSIjODg4ODg4IiAvPgogIDxyZWN0IHg9IjE4MCIgeT0iMTcwIiB3aWR0aD0iMTUiIGhlaWdodD0iMzAiIGZpbGw9IiM4ODg4ODgiIC8+Cjwvc3ZnPg=='
  },
  {
    id: 4,
    location: '雅安市名山区',
    magnitude: 3.6,
    date: '2025-04-25',
    time: '16:32',
    distance: '35km',
    severity: '轻微',
    casualties: '0人',
    damage: '无明显损伤',
    depth: '18km',
    warningTime: '提前3秒',
    affectedAreas: '名山区',
    rescueStatus: '无需救援',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2FhYWFhYSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNzc3Nzc3IiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQ0KSIgLz4KICA8IS0tIE5vcm1hbCBidWlsZGluZ3MgLS0+CiAgPHJlY3QgeD0iNjAiIHk9IjEyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNWE1YTVhIiAvPgogIDxyZWN0IHg9IjEyMCIgeT0iMTAwIiB3aWR0aD0iNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNWE1YTVhIiAvPgogIDxyZWN0IHg9IjE5MCIgeT0iMTEwIiB3aWR0aD0iNDUiIGhlaWdodD0iOTAiIGZpbGw9IiM1YTVhNWEiIC8+CiAgPHJlY3QgeD0iMjYwIiB5PSI5MCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjExMCIgZmlsbD0iIzVhNWE1YSIgLz4KICA8IS0tIFNtYWxsIGNyYWNrcyAtLT4KICA8bGluZSB4MT0iODAiIHkxPSIxMjAiIHgyPSI4MCIgeTI9IjE2MCIgc3Ryb2tlPSIjY2NjY2NjIiBzdHJva2Utd2lkdGg9IjEiIC8+CiAgPGxpbmUgeDE9IjE0NSIgeTE9IjEwMCIgeDI9IjE0NSIgeTI9IjE0MCIgc3Ryb2tlPSIjY2NjY2NjIiBzdHJva2Utd2lkdGg9IjEiIC8+Cjwvc3ZnPg=='
  },
  {
    id: 5,
    location: '乐山市市中区',
    magnitude: 5.8,
    date: '2025-04-20',
    time: '12:08',
    distance: '42km',
    severity: '中等',
    casualties: '1人轻伤',
    damage: '部分房屋开裂',
    depth: '22km',
    warningTime: '提前6秒',
    affectedAreas: '市中区、沙湾区',
    rescueStatus: '救援完成',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ1IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzg4ODg4OCIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNTU1NTU1IiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQ1KSIgLz4KICA8IS0tIE1vZGVyYXRlbHkgZGFtYWdlZCBidWlsZGluZ3MgLS0+CiAgPHJlY3QgeD0iNDAiIHk9IjExMCIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjkwIiBmaWxsPSIjNGE0YTRhIiAvPgogIDxyZWN0IHg9IjEwMCIgeT0iOTAiIHdpZHRoPSI1NSIgaGVpZ2h0PSIxMTAiIGZpbGw9IiM0YTRhNGEiIC8+CiAgPHJlY3QgeD0iMTcwIiB5PSIxMDAiIHdpZHRoPSI1MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM0YTRhNGEiIC8+CiAgPHJlY3QgeD0iMjQwIiB5PSI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iIzRhNGE0YSIgLz4KICA8IS0tIE1vZGVyYXRlIGNyYWNrcyAtLT4KICA8bGluZSB4MT0iNjIiIHkxPSIxMTAiIHgyPSI2MiIgeTI9IjIwMCIgc3Ryb2tlPSIjZmY2NjY2IiBzdHJva2Utd2lkdGg9IjIiIC8+CiAgPGxpbmUgeDE9IjEyNyIgeTE9IjkwIiB4Mj0iMTI3IiB5Mj0iMjAwIiBzdHJva2U9IiNmZjY2NjYiIHN0cm9rZS13aWR0aD0iMiIgLz4KICA8bGluZSB4MT0iMTk1IiB5MT0iMTAwIiB4Mj0iMTk1IiB5Mj0iMjAwIiBzdHJva2U9IiNmZjY2NjYiIHN0cm9rZS13aWR0aD0iMSIgLz4KICA8bGluZSB4MT0iMjYwIiB5MT0iODAiIHgyPSIyNjAiIHkyPSIyMDAiIHN0cm9rZT0iI2ZmNjY2NiIgc3Ryb2tlLXdpZHRoPSIyIiAvPgo8L3N2Zz4='
  },
  {
    id: 6,
    location: '资阳市安岳县',
    magnitude: 2.8,
    date: '2025-04-18',
    time: '09:25',
    distance: '58km',
    severity: '微弱',
    casualties: '0人',
    damage: '无损坏',
    depth: '25km',
    warningTime: '无预警',
    affectedAreas: '安岳县局部',
    rescueStatus: '无需救援',
    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQ2IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2JiYmJiYiIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOTk5OTk5IiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3JhZGllbnQ2KSIgLz4KICA8IS0tIE5vcm1hbCBidWlsZGluZ3Mgd2l0aCBubyBkYW1hZ2UgLS0+CiAgPHJlY3QgeD0iNzAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjcwIiBmaWxsPSIjNjY2NjY2IiAvPgogIDxyZWN0IHg9IjEzMCIgeT0iMTEwIiB3aWR0aD0iNTAiIGhlaWdodD0iOTAiIGZpbGw9IiM2NjY2NjYiIC8+CiAgPHJlY3QgeD0iMjAwIiB5PSIxMjAiIHdpZHRoPSI0NSIgaGVpZ2h0PSI4MCIgZmlsbD0iIzY2NjY2NiIgLz4KICA8cmVjdCB4PSIyNzAiIHk9IjEwMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzY2NjY2NiIgLz4KICA8IS0tIE5vIGNyYWNrcyAtLT4KPC9zdmc+'
  }
]);

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getMagnitudeColor = (magnitude) => {
  if (magnitude >= 6) return 'text-red-600';
  if (magnitude >= 4) return 'text-orange-500';
  return 'text-yellow-500';
};

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
      showEmergencyModal.value = false;
      dismissProgress.value = 0;
      stopCountdown(); // Stop countdown when alert is dismissed
      // Stop alert sound when modal is closed
      if (alertSoundManager.value) {
        alertSoundManager.value.stopAlert();
      }
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

const closePhonePopup = () => {
  showPhonePopup.value = false;
};

// Historical data modal functions
const openHistoricalData = () => {
  showHistoricalModal.value = true;
  selectedEarthquake.value = null;
};

const closeHistoricalModal = () => {
  showHistoricalModal.value = false;
  selectedEarthquake.value = null;
};

const selectEarthquake = (earthquake) => {
  selectedEarthquake.value = earthquake;
};

// Computed property for filtered historical data
const filteredHistoricalData = computed(() => {
  let data = [...historicalEarthquakeData.value];
  
  // Filter by time period
  const now = new Date();
  const filterDate = new Date();
  
  switch (selectedTimePeriod.value) {
    case 'week':
      filterDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      filterDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  data = data.filter(item => new Date(item.date) >= filterDate);
  
  // Sort by selected criteria
  switch (selectedSortBy.value) {
    case 'time':
      data.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
      break;
    case 'location':
      data.sort((a, b) => a.location.localeCompare(b.location));
      break;
    case 'magnitude':
      data.sort((a, b) => b.magnitude - a.magnitude);
      break;
  }
  
  return data;
});

const initChart = () => {
  if (chartContainer.value) {
    chart = echarts.init(chartContainer.value);
    
    // Enhanced data with complete earthquake information
    const chartData = [
      { value: 2.5, time: '00:00', location: '成都市武侯区', date: '2024-06-09', depth: '12km', distance: '15km' },
      { value: 3.8, time: '04:00', location: '德阳市', date: '2024-06-09', depth: '8km', distance: '45km' },
      { value: 4.2, time: '08:00', location: '绵阳市', date: '2024-06-09', depth: '15km', distance: '78km' },
      { value: 6.2, time: '12:00', location: '成都市龙泉驿区', date: '2024-06-09', depth: '5km', distance: '25km' },
      { value: 3.9, time: '16:00', location: '资阳市', date: '2024-06-09', depth: '10km', distance: '55km' },
      { value: 2.8, time: '20:00', location: '乐山市', date: '2024-06-09', depth: '18km', distance: '95km' }
    ];
    
    const option = {
      grid: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 80
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        borderColor: '#dc2626',
        borderWidth: 2,
        borderRadius: 12,
        padding: [16, 20],
        textStyle: {
          color: '#ffffff',
          fontSize: 13
        },
        position: function (point, params, dom, rect, size) {
          // Smart positioning logic
          const chartHeight = size.contentSize[1];
          const chartWidth = size.contentSize[0];
          const tooltipWidth = size.contentSize[0] * 0.375; // Approximate tooltip width (increased by 25%)
          const tooltipHeight = 150; // Approximate tooltip height (increased by 25%)
          
          let x = point[0];
          let y = point[1];
          
          // Horizontal positioning - prevent overflow
          if (x + tooltipWidth > chartWidth) {
            x = chartWidth - tooltipWidth - 10;
          }
          if (x < 10) {
            x = 10;
          }
          
          // Vertical positioning - smart placement
          if (y < chartHeight / 2) {
            // Point is in upper half, show tooltip below
            y = y + 20;
          } else {
            // Point is in lower half, show tooltip above
            y = y - tooltipHeight - 20;
          }
          
          // Ensure tooltip doesn't go outside chart bounds
          if (y < 10) {
            y = 10;
          }
          if (y + tooltipHeight > chartHeight) {
            y = chartHeight - tooltipHeight - 10;
          }
          
          return [x, y];
        },
        extraCssText: 'box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px);',
        formatter: function(params) {
          const dataPoint = chartData[params.dataIndex];
          const magnitudeColor = dataPoint.value >= 5.0 ? '#ff4757' : dataPoint.value >= 3.0 ? '#ffa502' : '#2ed573';
          const riskLevel = dataPoint.value >= 6.0 ? '🔴 极高风险' : dataPoint.value >= 4.0 ? '🟡 中等风险' : '🟢 低风险';
          
          return `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.2; max-width: 112px; font-size: 10px;">
              <div style="color: #ff6b6b; font-weight: bold; font-size: 11px; margin-bottom: 2px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 1px;">
                🌋 地震
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.08); border-radius: 2px; padding: 2px; margin-bottom: 2px;">
                <div style="margin-bottom: 1px;">
                  <span style="color: #ffd93d; font-size: 9px;">位置:</span>
                  <span style="color: #ffffff; font-weight: 500; font-size: 9px;">${dataPoint.location.split('县')[0]}</span>
                </div>
                <div style="margin-bottom: 1px;">
                  <span style="color: #ffd93d; font-size: 9px;">时间:</span>
                  <span style="color: #ffffff; font-size: 9px;">${dataPoint.time.split(' ')[1]}</span>
                </div>
                <div style="margin-bottom: 1px;">
                  <span style="color: #ffd93d; font-size: 9px;">震级:</span>
                  <span style="color: ${magnitudeColor}; font-weight: 700; font-size: 10px;">M${dataPoint.value}</span>
                </div>
                <div style="margin-bottom: 1px;">
                  <span style="color: #ffd93d; font-size: 9px;">深度:</span>
                  <span style="color: #ffffff; font-size: 9px;">${dataPoint.depth}</span>
                </div>
              </div>
              
              <div style="background: rgba(${dataPoint.value >= 4.0 ? '255, 71, 87' : '42, 213, 115'}, 0.2); border-radius: 2px; padding: 1px; text-align: center;">
                <span style="color: ${dataPoint.value >= 4.0 ? '#ff4757' : '#2ed573'}; font-weight: 600; font-size: 9px;">${riskLevel.split(' ')[1]}</span>
              </div>
            </div>
          `;
        },
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#dc2626',
            width: 1,
            type: 'dashed'
          },
          lineStyle: {
            color: '#dc2626',
            width: 1,
            type: 'dashed'
          }
        }
      },
      xAxis: {
        type: 'category',
        data: chartData.map(item => item.time),
        axisPointer: {
          type: 'shadow'
        }
      },
      yAxis: {
        type: 'value',
        name: 'Magnitude',
        nameLocation: 'middle',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#374151'
        },
        axisPointer: {
          type: 'line'
        },
        axisLabel: {
          fontSize: 11,
          color: '#6b7280'
        }
      },
      series: [{
        data: chartData.map((item) => ({
          value: item.value,
          itemStyle: {
            color: item.value >= 5.0 ? '#ff4757' : item.value >= 3.0 ? '#ffa502' : '#2ed573',
            borderColor: '#ffffff',
            borderWidth: 2,
            shadowBlur: 6,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        })),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: function(value) {
          return Math.max(8, Math.min(16, value * 2));
        },
        lineStyle: {
          color: '#dc2626',
          width: 3,
          shadowBlur: 4,
          shadowColor: 'rgba(220, 38, 38, 0.3)'
        },
        emphasis: {
          focus: 'series',
          scale: true,
          itemStyle: {
            borderWidth: 4,
            shadowBlur: 20,
            shadowColor: 'rgba(220, 38, 38, 0.6)'
          },
          lineStyle: {
            width: 4,
            shadowBlur: 8,
            shadowColor: 'rgba(220, 38, 38, 0.5)'
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: 'rgba(220, 38, 38, 0.4)'
            }, {
              offset: 1,
              color: 'rgba(220, 38, 38, 0.1)'
            }]
          }
        },
        markPoint: {
          data: [{
            type: 'max',
            name: '最强震级',
            itemStyle: {
              color: '#ff4757',
              borderColor: '#ffffff',
              borderWidth: 3,
              shadowBlur: 15,
              shadowColor: 'rgba(255, 71, 87, 0.6)'
            }
          }]
        }
      }]
    };
    chart.setOption(option);
    
    // Add hover interactions
    chart.on('mouseover', function(params) {
      // Highlight the hovered point with animation
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    });
    
    chart.on('mouseout', function(params) {
      // Remove highlight when mouse leaves
      chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: params.dataIndex
      });
    });
    
    // Add click interaction for detailed view
    chart.on('click', function(params) {
      const clickedData = chartData[params.dataIndex];
      console.log('Clicked earthquake data:', clickedData);
      
      // You can add more interactive features here
      // For example, showing a detailed modal or navigating to details
    });
    
    // Make chart responsive
    window.addEventListener('resize', function() {
      if (chart) {
        chart.resize();
      }
    });
  }
};

onMounted(() => {
  updateTime();
  const timer = setInterval(updateTime, 60000);
  initChart();

  // Initialize sound manager
  alertSoundManager.value = new AlertSoundManager();
  alertSoundManager.value.setVolume(soundVolume.value);

  // Show emergency modal after 5 seconds
  setTimeout(() => {
    showEmergencyModal.value = true;
    // Play alert sound when emergency modal appears
    if (soundEnabled.value && alertSoundManager.value) {
      alertSoundManager.value.playAlert();
    }
    // Start countdown with random time between 15-45 seconds
    const randomSeconds = Math.floor(Math.random() * 31) + 15;
    startCountdown(randomSeconds);
  }, 5000);

  onUnmounted(() => {
    clearInterval(timer);
    stopCountdown(); // Clean up countdown timer
    if (longPressTimer.value) {
      clearInterval(longPressTimer.value);
    }
    if (chart) {
      chart.dispose();
    }
  });
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-flash {
  animation: flash 1s ease-in-out infinite;
}

@keyframes flash {
  0%, 100% {
    background-color: rgb(220, 38, 38);
  }
  50% {
    background-color: rgb(185, 28, 28);
  }
}
</style>