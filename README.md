# Spatial Inequality of Urban Services in Colombo District - Web GIS Application

A professional Web GIS application built with Leaflet.js to analyze accessibility to urban services and identify spatial inequality patterns in Colombo District.

## 📋 Project Overview

**Objective:** Analyze accessibility to urban services and identify spatial inequality using an Accessibility Index (AI) across GN Divisions in Colombo District.

**Key Features:**
- Interactive choropleth map showing accessibility classifications
- Priority hotspots identification (low accessibility + high population)
- Multiple urban service layers (Hospitals, Schools, Banks, Parks, Bus Stops)
- Search functionality for GN Divisions
- Responsive design for desktop and mobile devices
- Professional academic dashboard styling

## 🚀 Quick Start Guide

### Step 1: Prepare Your Data Files

Create a `data` folder in your project root directory with the following GeoJSON files:

```
project-root/
├── data/
│   ├── accessibility index.geojson
│   ├── hospitals.geojson
│   ├── schools.geojson
│   ├── banks.geojson
│   ├── parks.geojson
│   └── bus stops.geojson
├── index.html
├── style.css
├── script.js
└── README.md
```

### Step 2: Verify Your GeoJSON Files

Each GeoJSON file should have the correct structure:

**For Accessibility Index (`accessibility index.geojson`):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "ADM4_EN": "GN Division Name",
        "Colombo_1": 10000,
        "AI": 0.65
      },
      "geometry": { ... }
    }
  ]
}
```

**For Service Layers (hospitals.geojson, schools.geojson, etc.):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Service Name"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      }
    }
  ]
}
```

### Step 3: Deploy the Application

#### Option A: Using Python (Recommended for Testing)

```bash
cd project-root
python -m http.server 8000
```

Then open your browser: `http://localhost:8000`

#### Option B: Using Node.js (http-server)

```bash
npm install -g http-server
cd project-root
http-server
```

#### Option C: Using Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html` → "Open with Live Server"

#### Option D: GitHub Pages

1. Push your repository to GitHub
2. Go to Repository Settings → Pages
3. Select the branch to deploy (usually `main`)
4. Access your application at: `https://yourusername.github.io/repo-name`

### Step 4: Verify the Application

Once deployed, check that:

✅ The map loads centered on Colombo District
✅ The accessibility index choropleth layer displays with color classifications
✅ The legend appears in the bottom-right corner
✅ The sidebar panels load correctly
✅ Service layers can be toggled via layer control
✅ Search functionality works
✅ Click on polygons to view GN Division details
✅ Priority hotspots are identified and displayed

## 📊 Accessibility Index Classifications

