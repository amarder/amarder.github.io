const CATEGORIES = [
  "Mail Client", "Mail Server", "Notes", "To-Do", "Phone Photo Shooting",
  "Photo Management", "Calendar", "Cloud File Storage", "RSS", "Contacts",
  "Browser", "Chat", "Bookmarks", "Read It Later", "Word Processing",
  "Spreadsheets", "Presentations", "Shopping Lists", "Meal Planning",
  "Budgeting and Personal Finance", "News", "Music", "Podcasts", "Password Management"
];

const STYLES = `
  #defaults-app {
    font-family: system-ui, -apple-system, sans-serif;
  }
  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e5e7eb;
  }
  .tab {
    padding: 0.75rem 1.25rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s;
  }
  .tab:hover { color: #374151; }
  .tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
  }
  .tab-content { display: none; }
  .tab-content.active { display: block; }
  .search-box {
    width: 100%;
    max-width: 400px;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
  .search-box:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  .category-section { margin-bottom: 2rem; }
  .category-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #1f2937;
  }
  .histogram {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .histogram-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
  }
  .histogram-row:hover .histogram-bar {
    background: #1d4ed8;
  }
  .histogram-label {
    width: 140px;
    flex-shrink: 0;
    font-size: 0.9rem;
    color: #374151;
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .histogram-bar-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .histogram-bar {
    height: 24px;
    background: #2563eb;
    border-radius: 4px;
    transition: all 0.2s;
    min-width: 4px;
  }
  .histogram-count {
    font-size: 0.85rem;
    color: #6b7280;
    min-width: 30px;
  }
  .person-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
  .person-name {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  .person-name a {
    color: #2563eb;
    text-decoration: none;
  }
  .person-name a:hover { text-decoration: underline; }
  .person-date {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
  }
  .person-apps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  .person-app { display: flex; gap: 0.5rem; }
  .person-app-category { color: #6b7280; min-width: 100px; }
  .person-app-value { color: #1f2937; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .stat-card {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
    text-align: center;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2563eb;
  }
  .stat-label { font-size: 0.85rem; color: #6b7280; }
  .category-select {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    background: white;
  }
`;

let data = {};
let entries = [];
let currentTab = 'popular';

function init() {
  const container = document.getElementById('defaults-app');
  if (!container) {
    setTimeout(init, 100);
    return;
  }

  container.innerHTML = `
    <style>${STYLES}</style>
    <div class="loading" style="text-align: center; padding: 2rem; color: #6b7280;">Loading data...</div>
  `;

  loadData();
}

async function loadData() {
  try {
    const response = await fetch('/defaults/data.json');
    data = await response.json();
    
    entries = Object.values(data)
      .filter(e => e._meta && !e.error)
      .sort((a, b) => (b._meta.date || '').localeCompare(a._meta.date || ''));
    
    renderApp();
  } catch (err) {
    document.getElementById('defaults-app').innerHTML = `<p>Error loading data: ${err.message}</p>`;
  }
}

function renderApp() {
  const container = document.getElementById('defaults-app');
  const totalPeople = entries.length;
  const totalResponses = entries.reduce((sum, e) => {
    return sum + CATEGORIES.filter(cat => e[cat]?.length > 0).length;
  }, 0);

  container.innerHTML = `
    <style>${STYLES}</style>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${totalPeople}</div>
        <div class="stat-label">People</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${CATEGORIES.length}</div>
        <div class="stat-label">Categories</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalResponses.toLocaleString()}</div>
        <div class="stat-label">Total Responses</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab ${currentTab === 'popular' ? 'active' : ''}" data-tab="popular">Popular Apps</button>
      <button class="tab ${currentTab === 'people' ? 'active' : ''}" data-tab="people">Browse People</button>
      <button class="tab ${currentTab === 'search' ? 'active' : ''}" data-tab="search">Search Apps</button>
    </div>

    <div class="tab-content ${currentTab === 'popular' ? 'active' : ''}" id="popular-tab">
      <select class="category-select" id="category-select">
        <option value="all">All Categories</option>
        ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
      <div id="popular-content"></div>
    </div>

    <div class="tab-content ${currentTab === 'people' ? 'active' : ''}" id="people-tab">
      <input type="text" class="search-box" id="people-search" placeholder="Search by name...">
      <div id="people-list"></div>
    </div>

    <div class="tab-content ${currentTab === 'search' ? 'active' : ''}" id="search-tab">
      <input type="text" class="search-box" id="app-search" placeholder="Search for an app (e.g., Obsidian, Safari)...">
      <div id="search-results"></div>
    </div>
  `;

  // Attach event listeners
  container.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      renderApp();
    });
  });

  document.getElementById('category-select').addEventListener('change', (e) => {
    renderPopular(e.target.value);
  });

  document.getElementById('people-search').addEventListener('input', (e) => {
    renderPeople(e.target.value);
  });

  document.getElementById('app-search').addEventListener('input', (e) => {
    renderSearch(e.target.value);
  });

  // Render current tab content
  if (currentTab === 'popular') renderPopular('all');
  if (currentTab === 'people') renderPeople('');
  if (currentTab === 'search') renderSearch('');
}

