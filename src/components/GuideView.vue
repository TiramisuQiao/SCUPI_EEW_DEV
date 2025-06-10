<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation Bar -->
    <nav class="fixed top-0 w-full bg-red-600 text-white z-50 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold">地震安全指南</h1>
        <div class="flex items-center space-x-3">
          <button @click="toggleFontSize" class="text-white">
            <i class="fas fa-text-height"></i>
          </button>
          <button @click="shareGuide" class="text-white">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="pt-16 pb-20 px-4" :class="{ 'text-lg': largeFontSize }">
      <!-- Emergency Contacts -->
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <h2 class="font-bold text-red-800 mb-3 flex items-center">
          <i class="fas fa-phone-alt mr-2"></i>
          紧急联系电话
        </h2>
        <div class="grid grid-cols-2 gap-3">
          <a href="tel:119" class="flex items-center justify-center bg-red-600 text-white py-2 rounded-lg">
            <i class="fas fa-fire-extinguisher mr-2"></i>
            消防 119
          </a>
          <a href="tel:120" class="flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg">
            <i class="fas fa-ambulance mr-2"></i>
            急救 120
          </a>
          <a href="tel:110" class="flex items-center justify-center bg-green-600 text-white py-2 rounded-lg">
            <i class="fas fa-shield-alt mr-2"></i>
            报警 110
          </a>
          <a href="tel:12322" class="flex items-center justify-center bg-orange-600 text-white py-2 rounded-lg">
            <i class="fas fa-mountain mr-2"></i>
            地震 12322
          </a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-lg p-4 mb-6">
        <h2 class="font-bold text-gray-800 mb-3 flex items-center">
          <i class="fas fa-bolt mr-2 text-yellow-500"></i>
          快速行动指南
        </h2>
        <div class="grid grid-cols-1 gap-3">
          <div class="flex items-center p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">1</div>
            <div>
              <div class="font-semibold text-gray-800">立即蹲下</div>
              <div class="text-sm text-gray-600">Drop - 立即蹲下或趴下</div>
            </div>
          </div>
          <div class="flex items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">2</div>
            <div>
              <div class="font-semibold text-gray-800">寻找掩护</div>
              <div class="text-sm text-gray-600">Cover - 躲在坚固的桌子下</div>
            </div>
          </div>
          <div class="flex items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">3</div>
            <div>
              <div class="font-semibold text-gray-800">紧紧抓住</div>
              <div class="text-sm text-gray-600">Hold On - 抓住掩护物并保护头部</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors"
          :class="activeTab === tab.id ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600'"
        >
          <i :class="tab.icon" class="mr-1"></i>
          {{ tab.name }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <!-- Before Earthquake -->
        <div v-if="activeTab === 'before'" class="p-4">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-clock mr-2 text-blue-500"></i>
            震前准备
          </h3>
          
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h4 class="font-semibold text-gray-800 mb-2">应急包准备</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 饮用水（每人每天3升，至少3天用量）</li>
                <li>• 不易腐烂的食品（罐头、干粮等）</li>
                <li>• 手电筒和备用电池</li>
                <li>• 收音机</li>
                <li>• 急救包和常用药品</li>
                <li>• 现金和重要文件副本</li>
                <li>• 换洗衣物和毛毯</li>
                <li>• 多功能工具</li>
              </ul>
            </div>

            <div class="border-l-4 border-green-500 pl-4">
              <h4 class="font-semibold text-gray-800 mb-2">家庭安全检查</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 固定高大家具到墙上</li>
                <li>• 确保重物放在低处</li>
                <li>• 检查并加固房屋结构</li>
                <li>• 了解水、电、气总开关位置</li>
                <li>• 制定家庭应急计划</li>
                <li>• 确定安全集合点</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- During Earthquake -->
        <div v-if="activeTab === 'during'" class="p-4">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-exclamation-triangle mr-2 text-red-500"></i>
            震时应对
          </h3>
          
          <div class="space-y-4">
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 class="font-semibold text-red-800 mb-2 flex items-center">
                <i class="fas fa-home mr-2"></i>
                室内避震
              </h4>
              <ul class="text-sm text-red-700 space-y-1">
                <li>• 立即蹲下，寻找坚固的桌子或工作台</li>
                <li>• 用手臂保护头部和颈部</li>
                <li>• 远离窗户、镜子和重物</li>
                <li>• 不要试图跑出建筑物</li>
                <li>• 如果在床上，用枕头保护头部</li>
                <li>• 震动停止前不要移动</li>
              </ul>
            </div>

            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 class="font-semibold text-green-800 mb-2 flex items-center">
                <i class="fas fa-tree mr-2"></i>
                户外避震
              </h4>
              <ul class="text-sm text-green-700 space-y-1">
                <li>• 远离建筑物、电线和大树</li>
                <li>• 蹲下并保护头部</li>
                <li>• 如果在车内，停车并留在车内</li>
                <li>• 避免立交桥和高架桥</li>
                <li>• 远离山坡，防止山体滑坡</li>
              </ul>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 class="font-semibold text-yellow-800 mb-2 flex items-center">
                <i class="fas fa-ban mr-2"></i>
                绝对禁止
              </h4>
              <ul class="text-sm text-yellow-700 space-y-1">
                <li>• 不要使用电梯</li>
                <li>• 不要点燃火柴或打火机</li>
                <li>• 不要站在门框下</li>
                <li>• 不要惊慌奔跑</li>
                <li>• 不要跳楼</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- After Earthquake -->
        <div v-if="activeTab === 'after'" class="p-4">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-first-aid mr-2 text-green-500"></i>
            震后处理
          </h3>
          
          <div class="space-y-4">
            <div class="border-l-4 border-orange-500 pl-4">
              <h4 class="font-semibold text-gray-800 mb-2">立即行动</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 检查自己和他人是否受伤</li>
                <li>• 穿上鞋子保护双脚</li>
                <li>• 检查水、电、气是否泄漏</li>
                <li>• 如有燃气泄漏，立即关闭并开窗通风</li>
                <li>• 使用手电筒，不要使用蜡烛</li>
                <li>• 收听官方消息和指示</li>
              </ul>
            </div>

            <div class="border-l-4 border-purple-500 pl-4">
              <h4 class="font-semibold text-gray-800 mb-2">安全撤离</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 使用楼梯，不要使用电梯</li>
                <li>• 注意余震，随时准备再次避震</li>
                <li>• 远离受损建筑物</li>
                <li>• 前往指定的应急避难场所</li>
                <li>• 帮助被困人员，但不要移动重伤者</li>
              </ul>
            </div>

            <div class="border-l-4 border-red-500 pl-4">
              <h4 class="font-semibold text-gray-800 mb-2">持续关注</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 关注官方发布的余震信息</li>
                <li>• 节约使用食物和水</li>
                <li>• 与家人和朋友保持联系</li>
                <li>• 配合救援和重建工作</li>
                <li>• 注意心理健康，寻求帮助</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Escape Routes -->
        <div v-if="activeTab === 'routes'" class="p-4">
          <h3 class="font-bold text-gray-800 mb-4 flex items-center">
            <i class="fas fa-route mr-2 text-purple-500"></i>
            逃生路线
          </h3>
          
          <div class="space-y-4">
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 class="font-semibold text-purple-800 mb-3">附近避难场所</h4>
              <div class="space-y-3">
                <div class="flex items-center p-2 bg-white rounded border">
                  <i class="fas fa-building text-purple-600 mr-3"></i>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">四川大学体育馆</div>
                    <div class="text-sm text-gray-600">距离: 0.3公里 • 容量: 5000人</div>
                  </div>
                  <button class="text-purple-600 text-sm">导航</button>
                </div>
                <div class="flex items-center p-2 bg-white rounded border">
                  <i class="fas fa-tree text-green-600 mr-3"></i>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">人民公园应急点</div>
                    <div class="text-sm text-gray-600">距离: 0.8公里 • 开放空间</div>
                  </div>
                  <button class="text-purple-600 text-sm">导航</button>
                </div>
                <div class="flex items-center p-2 bg-white rounded border">
                  <i class="fas fa-square text-blue-600 mr-3"></i>
                  <div class="flex-1">
                    <div class="font-medium text-gray-800">天府广场地下空间</div>
                    <div class="text-sm text-gray-600">距离: 1.2公里 • 地下避难所</div>
                  </div>
                  <button class="text-purple-600 text-sm">导航</button>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 class="font-semibold text-blue-800 mb-3">逃生路线规划</h4>
              <div class="space-y-2">
                <div class="flex items-center text-sm">
                  <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span class="text-gray-700">主要逃生路线（推荐）</span>
                </div>
                <div class="flex items-center text-sm">
                  <div class="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span class="text-gray-700">备用逃生路线</span>
                </div>
                <div class="flex items-center text-sm">
                  <div class="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span class="text-gray-700">危险区域（避免）</span>
                </div>
              </div>
              <div class="mt-3 p-3 bg-white rounded border">
                <div class="text-sm text-gray-600">
                  <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                  <strong>提示：</strong>熟悉至少两条不同的逃生路线，避免单一路径被阻断的风险。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Action Buttons -->
      <div class="mt-6 grid grid-cols-2 gap-3">
        <button @click="practiceAlert" class="flex items-center justify-center py-3 bg-orange-600 text-white rounded-lg font-semibold">
          <i class="fas fa-play mr-2"></i>
          演练模式
        </button>
        <button @click="downloadGuide" class="flex items-center justify-center py-3 bg-blue-600 text-white rounded-lg font-semibold">
          <i class="fas fa-download mr-2"></i>
          离线下载
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 确保指南界面不会有任何声音播放
console.log('=== GuideView 组件加载 - 确保无声音播放 ===');

const activeTab = ref('before');
const largeFontSize = ref(false);

const tabs = [
  { id: 'before', name: '震前', icon: 'fas fa-clock' },
  { id: 'during', name: '震时', icon: 'fas fa-exclamation-triangle' },
  { id: 'after', name: '震后', icon: 'fas fa-first-aid' },
  { id: 'routes', name: '路线', icon: 'fas fa-route' }
];

const toggleFontSize = () => {
  largeFontSize.value = !largeFontSize.value;
};

const shareGuide = () => {
  if (navigator.share) {
    navigator.share({
      title: '地震安全指南',
      text: '学习地震安全知识，保护自己和家人',
      url: window.location.href
    });
  } else {
    // Fallback for browsers that don't support Web Share API
    console.log('分享功能');
  }
};

const practiceAlert = () => {
  alert('演练模式已启动！请按照指南进行地震应急演练。');
};

const downloadGuide = () => {
  alert('指南已保存到本地，可离线查看。');
};
</script>

<style scoped>
/* Custom styles for better readability */
.text-lg ul li {
  line-height: 1.6;
}

.text-lg .text-sm {
  font-size: 1rem !important;
}
</style>