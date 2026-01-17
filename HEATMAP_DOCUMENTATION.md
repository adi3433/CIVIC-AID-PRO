# Real-Time Civic Issue Heat Map - Technical Documentation

## Overview

The Real-Time Heat Map Visualization is a dynamic, data-driven civic intelligence tool integrated into the CivicAid Safety Section. It provides a comprehensive visual representation of reported civic issues, enabling both citizens and authorities to identify problem hotspots, track issue density, and prioritize responses effectively.

## Features

### Core Capabilities

1. **Real-Time Data Synchronization**
   - Automatic updates when new reports are submitted
   - Live tracking of upvotes and downvotes
   - Instant refresh when duplicate reports are detected
   - WebSocket-based subscription to database changes

2. **Smart Clustering Algorithm**
   - Groups reports within 10-20 meter radius
   - Identifies duplicate issues at same location
   - Calculates cluster intensity based on:
     - Report count (50% weight)
     - Average upvotes (30% weight)
     - Duplicate detection (20% weight)

3. **Dynamic Heat Layer**
   - Color gradient: Yellow → Orange → Red
   - Intensity scales with problem severity
   - Customizable radius and blur effects
   - Only displays active "reported" status issues

4. **Interactive Cluster Markers**
   - Animated pulse effect for visibility
   - Size grows with report count
   - Color-coded by intensity (Yellow < Orange < Red)
   - Click to view detailed breakdown

5. **Performance Optimization**
   - Efficient Haversine distance calculations
   - Client-side clustering reduces server load
   - Cached data with smart refresh strategy
   - Optimized for large datasets (1000+ reports)

## Architecture

### File Structure

```
src/
├── lib/
│   └── heatmapService.ts          # Data fetching & clustering logic
├── components/
│   └── HeatMapVisualization.tsx   # Main heat map component
├── pages/
│   └── Safety.tsx                 # Integration point
└── types/
    └── leaflet.heat.d.ts          # TypeScript definitions
```

### Technology Stack

- **Mapping**: Leaflet.js with leaflet.heat plugin
- **Real-Time**: Supabase Realtime subscriptions
- **Clustering**: Custom algorithm with Haversine formula
- **State Management**: React hooks (useState, useEffect, useRef)
- **UI Components**: shadcn/ui library

## Data Flow

### 1. Data Fetching

```typescript
fetchHeatmapReports(radiusKm, userLat, userLng)
  ↓
Query reports table (status = "reported")
  ↓
Join with report_interactions for vote counts
  ↓
Calculate duplicate counts (within 10m)
  ↓
Filter by user location radius
  ↓
Return HeatmapReportData[]
```

### 2. Clustering Process

```typescript
clusterReports(reports, clusterRadiusMeters = 20)
  ↓
For each unprocessed report:
  - Find nearby reports (same category, within radius)
  - Calculate cluster center (average lat/lng)
  - Compute intensity score
  ↓
Return ClusteredReport[]
```

### 3. Visualization Pipeline

```typescript
Reports → Heat Layer (leaflet.heat)
        ↓
Reports → Clustering → Markers (L.marker)
        ↓
Real-time subscription → Auto refresh
```

## API Reference

### heatmapService.ts

#### `fetchHeatmapReports(radiusKm, userLat?, userLng?)`

Fetches active reports with interaction counts.

**Parameters:**
- `radiusKm` (number): Search radius in kilometers (default: 50)
- `userLat` (number, optional): User latitude for filtering
- `userLng` (number, optional): User longitude for filtering

**Returns:**
```typescript
{
  success: boolean;
  reports?: ReportHeatmapData[];
  error?: string;
}
```

#### `clusterReports(reports, clusterRadiusMeters)`

Groups nearby reports into clusters.

**Parameters:**
- `reports` (ReportHeatmapData[]): Array of reports to cluster
- `clusterRadiusMeters` (number): Clustering radius (default: 20)

**Returns:**
```typescript
ClusteredReport[] // Array of report clusters
```

#### `subscribeToReportChanges(callback)`

Subscribes to real-time database changes.

**Parameters:**
- `callback` (function): Called when changes detected

**Returns:**
```typescript
() => void // Unsubscribe function
```

#### `calculateHeatmapStats(reports)`

Calculates statistics for display.

**Returns:**
```typescript
{
  totalReports: number;
  categoryBreakdown: Record<string, number>;
  highPriorityAreas: ClusteredReport[];
  totalClusters: number;
  avgReportsPerCluster: string;
}
```

### HeatMapVisualization Component

#### Props

```typescript
interface HeatMapVisualizationProps {
  userLat: number;       // User latitude
  userLng: number;       // User longitude
  radiusKm?: number;     // Search radius (default: 50)
  height?: string;       // Map height (default: "450px")
}
```

#### State Management

```typescript
- reports: ReportHeatmapData[]        // All fetched reports
- loading: boolean                     // Initial load state
- refreshing: boolean                  // Manual refresh state
- lastUpdate: Date                     // Last refresh timestamp
- showHeatmap: boolean                 // Heat layer visibility
- showClusters: boolean                // Cluster markers visibility
- selectedCluster: ClusteredReport     // Selected cluster details
- stats: object                        // Calculated statistics
```

## Configuration

### Heat Map Gradient