| Category | Range | Color |
|----------|-------|-------|
| Very Poor | 0.0 - 0.2 | 🔴 Red (#d73027) |
| Poor | 0.2 - 0.4 | 🟠 Orange (#fc8d59) |
| Moderate | 0.4 - 0.6 | 🟡 Yellow (#fee090) |
| Good | 0.6 - 0.8 | 🔵 Light Blue (#e0f3f8) |
| Excellent | 0.8 - 1.0 | 🟢 Green (#1a9850) |

## 🔴 Priority Hotspots

Hotspots are automatically identified based on:
- **Low Accessibility Index:** Bottom 25% (Q1)
- **High Population:** Top 25% (Q3)

These GN Divisions are displayed with red hash-patterned polygons and highlighted in the information panel.

## 🗺️ Map Features

### Base Map
- OpenStreetMap tiles (freely available, no API key required)
- Zoom levels: 9-19

### Overlay Layers
1. **Accessibility Index** (Default: ON)
   - Choropleth visualization by AI values
   - Hover effects show GN Division boundaries
   - Click to view detailed statistics

2. **Priority Hotspots** (Toggleable)
   - Red polygons with dashed borders
   - Identifies critical service gaps

3. **Urban Services** (Toggleable)
   - 🏥 Hospitals (Red icons)
   - 🎓 Schools (Blue icons)
   - 🏦 Banks (Orange icons)
   - 🌳 Parks (Green icons)
   - 🚌 Bus Stops (Purple icons)

### Controls
- **Layer Control** (Top-left): Toggle layers on/off
- **Zoom Control** (Top-right): Zoom in/out
- **Scale Bar** (Bottom-left): Shows distance scale
- **Legend** (Bottom-right): Shows all color classifications

## 🔍 Search Functionality

Press **Ctrl+F** (or **Cmd+F** on Mac) to focus the search box, then:

1. Type a GN Division name (e.g., "Colombo")
2. Results appear in a dropdown list
3. Click a result to:
   - Zoom to that GN Division
   - Show its statistics in the sidebar
   - Display a popup with details

## 📱 Responsive Behavior

### Desktop (> 1024px)
- Sidebar: Left panel (320px wide)
- Map: Right side (remaining width)
- Full feature visibility

### Tablet (768px - 1024px)
- Sidebar: Narrows to 280px
- Responsive layouts
- All features accessible

### Mobile (< 768px)
- Sidebar: Full width, scrollable (50% height)
- Map: Full width (50% height)
- Optimized touch controls
- Collapsible panels

## 🎨 Customization Guide

### Change Color Scheme

Edit `style.css` CSS variables:

```css
:root {
    --primary-color: #2c3e50;      /* Header background */
    --secondary-color: #3498db;    /* Accents */
    --accent-color: #e74c3c;       /* Highlights */
    
    /* Accessibility Index Colors */
    --very-poor: #d73027;
    --poor: #fc8d59;
    --moderate: #fee090;
    --good: #e0f3f8;
    --excellent: #1a9850;
}
```

### Modify Map Center/Zoom

Edit `script.js` in `initializeMap()` function:

```javascript
map = L.map('map').setView([6.9271, 80.7789], 11);
// Change [latitude, longitude] and zoom level (11)
```

### Customize Service Icons

Edit `script.js` in `serviceConfigs` object:

```javascript
hospitals: {
    name: 'Hospitals',
    file: 'data/hospitals.geojson',
    icon: '🏥',           // Change emoji or HTML
    color: '#e74c3c',     // Change color
    marker: 'hospital'    // Change marker type
}
```

### Adjust Hotspot Thresholds

Edit `script.js` in `identifyHotspots()` function:

```javascript
// Current: Q1 for AI and Q3 for Population
const aiQ1 = accessibilityValues[Math.floor(accessibilityValues.length * 0.25)];
const popQ3 = populationValues[Math.floor(populationValues.length * 0.75)];

// Modify percentages as needed (0.0 - 1.0)
```

## 🛠️ Troubleshooting

### Issue: Map is blank or not loading

**Solution:**
1. Check browser console (F12 → Console) for errors
2. Verify `data/` folder exists with all GeoJSON files
3. Check file names match exactly (case-sensitive)
4. Validate GeoJSON files are valid JSON (use jsonlint.com)

### Issue: Service layers not showing

**Solution:**
1. Verify GeoJSON files exist in `data/` folder
2. Check GeoJSON is properly formatted (Point geometry for services)
3. Open browser console to see error messages
4. Ensure latitude/longitude are in correct order

### Issue: Search not finding divisions

**Solution:**
1. Verify `ADM4_EN` field exists in accessibility index GeoJSON
2. Check that field values match what you're searching for
3. Clear search box and try partial name

### Issue: Hotspots not showing

**Solution:**
1. Click "Priority Hotspots" in layer control to enable
2. Check that both AI and Colombo_1 (population) fields exist
3. Verify data has variation (not all same values)

### Issue: Responsive design not working

**Solution:**
1. Add viewport meta tag (already in index.html)
2. Test on different screen sizes using browser DevTools
3. Clear browser cache (Ctrl+Shift+Delete)

## 📚 File Structure & Descriptions

### index.html
- HTML structure
- Leaflet and Font Awesome CDN links
- Header, sidebar, and map container
- Legend element

### style.css
- Global styles and CSS variables
- Layout (flexbox grid)
- Sidebar styling
- Map and legend styling
- Responsive media queries
- Animations and transitions

### script.js
- Map initialization
- Data loading (GeoJSON)
- Choropleth styling logic
- Hotspot identification
- Service layer rendering
- Search functionality
- Event handlers

## 🔗 External Resources

- **Leaflet Documentation:** https://leafletjs.com
- **OpenStreetMap:** https://openstreetmap.org
- **GeoJSON Specification:** https://geojson.org
- **Font Awesome Icons:** https://fontawesome.com

## 📖 User Guide

### For End Users

1. **Viewing Data:**
   - Use layer control to toggle layers on/off
   - Hover over GN Divisions to see boundaries
   - Zoom in/out using controls or scroll wheel

2. **Searching:**
   - Type GN Division name in search box
   - Click result to zoom and view details
   - Use Ctrl+F to quickly focus search

3. **Viewing Details:**
   - Click on any GN Division polygon
   - Statistics appear in right sidebar
   - Popup shows name, population, and index

4. **Analyzing Hotspots:**
   - Enable "Priority Hotspots" layer
   - Red areas indicate critical service gaps
   - Check statistics panel for hotspot summary

## 🎓 Academic Use

This application is designed for:
- Urban planning studies
- Accessibility analysis research
- Spatial inequality investigations
- Service distribution assessment
- Spatial data visualization courses

## 📝 Citation

If you use this application in academic work, please cite:

"Spatial Inequality of Urban Services in Colombo District Study - Web GIS Application" (2026)

## 📧 Support & Contributions

For issues, improvements, or questions:
- Check the troubleshooting section
- Review the browser console for error messages
- Validate your GeoJSON files

## 📄 License

This project is open source and available for educational and research purposes.

---

**Last Updated:** June 2026
**Version:** 1.0.0
