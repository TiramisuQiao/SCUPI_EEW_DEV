<template>
  <div class="flex flex-col h-full bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm p-4 border-b">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-800 flex items-center">
          <i class="fas fa-map-marked-alt mr-2 text-blue-600"></i>
          地震分布图
        </h1>
        <div class="flex items-center space-x-4">
          <!-- Auto-refresh indicator -->
          <div class="flex items-center text-sm text-gray-600">
            <div class="w-2 h-2 rounded-full mr-2" :class="isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'"></div>
            <span>{{ isLoading ? '更新中...' : '实时同步' }}</span>
          </div>
          <!-- Last update time -->
          <div class="text-sm text-gray-500">
            更新: {{ lastUpdateTime }}
          </div>
        </div>
      </div>
      <!-- Legend below header -->
      <div class="mt-3 flex flex-wrap items-center space-x-6 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-green-400"></div>
          <span>轻微 (1-3)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-yellow-400"></div>
          <span>中等 (4-5)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>强烈 (6-7)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-red-600"></div>
          <span>极强 (8+)</span>
        </div>
        <div v-if="showShelters" class="flex items-center space-x-2">
          <i class="fas fa-shield-alt text-blue-600"></i>
          <span>避难所</span>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-wrapper relative flex-1">
      <!-- Map Display -->
      <div id="earthquake-map" class="map-display w-full h-full"></div>
      <!-- Map Controls -->
      <div class="map-controls">
        <div class="control-group">
          <button @click="toggleMapType" class="control-btn" :title="mapType === 'street' ? '切换到卫星视图' : '切换到街道视图'">
            <i :class="mapType === 'street' ? 'fas fa-satellite' : 'fas fa-map'"></i>
          </button>
          <button @click="resetMapView" class="control-btn" title="重置视图">
            <i class="fas fa-home"></i>
          </button>
          <button @click="refreshData" class="control-btn" :disabled="isLoading" title="刷新数据">
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          </button>
          <button @click="toggleShelters" class="control-btn" :class="{ active: showShelters }" title="显示/隐藏避难所">
            <i class="fas fa-shield-alt"></i>
          </button>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <span>加载地震数据中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 确保地图界面不会有任何声音播放
console.log('=== MapView 组件加载 - 确保无声音播放 ===');

// Reactive data
const map = ref(null);
const isLoading = ref(false);
const lastUpdateTime = ref('');
const mapType = ref('street');
const earthquakeData = ref([]);
const markers = ref([]);
const intensityOverlays = ref([]);
const refreshInterval = ref(null);

// Shelter-related reactive data
const shelterData = ref([]);
const shelterMarkers = ref([]);
const showShelters = ref(true);

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

// Mock earthquake data generator (Sichuan area)
const generateMockEarthquakeData = () => {
  const baseEarthquakes = [
    { id: 1, lat: 30.6598, lng: 104.0633, magnitude: 5.2, depth: 15, location: '成都市', time: new Date() },
    { id: 2, lat: 31.4677, lng: 104.6794, magnitude: 4.1, depth: 8, location: '绵阳市', time: new Date() },
    { id: 3, lat: 31.1270, lng: 104.3984, magnitude: 6.3, depth: 22, location: '德阳市', time: new Date() },
    { id: 4, lat: 30.9823, lng: 104.2821, magnitude: 3.8, depth: 12, location: '广汉市', time: new Date() },
    { id: 5, lat: 31.1252, lng: 104.1669, magnitude: 5.5, depth: 25, location: '什邡市', time: new Date() }
  ];

  // Add some randomization to simulate real-time updates
  return baseEarthquakes.map(eq => ({
    ...eq,
    magnitude: eq.magnitude + (Math.random() - 0.5) * 0.5,
    depth: eq.depth + Math.floor((Math.random() - 0.5) * 10),
    time: new Date(Date.now() - Math.random() * 86400000) // Random time within last 24 hours
  }));
};