```typescript
gradient: {
  0.0: "#FFFF00",  // Yellow (low intensity)
  0.3: "#FFD700",  // Gold
  0.5: "#FFA500",  // Orange (medium)
  0.7: "#FF4500",  // Orange-red
  1.0: "#DC2626",  // Red (high intensity)
}
```

### Intensity Calculation Weights

```typescript
const countWeight = 0.5;        // 50% - Number of reports
const upvoteWeight = 0.3;       // 30% - Community engagement
const duplicateWeight = 0.2;    // 20% - Duplicate detection
```

### Clustering Parameters

```typescript
const clusterRadius = 20;       // 20 meters
const duplicateRadius = 10;     // 10 meters
```

## Database Schema

### Required Tables

#### reports
```sql
- id: uuid (primary key)
- latitude: float8 (NOT NULL)
- longitude: float8 (NOT NULL)
- category: text
- status: text (CHECK: 'reported', 'in_progress', 'resolved', 'verified')
- created_at: timestamp
- user_id: uuid (foreign key)
```

#### report_interactions
```sql
- id: uuid (primary key)
- report_id: uuid (foreign key)
- user_id: uuid (foreign key)
- interaction_type: text ('upvote' | 'downvote')
- created_at: timestamp
- UNIQUE(report_id, user_id, interaction_type)
```

## Usage Examples

### Basic Integration

```tsx
import { HeatMapVisualization } from "@/components/HeatMapVisualization";

function SafetyPage() {
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  
  return (
    <HeatMapVisualization
      userLat={userLocation.lat}
      userLng={userLocation.lng}
      radiusKm={50}
      height="500px"
    />
  );
}
```

### Custom Radius

```tsx
<HeatMapVisualization
  userLat={lat}
  userLng={lng}
  radiusKm={25}  // 25km radius
  height="600px"
/>
```

### Programmatic Data Fetch

```typescript
import { fetchHeatmapReports, clusterReports } from "@/lib/heatmapService";

async function analyzeArea(lat: number, lng: number) {
  const result = await fetchHeatmapReports(50, lat, lng);
  
  if (result.success && result.reports) {
    const clusters = clusterReports(result.reports, 20);
    const hotspots = clusters.filter(c => c.intensity > 0.7);
    
    console.log(`Found ${hotspots.length} high-priority hotspots`);
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Client-Side Clustering**
   - Reduces server processing load
   - Faster updates for real-time changes
   - Efficient for datasets up to 10,000 reports

2. **Lazy Loading**
   - Map initialized only when visible
   - Heat layer created on-demand
   - Markers added incrementally

3. **Caching**
   - Last fetch timestamp stored
   - Prevents redundant API calls
   - Smart refresh on real-time events

4. **Distance Calculations**
   - Haversine formula (optimized)
   - Early exit conditions
   - Spatial indexing preparation

### Scalability

- **Current Capacity**: 1,000+ reports per area
- **Recommended Max**: 5,000 reports (then implement server-side clustering)
- **Real-Time Updates**: Supports 10+ concurrent users

## Security & Privacy

### Data Access

- Only fetches "reported" status issues
- Filters by user location (optional)
- No sensitive user data exposed
- Anonymous reporting supported

### RLS Policies

```sql
-- Read access for authenticated and anonymous users
CREATE POLICY "Public reports read access"
ON reports FOR SELECT
USING (status = 'reported');

-- Interaction counts aggregated without user details
CREATE POLICY "Public interactions read"
ON report_interactions FOR SELECT
USING (true);
```

## User Interface

### Controls

1. **Heat Layer Toggle**: Show/hide heat overlay
2. **Clusters Toggle**: Show/hide cluster markers
3. **Refresh Button**: Manual data refresh
4. **Cluster Click**: View detailed breakdown

### Information Displayed

- Total active reports
- High-priority hotspots count
- Total clusters
- Average reports per cluster
- Category breakdown
- Individual report details

## Troubleshooting

### Common Issues

**Issue**: Heat map not displaying
- **Solution**: Check if user location is available and reports exist in radius

**Issue**: Clusters not updating in real-time
- **Solution**: Verify Supabase realtime subscriptions are enabled

**Issue**: Performance degradation with many reports
- **Solution**: Reduce radiusKm or implement pagination

**Issue**: TypeScript errors with leaflet.heat
- **Solution**: Ensure `src/types/leaflet.heat.d.ts` is included in tsconfig

## Future Enhancements

### Planned Features

1. **Historical Analysis**
   - Time-series heat maps
   - Trend visualization
   - Seasonal patterns

2. **Advanced Filtering**
   - Category-specific heat maps
   - Date range selection
   - Intensity threshold adjustment

3. **Export Capabilities**
   - PDF report generation
   - CSV data export
   - Screenshot functionality

4. **Predictive Analytics**
   - ML-based hotspot prediction
   - Resource allocation suggestions
   - Automated priority scoring

## Support & Maintenance

### Monitoring

- Check Supabase logs for real-time subscription errors
- Monitor API response times for fetchHeatmapReports
- Track clustering performance for large datasets

### Updates

- Update leaflet.heat to latest version when available
- Review clustering algorithm efficiency quarterly
- Optimize gradient colors based on user feedback

## License

This feature is part of the CivicAid platform. All rights reserved.

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Maintainer**: CivicAid Development Team
