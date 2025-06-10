<script setup>
import { ref, computed } from 'vue';
import EarthquakeMonitoring from './components/EarthquakeMonitoring.vue';
import MapView from './components/MapView.vue';
import AlertView from './components/AlertView.vue';
import GuideView from './components/GuideView.vue';

const currentView = ref('monitoring');

const currentComponent = computed(() => {
  switch(currentView.value) {
    case 'monitoring': return EarthquakeMonitoring;
    case 'map': return MapView;
    case 'alert': return AlertView;
    case 'guide': return GuideView;
    default: return EarthquakeMonitoring;
  }
});
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <div class="flex-1 overflow-y-auto pb-16">
      <component :is="currentComponent"></component>
    </div>
    
    <nav class="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 shadow-lg">
      <div class="grid grid-cols-4 h-16">
        <button 
          @click="currentView = 'monitoring'"
          class="flex flex-col items-center justify-center"
          :class="currentView === 'monitoring' ? 'text-red-600' : 'text-gray-600'"
        >
          <i class="fas fa-chart-line text-xl"></i>
          <span class="text-xs mt-1">监测</span>
        </button>
        <button 
          @click="currentView = 'map'"
          class="flex flex-col items-center justify-center"
          :class="currentView === 'map' ? 'text-red-600' : 'text-gray-600'"
        >
          <i class="fas fa-map-marked-alt text-xl"></i>
          <span class="text-xs mt-1">地图</span>
        </button>
        <button 
          @click="currentView = 'alert'"
          class="flex flex-col items-center justify-center"
          :class="currentView === 'alert' ? 'text-red-600' : 'text-gray-600'"
        >
          <i class="fas fa-bell text-xl"></i>
          <span class="text-xs mt-1">预警</span>
        </button>
        <button 
          @click="currentView = 'guide'"
          class="flex flex-col items-center justify-center"
          :class="currentView === 'guide' ? 'text-red-600' : 'text-gray-600'"
        >
          <i class="fas fa-book text-xl"></i>
          <span class="text-xs mt-1">指南</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>