// Generate shelter data near earthquake sources (Sichuan area)
const generateShelterData = () => {
  return [
    {
      id: 1,
      name: '成都市体育中心',
      lat: 30.6608, // Near Chengdu earthquake (30.6598, 104.0633)
      lng: 104.0643,
      type: '大型避难所',
      capacity: 800,
      facilities: ['医疗救护', '食物供应', '饮用水', '通讯设备'],
      address: '成都市武侯区体育中心路1号',
      contact: '028-85311234'
    },
    {
      id: 2,
      name: '绵阳市体育馆',
      lat: 31.4687, // Near Mianyang earthquake (31.4677, 104.6794)
      lng: 104.6804,
      type: '中型避难所',
      capacity: 400,
      facilities: ['基本医疗', '食物供应', '饮用水'],
      address: '绵阳市涪城区剑门路东段190号',
      contact: '0816-2311567'
    },
    {
      id: 3,
      name: '德阳市会议中心',
      lat: 31.1280, // Near Deyang earthquake (31.1270, 104.3984)
      lng: 104.3994,
      type: '临时集合点',
      capacity: 300,
      facilities: ['基本设施', '临时食物'],
      address: '德阳市旌阳区长江西路二段12号',
      contact: '0838-2311890'
    },
    {
      id: 4,
      name: '广汉市政府广场',
      lat: 30.9833, // Near Guanghan earthquake (30.9823, 104.2821)
      lng: 104.2831,
      type: '政府避难所',
      capacity: 500,
      facilities: ['医疗救护', '食物供应', '饮用水', '政府协调'],
      address: '广汉市雒城镇房湖路60号',
      contact: '0838-5222345'
    },
    {
      id: 5,
      name: '什邡市人民公园',
      lat: 31.1262, // Near Shifang earthquake (31.1252, 104.1669)
      lng: 104.1679,
      type: '临时避难所',
      capacity: 350,
      facilities: ['基本医疗', '食物供应', '饮用水'],
      address: '什邡市方亭街道人民公园',
      contact: '0838-8202456'
    },
    {
      id: 6,
      name: '彭州市体育中心',
      lat: 30.9900,
      lng: 103.9580,
      type: '中型避难所',
      capacity: 450,
      facilities: ['医疗救护', '食物供应', '饮用水', '通讯设备'],
      address: '彭州市天彭街道金彭西路168号',
      contact: '028-83708123'
    }
  ];
};

// Get color based on magnitude
const getMagnitudeColor = (magnitude) => {
  if (magnitude >= 8) return '#dc2626'; // red-600
  if (magnitude >= 6) return '#ea580c'; // orange-600
  if (magnitude >= 4) return '#ca8a04'; // yellow-600
  if (magnitude >= 2) return '#16a34a'; // green-600
  return '#059669'; // emerald-600
};

// Get marker size based on magnitude
const getMarkerRadius = (magnitude) => {
  return Math.max(8, magnitude * 3);
};

