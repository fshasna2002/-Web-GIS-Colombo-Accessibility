// ============================================
// GIS Application Configuration & State
// ============================================

const AppConfig = {
    center: [6.9271, 80.7780], // Colombo District Center
    initialZoom: 11,
    dataFolder: './data/',
    geojsonFiles: {
        accessibility: 'accessibility index.geojson',
        hospitals: 'hospitals.geojson',
        schools: 'schools.geojson',
        banks: 'banks.geojson',
        parks: 'parks.geojson',
        busStops: 'bus stops.geojson'
    }
};

const AppState = {
    map: null,
    layers: {
        basemap: null,
        accessibility: null,
        hotspots: null,
        hospitals: null,
        schools: null,
        banks: null,
        parks: null,
        busStops: null
    },
    geoJsonData: {
        accessibility: null,
        hospitals: null,
        schools: null,
        banks: null,
        parks: null,
        busStops: null
    },
    allFeatures: [],
    hotspotFeatures: []
};

// ============================================
// Color Ramp - Accessibility Index
// ============================================

const ColorRamp = {
    getColor: function(value) {
        if (value >= 0.8) return '#27ae60'; // Excellent
        if (value >= 0.6) return '#52c41a'; // Good
        if (value >= 0.4) return '#faad14'; // Moderate
        if (value >= 0.2) return '#ff7a45'; // Poor
        return '#ff4d4f'; // Very Poor
    },

    getCategory: function(value) {
        if (value >= 0.8) return 'Excellent';
        if (value >= 0.6) return 'Good';
        if (value >= 0.4) return 'Moderate';
        if (value >= 0.2) return 'Poor';
        return 'Very Poor';
    },

    categories: [
        { range: '0.8 - 1.0', category: 'Excellent', color: '#27ae60' },
        { range: '0.6 - 0.8', category: 'Good', color: '#52c41a' },
        { range: '0.4 - 0.6', category: 'Moderate', color: '#faad14' },
        { range: '0.2 - 0.4', category: 'Poor', color: '#ff7a45' },
        { range: '0.0 - 0.2', category: 'Very Poor', color: '#ff4d4f' }
    ]
};

// ============================================
// Marker Icons Configuration
// ============================================

const MarkerIcons = {
    hospital: L.divIcon({
        html: '<i class="fas fa-hospital" style="color: #FF4444; font-size: 20px;"></i>',
        iconSize: [30, 30],
        className: 'custom-icon'
    }),
    school: L.divIcon({
        html: '<i class="fas fa-school" style="color: #4444FF; font-size: 20px;"></i>',
        iconSize: [30, 30],
        className: 'custom-icon'
    }),
    bank: L.divIcon({
        html: '<i class="fas fa-bank" style="color: #44FF44; font-size: 20px;"></i>',
        iconSize: [30, 30],
        className: 'custom-icon'
    }),
    park: L.divIcon({
        html: '<i class="fas fa-tree" style="color: #22AA22; font-size: 20px;"></i>',
        iconSize: [30, 30],
        className: 'custom-icon'
    }),
    busStop: L.divIcon({
        html: '<i class="fas fa-bus" style="color: #FF8800; font-size: 20px;"></i>',
        iconSize: [30, 30],
        className: 'custom-icon'
    })
};

// ============================================
// Initialize Application
// ============================================

function initializeApp() {
    showLoadingIndicator(true);
    initializeMap();
    loadAllGeoJSONFiles();
    setupEventListeners();
}

function initializeMap() {
    AppState.map = L.map('map').setView(AppConfig.center, AppConfig.initialZoom);

    // Add OpenStreetMap Basemap
    AppState.layers.basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(AppState.map);

    // Add scale control
    L.control.scale().addTo(AppState.map);

    // Prevent default popup behavior
    AppState.map.on('popupopen', function(e) {
        e.popup._closeButton = false;
    });
}

// ============================================
// Load GeoJSON Files
// ============================================

