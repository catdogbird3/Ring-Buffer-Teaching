// app.js

// Default configuration
const defaultConfig = {
  main_title: '🔌 嵌入式通訊協議互動教學',
  background_color: '#0f172a',
  surface_color: '#1e293b',
  text_color: '#f1f5f9',
  primary_color: '#3b82f6',
  accent_color: '#10b981'
};

// Ring Buffer State
const BUFFER_SIZE = 8;
let ringBuffer = {
  data: new Array(BUFFER_SIZE).fill(null),
  writeIdx: 0,
  readIdx: 0,
  count: 0
};

// Initialize Ring Buffer UI
function initRingBuffer() {
  const container = document.getElementById('ring-cells');
  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < BUFFER_SIZE; i++) {
    const angle = (i * 360 / BUFFER_SIZE) - 90;
    const radius = 90;
    const x = 140 + radius * Math.cos(angle * Math.PI / 180);
    const y = 140 + radius * Math.sin(angle * Math.PI / 180);

    const cell = document.createElement('div');
    cell.className =
      'ring-cell absolute w-10 h-10 rounded-lg border-2 border-slate-600 bg-slate-700 flex items-center justify-center text-sm font-mono transition-all cursor-pointer hover:scale-110';
    cell.style.left = `${x - 20}px`;
    cell.style.top = `${y - 20}px`;
    cell.dataset.index = i;
    cell.textContent = i;
    container.appendChild(cell);
  }

  updateRingBufferUI();
}

function updateRingBufferUI() {
  const cells = document.querySelectorAll('.ring-cell');
  cells.forEach((cell, idx) => {
    cell.classList.remove('write-head', 'read-head', 'has-data');

    if (ringBuffer.data[idx] !== null) {
      cell.classList.add('has-data');
      cell.textContent = ringBuffer.data[idx];
    } else {
      cell.textContent = idx;
    }

    if (idx === ringBuffer.writeIdx) {
      cell.classList.add('write-head');
    }
    if (idx === ringBuffer.readIdx && ringBuffer.count > 0) {
      cell.classList.add('read-head');
    }
  });

  const countEl = document.getElementById('buffer-count');
  if (countEl) countEl.textContent = ringBuffer.count;
}

function writeToBuffer() {
  const status = document.getElementById('ring-status');
  if (!status) return;

  if (ringBuffer.count >= BUFFER_SIZE) {
    status.textContent = '⚠️ 緩衝區已滿！無法寫入（會覆蓋未讀資料）';
    status.className = 'mt-4 text-center text-sm text-amber-400';
    return;
  }

  const value = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  ringBuffer.data[ringBuffer.writeIdx] = value;
  ringBuffer.writeIdx = (ringBuffer.writeIdx + 1) % BUFFER_SIZE;
  ringBuffer.count++;

  status.textContent = `✅ 寫入 "${value}" 到位置 ${(ringBuffer.writeIdx - 1 + BUFFER_SIZE) % BUFFER_SIZE}`;
  status.className = 'mt-4 text-center text-sm text-emerald-400';

  updateRingBufferUI();
}

function readFromBuffer() {
  const status = document.getElementById('ring-status');
  if (!status) return;

  if (ringBuffer.count <= 0) {
    status.textContent = '⚠️ 緩衝區為空！沒有資料可讀';
    status.className = 'mt-4 text-center text-sm text-amber-400';
    return;
  }

  const value = ringBuffer.data[ringBuffer.readIdx];
  ringBuffer.data[ringBuffer.readIdx] = null;
  const readPos = ringBuffer.readIdx;
  ringBuffer.readIdx = (ringBuffer.readIdx + 1) % BUFFER_SIZE;
  ringBuffer.count--;

  status.textContent = `📖 從位置 ${readPos} 讀取 "${value}"`;
  status.className = 'mt-4 text-center text-sm text-blue-400';

  updateRingBufferUI();
}

function resetBuffer() {
  ringBuffer = {
    data: new Array(BUFFER_SIZE).fill(null),
    writeIdx: 0,
    readIdx: 0,
    count: 0
  };

  const status = document.getElementById('ring-status');
  if (status) {
    status.textContent = '🔄 緩衝區已重置';
    status.className = 'mt-4 text-center text-sm text-slate-400';
  }

  updateRingBufferUI();
}

// Tab switching
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    }
  });

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.add('hidden');
  });

  const targetPanel = document.getElementById(`panel-${tabId}`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }
}

// Config change handler
async function onConfigChange(config) {
  const title = document.getElementById('main-title');
  if (title) {
    title.textContent = config.main_title || defaultConfig.main_title;
  }

  document.body.style.backgroundColor = config.background_color || defaultConfig.background_color;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initRingBuffer();

  const w = document.getElementById('btn-write');
  const r = document.getElementById('btn-read');
  const rs = document.getElementById('btn-reset');

  if (w) w.addEventListener('click', writeToBuffer);
  if (r) r.addEventListener('click', readFromBuffer);
  if (rs) rs.addEventListener('click', resetBuffer);

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
});

// Element SDK initialization
if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange,
    mapToCapabilities: (config) => ({
      recolorables: [
        {
          get: () => config.background_color || defaultConfig.background_color,
          set: (value) => window.elementSdk.setConfig({ background_color: value })
        },
        {
          get: () => config.surface_color || defaultConfig.surface_color,
          set: (value) => window.elementSdk.setConfig({ surface_color: value })
        },
        {
          get: () => config.text_color || defaultConfig.text_color,
          set: (value) => window.elementSdk.setConfig({ text_color: value })
        },
        {
          get: () => config.primary_color || defaultConfig.primary_color,
          set: (value) => window.elementSdk.setConfig({ primary_color: value })
        },
        {
          get: () => config.accent_color || defaultConfig.accent_color,
          set: (value) => window.elementSdk.setConfig({ accent_color: value })
        }
      ],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    }),
    mapToEditPanelValues: (config) => new Map([
      ['main_title', config.main_title || defaultConfig.main_title]
    ])
  });
}