// Create custom earthquake marker with ripple effect
const createEarthquakeMarker = (earthquake) => {
  // Validate earthquake data
  if (!earthquake || !earthquake.id) {
    console.error('Invalid earthquake data:', earthquake);
    return null;
  }
  
  const color = getMagnitudeColor(earthquake.magnitude);
  const radius = getMarkerRadius(earthquake.magnitude);
  
  // Create main marker (stays stationary)
  const marker = L.circleMarker([earthquake.lat, earthquake.lng], {
    radius: radius,
    fillColor: color,
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
    className: 'earthquake-marker-static',
    interactive: true  // Explicitly enable interaction
  });
  
  // Create ripple effect container
  const rippleContainer = L.divIcon({
    className: 'earthquake-ripple-container',
    html: `
      <div class="ripple-effect" style="--ripple-color: ${color}; --ripple-size: ${radius * 4}px;">
        <div class="ripple ripple-1"></div>
        <div class="ripple ripple-2"></div>
        <div class="ripple ripple-3"></div>
      </div>
    `,
    iconSize: [radius * 8, radius * 8],
    iconAnchor: [radius * 4, radius * 4]
  });
  
  // Add ripple effect as a separate layer
  const rippleMarker = L.marker([earthquake.lat, earthquake.lng], {
    icon: rippleContainer,
    interactive: false,  // Ensure ripple doesn't interfere
    zIndexOffset: -100   // Put ripple behind main marker
  });

  // Create popup content with error handling
  const popupContent = `
    <div class="popup-content">
      <h3 class="popup-title">
        <i class="fas fa-exclamation-triangle text-red-600"></i>
        ${earthquake.location || '未知位置'}
      </h3>
      <div class="popup-details">
        <div class="detail-row">
          <span class="label">震级:</span>
          <span class="value magnitude">${(earthquake.magnitude || 0).toFixed(1)}</span>
        </div>
        <div class="detail-row">
          <span class="label">深度:</span>
          <span class="value">${earthquake.depth || '未知'}km</span>
        </div>
        <div class="detail-row">
          <span class="label">时间:</span>
          <span class="value">${earthquake.time ? earthquake.time.toLocaleString('zh-CN') : '时间未知'}</span>
        </div>
        <div class="detail-row">
          <span class="label">坐标:</span>
          <span class="value">${earthquake.lat ? earthquake.lat.toFixed(3) : '0'}, ${earthquake.lng ? earthquake.lng.toFixed(3) : '0'}</span>
        </div>
      </div>
    </div>
  `;

  // Bind popup with error handling
  try {
    marker.bindPopup(popupContent, {
      maxWidth: 280,
      className: 'earthquake-popup'
    });
    
    // Add click event listener for debugging
    marker.on('click', function() {
      console.log('Earthquake marker clicked:', earthquake.id, earthquake.location);
    });
    
  } catch (error) {
    console.error('Error binding popup for earthquake:', earthquake.id, error);
  }

  return { marker, rippleMarker };
};