function getAppCounts(category) {
  const counts = {};
  entries.forEach(entry => {
    const apps = entry[category] || [];
    apps.forEach(app => {
      const normalized = app.trim();
      if (normalized) {
        counts[normalized] = (counts[normalized] || 0) + 1;
      }
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
}

function renderPopular(selectedCategory) {
  const container = document.getElementById('popular-content');
  const categories = selectedCategory === 'all' ? CATEGORIES : [selectedCategory];
  
  container.innerHTML = categories.map(category => {
    const apps = getAppCounts(category);
    if (apps.length === 0) return '';
    
    // Find max count for scaling bars
    const maxCount = apps.length > 0 ? apps[0][1] : 1;
    
    return `
      <div class="category-section">
        <h3 class="category-title">${category}</h3>
        <div class="histogram">
          ${apps.map(([app, count]) => {
            const barWidth = (count / maxCount) * 100;
            return `
              <div class="histogram-row" data-app="${app.replace(/"/g, '&quot;')}">
                <span class="histogram-label" title="${app}">${app}</span>
                <div class="histogram-bar-container">
                  <div class="histogram-bar" style="width: ${barWidth}%"></div>
                  <span class="histogram-count">${count}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.histogram-row').forEach(row => {
    row.addEventListener('click', () => {
      currentTab = 'search';
      renderApp();
      document.getElementById('app-search').value = row.dataset.app;
      renderSearch(row.dataset.app);
    });
  });
}

function renderPeople(filter) {
  const container = document.getElementById('people-list');
  const filtered = filter 
    ? entries.filter(e => e._meta.name.toLowerCase().includes(filter.toLowerCase()))
    : entries.slice(0, 50);
  
  container.innerHTML = filtered.map(entry => {
    const meta = entry._meta;
    const apps = CATEGORIES
      .filter(cat => entry[cat]?.length > 0)
      .slice(0, 8)
      .map(cat => `<div class="person-app">
        <span class="person-app-category">${cat}:</span>
        <span class="person-app-value">${entry[cat].join(', ')}</span>
      </div>`);
    
    return `
      <div class="person-card">
        <div class="person-name">
          <a href="${meta.url}" target="_blank" rel="noopener">${meta.name}</a>
        </div>
        <div class="person-date">${meta.date ? meta.date.split(' ')[0] : 'Unknown date'}</div>
        <div class="person-apps">${apps.join('')}</div>
      </div>
    `;
  }).join('');
  
  if (!filter && entries.length > 50) {
    container.innerHTML += `<p style="color: #6b7280; text-align: center;">Showing 50 of ${entries.length}. Use search to find more.</p>`;
  }
}

function renderSearch(query) {
  const container = document.getElementById('search-results');
  if (!query) {
    container.innerHTML = '<p style="color: #6b7280;">Enter an app name to see who uses it.</p>';
    return;
  }
  
  const results = [];
  const lowerQuery = query.toLowerCase();
  
  entries.forEach(entry => {
    const matches = [];
    CATEGORIES.forEach(cat => {
      const apps = entry[cat] || [];
      apps.forEach(app => {
        if (app.toLowerCase().includes(lowerQuery)) {
          matches.push({ category: cat, app });
        }
      });
    });
    if (matches.length > 0) {
      results.push({ entry, matches });
    }
  });
  
  if (results.length === 0) {
    container.innerHTML = `<p style="color: #6b7280;">No results found for "${query}".</p>`;
    return;
  }
  
  container.innerHTML = `
    <p style="margin-bottom: 1rem;"><strong>${results.length}</strong> people use apps matching "${query}"</p>
    ${results.slice(0, 100).map(({ entry, matches }) => `
      <div class="person-card">
        <div class="person-name">
          <a href="${entry._meta.url}" target="_blank" rel="noopener">${entry._meta.name}</a>
        </div>
        <div class="person-apps">
          ${matches.map(m => `
            <div class="person-app">
              <span class="person-app-category">${m.category}:</span>
              <span class="person-app-value">${m.app}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

// Start the app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
