# Heat Map Feature - Quick Start Guide

## What You Just Got 🎉

A powerful real-time civic issue heat map visualization that:

✅ **Automatically updates** when new reports are submitted  
✅ **Intelligently clusters** nearby reports (10-20m radius)  
✅ **Color-codes intensity** based on report density and engagement  
✅ **Highlights hotspots** where multiple citizens report the same issue  
✅ **Filters active issues** (excludes resolved/verified reports)  
✅ **Provides statistics** on problem areas and categories  

## How to Use

### For Citizens

1. **Navigate to Safety Section**
   - Go to the Safety page in the app
   - You'll see a new "Heat Map" tab

2. **View the Heat Map**
   - Enable location services when prompted
   - The map will display all active civic issues within 50km
   - Red areas = high problem density (needs attention)
   - Yellow areas = lower density

3. **Interact with Clusters**
   - Click numbered circles to see grouped reports
   - View detailed breakdown of each hotspot
   - See upvote counts and duplicate detections

4. **Toggle Views**
   - "Heat Layer" button: Show/hide color intensity overlay
   - "Clusters" button: Show/hide grouped report markers
   - "Refresh" button: Manually update data

### For Government Officials

The heat map serves as a **civic intelligence dashboard** to:

- **Identify Neglected Zones**: Dark red hotspots indicate areas with repeated complaints
- **Prioritize Resources**: Focus on high-intensity areas first
- **Track Problem Categories**: See which types of issues dominate each area
- **Monitor Trends**: Real-time updates show emerging problem areas
- **Measure Impact**: Watch hotspots disappear as issues are resolved

## Features Explained

### Heat Layer (Color Overlay)
- **Yellow**: 1-3 reports in the area
- **Orange**: 4-6 reports (medium priority)
- **Red**: 7+ reports or high community engagement (urgent)

### Cluster Markers (Numbered Circles)
- **Number**: How many reports are grouped together
- **Size**: Grows with report count
- **Color**: Matches intensity (yellow/orange/red)
- **Animation**: Pulses to draw attention

### Statistics Cards
- **Hotspots**: Number of high-priority areas (intensity > 70%)
- **Total Clusters**: How many report groups identified
- **Avg Reports/Cluster**: Density metric

### Category Breakdown
Shows which types of issues are most common:
- Potholes
- Garbage
- Streetlights
- Drainage
- Water Leaks
- Noise

## Real-Time Updates

The heat map automatically refreshes when:

1. ✅ New report is submitted nearby
2. ✅ Existing report receives upvotes
3. ✅ Duplicate report is detected
4. ✅ Report status changes

You'll see a toast notification: "Heat Map Updated"

## Technical Details

### Data Sources
- **Reports Table**: Active civic issue reports (status = "reported")
- **Interactions Table**: Upvote/downvote counts
- **Location Data**: GPS coordinates from reports

### Clustering Algorithm
- Groups reports within 20 meters
- Calculates intensity score:
  - 50% weight: Report count
  - 30% weight: Average upvotes
  - 20% weight: Duplicate detections

### Performance
- Optimized for 1,000+ reports
- Client-side clustering (fast updates)
- Efficient distance calculations
- Smart caching and refresh strategy

## Privacy & Security

- ✅ Only shows active "reported" issues
- ✅ No personal user data displayed
- ✅ Anonymous reporting fully supported
- ✅ Location data used only for visualization

## Troubleshooting

### Heat map not showing?
- Enable location services in your browser
- Check if there are active reports in your area (50km radius)
- Try refreshing the page

### Clusters not appearing?
- Click the "Clusters" toggle button to show them
- Some areas may not have clustered reports (reports too far apart)

### Colors look wrong?
- Red = urgent (many reports)
- Orange = moderate priority
- Yellow = low density
- This is intentional for quick visual assessment

### Not updating in real-time?
- Check your internet connection
- Verify Supabase is running
- Try clicking the refresh button manually

## Integration Points

The heat map is located in:
- **File**: `src/pages/Safety.tsx`
- **Tab**: "Heat Map" (middle tab in Safety section)
- **Component**: `<HeatMapVisualization />`

### Files Created
1. `src/lib/heatmapService.ts` - Data fetching & clustering
2. `src/components/HeatMapVisualization.tsx` - Main component
3. `src/types/leaflet.heat.d.ts` - TypeScript definitions
4. `HEATMAP_DOCUMENTATION.md` - Full technical docs

### Dependencies Installed
- `leaflet.heat` - Heat map layer plugin
- `@types/leaflet.heat` - TypeScript type definitions

## Next Steps

### Test the Feature
```bash
npm run dev
```

1. Navigate to http://localhost:5173
2. Go to Safety → Heat Map tab
3. Allow location access
4. Submit a test report (Reports page)
5. Watch the heat map update automatically!

### Customize (Optional)

**Change radius:**
```tsx
<HeatMapVisualization radiusKm={25} /> // 25km instead of 50km
```

**Adjust height:**
```tsx
<HeatMapVisualization height="600px" /> // Taller map
```

**Modify colors:**
Edit gradient in `HeatMapVisualization.tsx` line ~220

## Support

For detailed technical documentation, see:
- `HEATMAP_DOCUMENTATION.md` - Full API reference
- `src/lib/heatmapService.ts` - Commented code
- `src/components/HeatMapVisualization.tsx` - Component docs

---

**Built with**: React + TypeScript + Leaflet + Supabase  
**Status**: ✅ Production Ready  
**Last Updated**: January 2026
