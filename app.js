
async function loadData() {
  try {
    console.log('Fetching data from:', 'data/data.json');
    const res = await fetch('data/data.json');
    if (!res.ok) {
      console.error('HTTP Error:', res.status, res.statusText);
      throw new Error(`Failed to load data.json: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Data loaded successfully:', data);
    
    // Add error checking for data structure
    if (!data.meters || !Array.isArray(data.meters)) {
      console.error('Invalid data structure - meters array is missing:', data);
      throw new Error('Invalid data structure: meters array is missing');
    }
    
    return data;
  } catch (err) {
    console.error('Error loading data:', err);
    throw err;
  }
}

function numberWithCommas(x) {
  if (x === null || x === undefined) return '—';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function toCSV(rows, headers) {
  const escape = v => '"' + (v === null || v === undefined ? '' : String(v).replace(/"/g, '""')) + '"';
  const head = headers.map(h => escape(h.label)).join(',');
  const body = rows.map(r => headers.map(h => escape(r[h.key])).join(',')).join('\n');
  return head + '\n' + body;
}

function chartDoughnut(ctx, labels, values) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      cutout: '60%'
    }
  });
}

function chartBar(ctx, labels, values, horizontal=false) {
  return new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ data: values }] },
    options: {
      indexAxis: horizontal ? 'y' : 'x',
      scales: { 
        x: { ticks: { autoSkip: true, maxRotation: 0 } }, 
        y: { beginAtZero: true }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function renderKPIs(summary) {
  if (!summary) return;
  document.getElementById('kpi-total').textContent = numberWithCommas(summary.total_meters || 0);
  document.getElementById('kpi-new').textContent = numberWithCommas(summary.new_meters_required || 0);
  const yes = (summary.comm_ports && summary.comm_ports.YES) || 0;
  const no = (summary.comm_ports && summary.comm_ports.NO) || 0;
  document.getElementById('kpi-comm-yes').textContent = numberWithCommas(yes);
  document.getElementById('kpi-comm-no').textContent = numberWithCommas(no);
}

function renderCharts(data) {
  if (!data || !data.summary) return;

  // Models breakdown
  const modelLabels = Object.keys(data.summary.models || {});
  const modelValues = Object.values(data.summary.models || {});
  chartDoughnut(document.getElementById('chartModels'), modelLabels, modelValues);

  // Communication ports
  const commLabels = Object.keys(data.summary.comm_ports || {});
  const commValues = Object.values(data.summary.comm_ports || {});
  chartDoughnut(document.getElementById('chartComm'), commLabels, commValues);

  // Location breakdown
  const locationCounts = {};
  data.meters.forEach(meter => {
    if (meter.location) {
      locationCounts[meter.location] = (locationCounts[meter.location] || 0) + 1;
    }
  });
  const locEntries = Object.entries(locationCounts);
  locEntries.sort((a, b) => b[1] - a[1]);
  const locLabels = locEntries.slice(0, 15).map(([loc]) => loc);
  const locValues = locEntries.slice(0, 15).map(([, count]) => count);
  chartBar(document.getElementById('chartLocations'), locLabels, locValues, true);

  // Panel breakdown
  const panelCounts = {};
  data.meters.forEach(meter => {
    if (meter.panel_name) {
      panelCounts[meter.panel_name] = (panelCounts[meter.panel_name] || 0) + 1;
    }
  });
  const panEntries = Object.entries(panelCounts);
  panEntries.sort((a, b) => b[1] - a[1]);
  const panLabels = panEntries.slice(0, 15).map(([pan]) => pan);
  const panValues = panEntries.slice(0, 15).map(([, count]) => count);
  chartBar(document.getElementById('chartPanels'), panLabels, panValues, true);
}

function renderMetersTable(meters) {
  console.log('Rendering meters table:', meters);
  const tbody = document.querySelector('#metersTable tbody');
  tbody.innerHTML = '';
  
  if (!Array.isArray(meters)) {
    console.error('Invalid meters data:', meters);
    return;
  }
  
  meters.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.sl_no ?? ''}</td>
      <td>${m.location ?? ''}</td>
      <td>${m.panel_name ?? ''}</td>
      <td>${m.meter_name ?? ''}</td>
      <td>${m.model ?? ''}</td>
      <td>${m.meter_serial ?? ''}</td>
      <td>${m.comm_port ?? ''}</td>
      <td>${m.new_meter_required ? 'YES' : 'NO'}</td>
      <td>${m.equipment_connected ?? ''}</td>
      <td>${m.remarks ?? ''}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('rowCount').textContent = meters.length + ' rows';
}

function renderPanelsTable(panels) {
  console.log('Rendering panels table:', panels);
  const tbody = document.querySelector('#panelsTable tbody');
  tbody.innerHTML = '';
  
  if (!Array.isArray(panels)) {
    console.error('Invalid panels data:', panels);
    return;
  }
  
  panels.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.panel ?? ''}</td>
      <td>${p.sl_no ?? ''}</td>
      <td>${p.equipment ?? ''}</td>
      <td>${p.capacity ?? ''}</td>
      <td>${p.power ?? ''}</td>
      <td>${p.quantity ?? ''}</td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('rowCount').textContent = panels.length + ' rows';
}

function setupSearch(data) {
  const input = document.getElementById('searchInput');
  let currentTable = 'meters';
  
  // Set up tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTable = btn.dataset.table;
      
      // Toggle table visibility
      document.getElementById('metersTable').style.display = currentTable === 'meters' ? 'block' : 'none';
      document.getElementById('panelsTable').style.display = currentTable === 'panels' ? 'block' : 'none';
      
      // Update search placeholder
      input.placeholder = currentTable === 'meters' ? 
        'Search by location, panel, model, serial...' : 
        'Search by panel, equipment...';
      
      const filtered = filterData(data[currentTable], input.value.trim().toLowerCase());
      if (currentTable === 'meters') {
        renderMetersTable(filtered);
      } else {
        renderPanelsTable(filtered);
      }
    });
  });

  // Set up search
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    const filtered = filterData(data[currentTable], q);
    if (currentTable === 'meters') {
      renderMetersTable(filtered);
    } else {
      renderPanelsTable(filtered);
    }
  });
}

function filterData(items, query) {
  if (!query) return items;
  return items.filter(item => {
    return Object.values(item).some(val => 
      val && val.toString().toLowerCase().includes(query)
    );
  });
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar nav a');
  const sections = document.querySelectorAll('section[id]');
  
  // Remove all active classes first
  navLinks.forEach(link => {
    link.classList.remove('active');
  });
  
  // Set the first link (Overview) as active by default
  navLinks[0].classList.add('active');
  
  // Add click handlers
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the target section id from the href
      const targetId = link.getAttribute('href').slice(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Smooth scroll to the section
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      // Add active class only to clicked link
      link.classList.add('active');
    });
  });

  // Add scroll handler to update active link
  function setActiveLink() {
    let currentSection = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const scrollPosition = window.scrollY + 100; // Add offset for better UX
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  // Listen for scroll events
  window.addEventListener('scroll', setActiveLink);
  // Also check on page load
  setActiveLink();
}

async function main() {
  try {
    console.log('Fetching data from:', 'data/data.json');
    const data = await loadData();
    
    console.log('Rendering initial data:', data);
    // Initialize with meters data
    if (data.meters && Array.isArray(data.meters)) {
      renderMetersTable(data.meters);
      setupSearch(data);
      setupNavigation(); // Initialize navigation
      
      // Update KPIs and charts if available
      if (data.summary) {
        renderKPIs(data.summary);
        renderCharts(data);
      }
    } else {
      console.error('Invalid data structure:', data);
      throw new Error('Data is not in the expected format');
    }

    // CSV download
    document.getElementById('downloadCsv').addEventListener('click', () => {
      const headers = [
        {key: 'sl_no', label: 'SL'},
        {key: 'location', label: 'Location'},
        {key: 'panel_name', label: 'Panel'},
        {key: 'meter_name', label: 'Meter Name'},
        {key: 'model', label: 'Model'},
        {key: 'meter_serial', label: 'Serial'},
        {key: 'comm_port', label: 'Comm Port'},
        {key: 'new_meter_required', label: 'New Meter?'},
        {key: 'equipment_connected', label: 'Equipment'},
        {key: 'remarks', label: 'Remarks'}
      ];
      const csv = toCSV(data.meters, headers);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'falta_meters.csv';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Theme toggle
    document.getElementById('toggleTheme').addEventListener('click', () => {
      document.body.classList.toggle('light');
    });
  } catch (err) {
    console.error(err);
    alert('Failed to initialize dashboard: ' + err.message);
  }
}
main();