// Create simplified shelter marker
const createShelterMarker = (shelter) => {
  // Create shelter icon
  const shelterIcon = L.divIcon({
    className: 'shelter-marker',
    html: `
      <div class="shelter-icon">
        <i class="fas fa-shield-alt"></i>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  const marker = L.marker([shelter.lat, shelter.lng], {
    icon: shelterIcon,
    zIndexOffset: 50
  });

  // Create popup content
  const facilitiesText = shelter.facilities ? shelter.facilities.join('、') : '基本设施';
  const popupContent = `
    <div class="popup-content">
      <h3 class="popup-title">
        <i class="fas fa-shield-alt text-blue-600"></i>
        ${shelter.name}
      </h3>
      <div class="popup-details">
        <div class="detail-row">
          <span class="label">类型:</span>
          <span class="value">${shelter.type}</span>
        </div>
        <div class="detail-row">
          <span class="label">容量:</span>
          <span class="value">${shelter.capacity}人</span>
        </div>
        <div class="detail-row">
          <span class="label">设施:</span>
          <span class="value">${facilitiesText}</span>
        </div>
        <div class="detail-row">
          <span class="label">地址:</span>
          <span class="value">${shelter.address || '详细地址待更新'}</span>
        </div>
        <div class="detail-row">
          <span class="label">联系电话:</span>
          <span class="value contact">${shelter.contact || '联系方式待更新'}</span>
        </div>
      </div>
    </div>
  `;

  marker.bindPopup(popupContent, {
    maxWidth: 240,
    className: 'shelter-popup'
  });

  return marker;
};

// Create shaking intensity overlay
const createIntensityOverlay = (earthquake) => {
  try {
    if (!earthquake || !earthquake.magnitude || !earthquake.lat || !earthquake.lng) {
      console.error('Invalid earthquake data for intensity overlay:', earthquake);
      return null;
    }
    
    const color = getMagnitudeColor(earthquake.magnitude);
    const radius = Math.max(1000, earthquake.magnitude * 15000); // Minimum 1km radius
    
    const circle = L.circle([earthquake.lat, earthquake.lng], {
      radius: radius,
      fillColor: color,
      color: color,
      weight: 1,
      opacity: 0.3,
      fillOpacity: 0.1
    });

    return circle;
  } catch (error) {
    console.error('Error creating intensity overlay:', error);
    return null;
  }
};

// Clear all markers and overlays
const clearMapElements = () => {
  markers.value.forEach(markerGroup => {
    if (markerGroup.marker) map.value.removeLayer(markerGroup.marker);
    if (markerGroup.rippleMarker) map.value.removeLayer(markerGroup.rippleMarker);
  });
  intensityOverlays.value.forEach(overlay => map.value.removeLayer(overlay));
  markers.value = [];
  intensityOverlays.value = [];
};

// Clear shelter markers
const clearShelterMarkers = () => {
  shelterMarkers.value.forEach(marker => {
    if (marker) map.value.removeLayer(marker);
  });
  shelterMarkers.value = [];
};

// Update shelter display
const updateShelterDisplay = () => {
  if (!map.value) return;
  
  clearShelterMarkers();
  
  if (showShelters.value) {
    shelterData.value.forEach(shelter => {
      const marker = createShelterMarker(shelter);
      marker.addTo(map.value);
      shelterMarkers.value.push(marker);
    });
  }
};

// Update earthquake markers and overlays
const updateEarthquakeDisplay = () => {
  if (!map.value) return;

  clearMapElements();

  console.log('Updating earthquake display with', earthquakeData.value.length, 'earthquakes');

  earthquakeData.value.forEach((earthquake, index) => {
    try {
      // Validate earthquake data before processing
      if (!earthquake || !earthquake.id) {
        console.error(`Invalid earthquake at index ${index}:`, earthquake);
        return;
      }

      // Add intensity overlay
      const overlay = createIntensityOverlay(earthquake);
      if (overlay) {
        overlay.addTo(map.value);
        intensityOverlays.value.push(overlay);
      }

      // Add markers (both main marker and ripple effect)
      const markerGroup = createEarthquakeMarker(earthquake);
      if (markerGroup && markerGroup.marker && markerGroup.rippleMarker) {
        markerGroup.rippleMarker.addTo(map.value); // Add ripple first (background)
        markerGroup.marker.addTo(map.value); // Add main marker on top
        markers.value.push(markerGroup);
        console.log(`Successfully added marker for earthquake ${earthquake.id} at ${earthquake.location}`);
      } else {
        console.error(`Failed to create marker group for earthquake ${earthquake.id}`);
      }
    } catch (error) {
      console.error(`Error processing earthquake ${earthquake.id}:`, error);
    }
  });

  console.log('Earthquake display update completed. Total markers:', markers.value.length);
};

// Load earthquake data
const loadEarthquakeData = async () => {
  isLoading.value = true;
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    earthquakeData.value = generateMockEarthquakeData();
    lastUpdateTime.value = new Date().toLocaleString('zh-CN');
    
    updateEarthquakeDisplay();
  } catch (error) {
    console.error('Failed to load earthquake data:', error);
  } finally {
    isLoading.value = false;
  }
};

// Load shelter data
const loadShelterData = async () => {
  try {
    shelterData.value = generateShelterData();
    updateShelterDisplay();
  } catch (error) {
    console.error('Failed to load shelter data:', error);
  }
};

// Toggle shelter display
const toggleShelters = () => {
  showShelters.value = !showShelters.value;
  updateShelterDisplay();
};

// Toggle map type
const toggleMapType = () => {
  if (!map.value) return;

  mapType.value = mapType.value === 'street' ? 'satellite' : 'street';
  
  // Remove existing tile layers
  map.value.eachLayer(layer => {
    if (layer instanceof L.TileLayer) {
      map.value.removeLayer(layer);
    }
  });

  // Add new tile layer
  const tileLayer = mapType.value === 'street' 
    ? L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      })
    : L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri & contributors'
      });
  
  tileLayer.addTo(map.value);
};

// Reset map view
const resetMapView = () => {
  if (!map.value) return;
  map.value.setView([30.9, 104.3], 9); // Center of Sichuan region
};

// Refresh data manually
const refreshData = () => {
  if (!isLoading.value) {
    loadEarthquakeData();
  }
};

// Initialize map
const initializeMap = async () => {
  await nextTick();
  
  // Create map centered on Sichuan region
  map.value = L.map('earthquake-map', {
    center: [30.9, 104.3],
    zoom: 9,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
    dragging: true,
    touchZoom: true
  });

  // Add initial tile layer
  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  });
  tileLayer.addTo(map.value);

  // Load initial data
  await Promise.all([
    loadEarthquakeData(),
    loadShelterData()
  ]);
};

// Setup auto-refresh
const setupAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    if (!isLoading.value) {
      loadEarthquakeData();
    }
  }, 30000); // Refresh every 30 seconds
};

// Cleanup auto-refresh
const cleanupAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
};

// Lifecycle hooks
onMounted(() => {
  initializeMap();
  setupAutoRefresh();
});

onUnmounted(() => {
  cleanupAutoRefresh();
  if (map.value) {
    map.value.remove();
  }
});
</script>

<style scoped>
.map-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafb;
}

.map-wrapper {
  flex: 1;
  position: relative;
}

.map-display {
  width: 100%;
  height: 100%;
  border-radius: 0;
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.control-btn.active {
  background: #3b82f6;
  color: white;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #374151;
}

.status-bar {
  background: white;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.status-info {
  display: flex;
  gap: 20px;
}

.legend {
  display: flex;
  gap: 16px;
  align-items: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.earthquake {
  background: #dc2626;
}

.legend-dot.shelter {
  background: #3b82f6;
}

/* Popup styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.leaflet-popup-content) {
  margin: 0;
  padding: 0;
}

:deep(.leaflet-popup-tip) {
  background: white;
}

.popup-content {
  padding: 16px;
  min-width: 200px;
}

.popup-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.popup-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.label {
  color: #6b7280;
}

.value {
  font-weight: 600;
  color: #1f2937;
}

.value.magnitude {
  color: #dc2626;
}

/* Shelter marker styles */
:deep(.shelter-marker) {
  background: none;
  border: none;
}

.shelter-icon {
  width: 22px;
  height: 22px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.2s ease;
}

.shelter-icon:hover {
  transform: scale(1.1);
  background: #2563eb;
}

.shelter-icon i {
  color: white;
  font-size: 11px;
}

.value.contact {
  color: #3b82f6;
  font-family: monospace;
}

/* Ripple effect animations */
.earthquake-ripple-container {
  pointer-events: none;
}

.ripple-effect {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ripple {
  position: absolute;
  border: 2px solid var(--ripple-color);
  border-radius: 50%;
  pointer-events: none;
  animation: ripple-expand 3s infinite ease-out;
}

.ripple-1 {
  animation-delay: 0s;
}

.ripple-2 {
  animation-delay: 1s;
}

.ripple-3 {
  animation-delay: 2s;
}

@keyframes ripple-expand {
  0% {
    width: var(--ripple-size);
    height: var(--ripple-size);
    opacity: 0.8;
  }
  70% {
    width: calc(var(--ripple-size) * 4);
    height: calc(var(--ripple-size) * 4);
    opacity: 0.2;
  }
  100% {
    width: calc(var(--ripple-size) * 5);
    height: calc(var(--ripple-size) * 5);
    opacity: 0;
  }
}

/* Keep main marker stationary */
.earthquake-marker-static {
  animation: none !important;
}
</style>