async function loadAllGeoJSONFiles() {
    try {
        const promises = Object.entries(AppConfig.geojsonFiles).map(([key, filename]) =>
            fetch(`${AppConfig.dataFolder}${filename}`)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to load ${filename}`);
                    return response.json();
                })
                .then(data => {
                    AppState.geoJsonData[key] = data;
                    return data;
                })
                .catch(error => {
                    console.error(`Error loading ${filename}:`, error);
                    showNotification(`Error loading ${filename}`, 'error');
                    return null;
                })
        );

        await Promise.all(promises);

        // Create layers
        createAccessibilityLayer();
        createHotspotsLayer();
        createServiceLayers();
        buildLegend();
        calculateHotspotStats();
        setupSearch();

        showLoadingIndicator(false);
    } catch (error) {
        console.error('Error in loadAllGeoJSONFiles:', error);
        showLoadingIndicator(false);
    }
}

// ============================================
// Create Accessibility Choropleth Layer
// ============================================

function createAccessibilityLayer() {
    if (!AppState.geoJsonData.accessibility) return;

    const geojsonLayer = L.geoJSON(AppState.geoJsonData.accessibility, {
        style: function(feature) {
            const ai = feature.properties.AI || 0;
            return {
                fillColor: ColorRamp.getColor(ai),
                weight: 2,
                opacity: 1,
                color: '#fff',
                dashArray: '3',
                fillOpacity: 0.7
            };
        },
        onEachFeature: function(feature, layer) {
            // Store feature for search
            AppState.allFeatures.push({
                feature: feature,
                layer: layer,
                type: 'accessibility'
            });

            // Add hover effect
            layer.on('mouseover', function() {
                this.setStyle({
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 0.9,
                    dashArray: ''
                });
                this.bringToFront();
            });

            layer.on('mouseout', function() {
                geojsonLayer.resetStyle(this);
            });

            // Add click event for popup
            layer.on('click', function() {
                showFeatureInfo(feature);
            });
        }
    });

    AppState.layers.accessibility = geojsonLayer.addTo(AppState.map);
}

// ============================================
// Create Priority Hotspots Layer
// ============================================

function createHotspotsLayer() {
    if (!AppState.geoJsonData.accessibility) return;

    // Identify hotspots
    const hotspotGeoJSON = {
        type: 'FeatureCollection',
        features: AppState.geoJsonData.accessibility.features.filter(feature => {
            const ai = feature.properties.AI || 0;
            const population = feature.properties.Colombo_1 || 0;

            // Hotspots: Low AI (< 0.3) AND High Population (> median)
            return ai < 0.3;
        })
    };

    AppState.hotspotFeatures = hotspotGeoJSON.features;

    const hotspotsLayer = L.geoJSON(hotspotGeoJSON, {
        style: function(feature) {
            return {
                fillColor: '#eb2f96',
                weight: 2,
                opacity: 1,
                color: '#fff',
                fillOpacity: 0.6,
                dashArray: '5, 5'
            };
        },
        onEachFeature: function(feature, layer) {
            layer.on('mouseover', function() {
                this.setStyle({
                    weight: 3,
                    fillOpacity: 0.8
                });
                this.bringToFront();
            });

            layer.on('mouseout', function() {
                hotspotsLayer.resetStyle(this);
            });

            layer.on('click', function() {
                showFeatureInfo(feature);
            });
        }
    });

    AppState.layers.hotspots = hotspotsLayer.addTo(AppState.map);
}

// ============================================
// Create Service Layers
// ============================================

function createServiceLayers() {
    createServiceLayer('hospitals', 'hospital', MarkerIcons.hospital, '#FF4444');
    createServiceLayer('schools', 'school', MarkerIcons.school, '#4444FF');
    createServiceLayer('banks', 'bank', MarkerIcons.bank, '#44FF44');
    createServiceLayer('parks', 'park', MarkerIcons.park, '#22AA22');
    createServiceLayer('busStops', 'busStop', MarkerIcons.busStop, '#FF8800');
}

function createServiceLayer(key, layerKey, icon, color) {
    if (!AppState.geoJsonData[key]) return;

    const geojsonLayer = L.geoJSON(AppState.geoJsonData[key], {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, { icon: icon });
        },
        onEachFeature: function(feature, layer) {
            const serviceName = feature.properties.name || feature.properties.Name || key;
            layer.bindPopup(`<div class="popup-title">${serviceName}</div>`);

            layer.on('mouseover', function() {
                this.openPopup();
            });

            layer.on('mouseout', function() {
                this.closePopup();
            });
        }
    });

    AppState.layers[key] = geojsonLayer.addTo(AppState.map);
}

// ============================================
// Build Legend
// ============================================

function buildLegend() {
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = '';

    ColorRamp.categories.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${item.color};"></div>
            <span>${item.category}<br><small>${item.range}</small></span>
        `;
        legendContainer.appendChild(legendItem);
    });

    // Add hotspot indicator
    const hotspotItem = document.createElement('div');
    hotspotItem.className = 'legend-item';
    hotspotItem.innerHTML = `
        <div class="legend-color" style="background-color: #eb2f96; border: 2px dashed #fff;"></div>
        <span>Priority Hotspot</span>
    `;
    legendContainer.appendChild(hotspotItem);
}

// ============================================
// Show Feature Information
// ============================================

function showFeatureInfo(feature) {
    const properties = feature.properties;
    const panel = document.getElementById('featureInfoPanel');
    const nameElement = document.getElementById('featureName');
    const detailsElement = document.getElementById('featureDetails');

    const gnName = properties.ADM4_EN || 'Unknown';
    nameElement.textContent = gnName;

    const population = properties.Colombo_1 || 'N/A';
    const ai = properties.AI !== undefined ? properties.AI.toFixed(3) : 'N/A';
    const category = properties.AI !== undefined ? ColorRamp.getCategory(properties.AI) : 'N/A';

    const detailsHTML = `
        <div class="detail-item">
            <div class="detail-label">GN Division Name</div>
            <div class="detail-value">${gnName}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Population</div>
            <div class="detail-value">${population.toLocaleString()}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Accessibility Index</div>
            <div class="detail-value">${ai}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">Accessibility Category</div>
            <div class="detail-value">
                <span class="badge ${getAccessibilityClass(category)}">${category}</span>
            </div>
        </div>
    `;

    detailsElement.innerHTML = detailsHTML;
    panel.classList.add('active');

    // Highlight the feature
    if (AppState.highlightedLayer) {
        AppState.layers.accessibility.resetStyle(AppState.highlightedLayer);
    }
    AppState.highlightedLayer = feature;
}

function getAccessibilityClass(category) {
    const classMap = {
        'Excellent': 'excellent',
        'Good': 'good',
        'Moderate': 'moderate',
        'Poor': 'poor',
        'Very Poor': 'very-poor'
    };
    return classMap[category] || 'poor';
}

// ============================================
// Calculate Hotspot Statistics
// ============================================

function calculateHotspotStats() {
    const hotspotCount = AppState.hotspotFeatures.length;
    let totalPopulation = 0;
    let avgAI = 0;

    AppState.hotspotFeatures.forEach(feature => {
        totalPopulation += feature.properties.Colombo_1 || 0;
        avgAI += feature.properties.AI || 0;
    });

    avgAI = hotspotCount > 0 ? (avgAI / hotspotCount).toFixed(3) : 0;
    totalPopulation = totalPopulation || 0;

    const statsHTML = `
        <p><strong>Hotspot Count:</strong> ${hotspotCount}</p>
        <p><strong>Avg. AI in Hotspots:</strong> ${avgAI}</p>
        <p><strong>Total Population:</strong> ${totalPopulation.toLocaleString()}</p>
        <p style="margin-top: 8px; font-size: 11px; color: #999;">These areas require urgent urban service development.</p>
    `;

    document.getElementById('hotspotStats').innerHTML = statsHTML;
}

// ============================================
// Setup Search Functionality
// ============================================

function setupSearch() {
    const searchBox = document.getElementById('searchBox');
    const searchResults = document.getElementById('searchResults');

    searchBox.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        searchResults.innerHTML = '';

        if (query.length < 2) return;

        const matches = AppState.allFeatures.filter(item =>
            item.feature.properties.ADM4_EN.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            searchResults.innerHTML = '<div style="padding: 8px; color: #999;">No matches found</div>';
            return;
        }

        matches.slice(0, 5).forEach(match => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.textContent = match.feature.properties.ADM4_EN;
            resultItem.addEventListener('click', function() {
                AppState.map.fitBounds(match.layer.getBounds());
                showFeatureInfo(match.feature);
                searchBox.value = '';
                searchResults.innerHTML = '';
            });
            resultItem.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    this.click();
                }
            });
            searchResults.appendChild(resultItem);
        });
    });
}

// ============================================
// Layer Toggle Controls
// ============================================

function setupEventListeners() {
    // Accessibility layer toggle
    document.getElementById('toggleAccessibility').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.accessibility);
        } else {
            AppState.map.removeLayer(AppState.layers.accessibility);
        }
    });

    // Hotspots layer toggle
    document.getElementById('toggleHotspots').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.hotspots);
        } else {
            AppState.map.removeLayer(AppState.layers.hotspots);
        }
    });

    // Service layers toggle
    document.getElementById('toggleHospitals').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.hospitals);
        } else {
            AppState.map.removeLayer(AppState.layers.hospitals);
        }
    });

    document.getElementById('toggleSchools').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.schools);
        } else {
            AppState.map.removeLayer(AppState.layers.schools);
        }
    });

    document.getElementById('toggleBanks').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.banks);
        } else {
            AppState.map.removeLayer(AppState.layers.banks);
        }
    });

    document.getElementById('toggleParks').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.parks);
        } else {
            AppState.map.removeLayer(AppState.layers.parks);
        }
    });

    document.getElementById('toggleBusStops').addEventListener('change', function() {
        if (this.checked) {
            AppState.map.addLayer(AppState.layers.busStops);
        } else {
            AppState.map.removeLayer(AppState.layers.busStops);
        }
    });

    // Close feature info panel
    document.getElementById('closeFeaturePanel').addEventListener('click', function() {
        document.getElementById('featureInfoPanel').classList.remove('active');
    });

    // Close feature info panel on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('featureInfoPanel').classList.remove('active');
        }
    });
}

// ============================================
// Utility Functions
// ============================================

function showLoadingIndicator(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (show) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// ============================================
// Initialize on Page Load
// ============================================

window.addEventListener('DOMContentLoaded', initializeApp);

// Handle window resize for responsive behavior
window.addEventListener('resize', function() {
    if (AppState.map) {
        AppState.map.invalidateSize();
    }
});
