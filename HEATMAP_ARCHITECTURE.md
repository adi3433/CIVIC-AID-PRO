# Heat Map System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CIVICAID PLATFORM                        │
│                                                                   │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐     │
│  │   Reports   │      │   Safety    │      │  Database   │     │
│  │    Page     │──────│    Page     │──────│  (Supabase) │     │
│  └─────────────┘      └─────────────┘      └─────────────┘     │
│         │                    │                     │              │
│         │                    │                     │              │
│         └────────────────────┴─────────────────────┘              │
│                              ▼                                    │
│                    ┌──────────────────┐                          │
│                    │   Heat Map Tab   │                          │
│                    └──────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
HeatMapVisualization Component
├── State Management
│   ├── reports[]              // Active report data
│   ├── loading               // Initial load state
│   ├── refreshing            // Manual refresh state
│   ├── showHeatmap           // Heat layer visibility
│   ├── showClusters          // Cluster visibility
│   ├── selectedCluster       // Selected cluster details
│   └── stats                 // Calculated statistics
│
├── Effects (useEffect)
│   ├── fetchData()           // Initial data load
│   ├── subscribeToChanges()  // Real-time updates
│   ├── initializeMap()       // Leaflet map setup
│   ├── updateHeatLayer()     // Heat visualization
│   └── updateClusters()      // Cluster markers
│
└── Render Output
    ├── Controls Card         // Toggles & refresh
    ├── Statistics Cards      // Hotspots & metrics
    ├── Leaflet Map           // Main visualization
    ├── Legend Card           // Color meanings
    ├── Category Breakdown    // Issue types
    └── Cluster Details Modal // Popup details
```

## Data Flow Diagram

```
USER LOCATION
     │
     ▼
┌──────────────────────┐
│ fetchHeatmapReports  │
└──────────────────────┘
     │
     ├─► Query "reports" table
     │   └─► WHERE status = 'reported'
     │   └─► WHERE location IN radius
     │
     ├─► Query "report_interactions"
     │   └─► Calculate upvotes/downvotes
     │
     └─► Calculate duplicates
         └─► Find reports within 10m
     │
     ▼
┌──────────────────────┐
│  ReportHeatmapData[] │
└──────────────────────┘
     │
     ├─► clusterReports()
     │   └─► Group by 20m radius
     │   └─► Calculate intensity
     │
     └─► calculateHeatmapStats()
         └─► Generate metrics
     │
     ▼
┌──────────────────────┐
│  VISUALIZATION LAYER │
├──────────────────────┤
│ • Heat Layer         │ ← Color gradient overlay
│ • Cluster Markers    │ ← Numbered circles
│ • User Marker        │ ← Blue dot
│ • Radius Circle      │ ← Search area boundary
└──────────────────────┘
```

## Real-Time Update Flow

```
DATABASE CHANGE
     │
     ├─► INSERT new report
     │   OR
     ├─► UPDATE report (upvote)
     │   OR
     └─► INSERT interaction
     │
     ▼
┌─────────────────────┐
│ Supabase Realtime   │
│ (WebSocket)         │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ subscribeToChanges  │
│ callback triggered  │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ fetchData(true)     │
│ (with toast)        │
└─────────────────────┘
     │
     ▼
┌─────────────────────┐
│ Map Auto-Updates    │
│ • Heat layer        │
│ • Clusters          │
│ • Statistics        │
└─────────────────────┘
```

## Clustering Algorithm

```
INPUT: reports[], clusterRadius = 20m

STEP 1: Initialize
├── clusters = []
└── processed = Set()

STEP 2: For each report
├── IF already processed → SKIP
│
├── ELSE find nearby reports:
│   ├── same category
│   ├── distance ≤ 20m
│   └── not yet processed
│
├── CREATE cluster:
│   ├── center = avg(lat, lng)
│   ├── count = report.length
│   ├── intensity = weighted score
│   │   ├── 50% × (count / 10)
│   │   ├── 30% × (avgUpvotes / 5)
│   │   └── 20% × (duplicates / 10)
│   └── reports[] = all in cluster
│
└── MARK all as processed

OUTPUT: ClusteredReport[]
```

## Intensity Calculation

```
INTENSITY SCORE (0.0 to 1.0)

Components:
┌─────────────────────────┐
│ Report Count (50%)      │ → normalized (cap at 10 reports)
├─────────────────────────┤
│ Average Upvotes (30%)   │ → normalized (cap at 5 upvotes)
├─────────────────────────┤
│ Duplicates (20%)        │ → normalized (cap at 10 duplicates)
└─────────────────────────┘
         │
         ▼
    FINAL SCORE = sum of weighted components
         │
         ├─► 0.0 - 0.3  →  Yellow (low)
         ├─► 0.3 - 0.5  →  Gold
         ├─► 0.5 - 0.7  →  Orange (medium)
         ├─► 0.7 - 0.9  →  Orange-Red
         └─► 0.9 - 1.0  →  Red (high/urgent)
```

## Heat Map Color Gradient

```
VISUAL REPRESENTATION

Intensity    Color       Hex Code    Meaning
──────────────────────────────────────────────────
  0.0        Yellow      #FFFF00     Very Low
  0.3        Gold        #FFD700     Low
  0.5        Orange      #FFA500     Medium
  0.7        OrangeRed   #FF4500     High
  1.0        Red         #DC2626     Critical/Urgent

Usage:
• Lighter shades = fewer reports, lower priority
• Darker shades = many reports, high priority
• Helps identify neglected zones at a glance
```

## Database Schema Relationships

```
┌─────────────────────┐
│      reports        │
├─────────────────────┤
│ id (PK)             │───┐
│ user_id (FK)        │   │
│ latitude            │   │
│ longitude           │   │
│ category            │   │
│ status              │   │ ONE-TO-MANY
│ created_at          │   │
└─────────────────────┘   │
                          │
                          ├──► Used by Heat Map
                          │    for visualization
                          │
┌─────────────────────┐   │
│ report_interactions │   │
├─────────────────────┤   │
│ id (PK)             │   │
│ report_id (FK)      │───┘
│ user_id (FK)        │
│ interaction_type    │ ('upvote' | 'downvote')
│ created_at          │
└─────────────────────┘

Query Pattern:
SELECT r.*, 
       COUNT(CASE WHEN i.interaction_type = 'upvote' THEN 1 END) as upvotes,
       COUNT(CASE WHEN i.interaction_type = 'downvote' THEN 1 END) as downvotes
FROM reports r
LEFT JOIN report_interactions i ON r.id = i.report_id
WHERE r.status = 'reported'
GROUP BY r.id
```

## Performance Optimization Strategy

```
OPTIMIZATION LAYERS

1. DATABASE LEVEL
   ├── Index on (status, latitude, longitude)
   ├── Index on report_interactions.report_id
   └── Filter early (status = 'reported')

2. API LEVEL
   ├── Fetch only required fields
   ├── Batch interaction queries
   └── Spatial filtering (radius)

3. CLIENT LEVEL
   ├── Client-side clustering (reduce network calls)
   ├── Memoized distance calculations
   ├── Lazy map initialization
   └── Debounced refresh triggers

4. CACHING STRATEGY
   ├── Store last fetch timestamp
   ├── Skip redundant API calls
   └── Smart refresh on real-time events only

RESULT: Handles 1,000+ reports smoothly
```

## Security & Privacy Architecture

```
DATA ACCESS CONTROL

┌──────────────────┐
│  Public Access   │
├──────────────────┤
│ • Report location│ ✅ Visible
│ • Category       │ ✅ Visible
│ • Status         │ ✅ Visible (if "reported")
│ • Upvote counts  │ ✅ Visible (aggregated)
│ • Created date   │ ✅ Visible
└──────────────────┘

┌──────────────────┐
│ Protected Data   │
├──────────────────┤
│ • User identity  │ ❌ Hidden (if anonymous)
│ • Contact info   │ ❌ Never exposed
│ • Voter identity │ ❌ Anonymous aggregation
│ • Exact coords   │ ⚠️  Rounded (privacy)
└──────────────────┘

RLS Policies:
• Read: Anyone (authenticated + anon)
• Write: Authenticated only
• Update: Original author only
• Delete: Admin only
```

## Scalability Roadmap

```
CURRENT CAPACITY → FUTURE GROWTH

Phase 1 (Current)
├── 1,000 reports/area
├── Client-side clustering
├── Real-time updates (10 users)
└── 50km radius

Phase 2 (Next 6 months)
├── 5,000 reports/area
├── Hybrid clustering (server + client)
├── Real-time updates (50 users)
└── Variable radius

Phase 3 (Future)
├── 50,000+ reports/area
├── Server-side clustering with caching
├── Real-time updates (500+ users)
├── City-wide/national coverage
└── Predictive analytics integration
```

## File Dependencies

```
Safety.tsx
    │
    ├─► imports HeatMapVisualization
    │        │
    │        ├─► imports heatmapService
    │        │        │
    │        │        ├─► fetchHeatmapReports()
    │        │        ├─► clusterReports()
    │        │        ├─► subscribeToReportChanges()
    │        │        └─► calculateHeatmapStats()
    │        │
    │        ├─► imports supabase (from @/lib/supabase)
    │        │
    │        └─► imports leaflet & leaflet.heat
    │                 │
    │                 └─► uses types from leaflet.heat.d.ts
    │
    └─► renders in "Heat Map" tab
```

## User Journey Flow

```
USER OPENS SAFETY PAGE
        │
        ▼
┌─────────────────┐
│ Allow Location? │
└─────────────────┘
        │
        ├─► YES
        │   ├─► Show 3 tabs: Safety | Heat Map | Digital Safety
        │   ├─► Click "Heat Map" tab
        │   └─► Load HeatMapVisualization
        │           │
        │           ├─► Fetch reports (50km)
        │           ├─► Display heat layer
        │           ├─► Display clusters
        │           ├─► Show statistics
        │           └─► Enable real-time updates
        │
        └─► NO
            └─► Show fallback message
                "Location Required"

USER INTERACTS
        │
        ├─► Click cluster marker
        │   └─► Show modal with details
        │       ├─► Total reports
        │       ├─► Intensity score
        │       ├─► Individual reports list
        │       └─► Priority alert
        │
        ├─► Toggle heat layer
        │   └─► Show/hide color overlay
        │
        ├─► Toggle clusters
        │   └─► Show/hide markers
        │
        └─► Click refresh
            └─► Manually update data
                └─► Show toast notification
```

## Success Metrics

```
MEASURING IMPACT

Technical Metrics:
├── Load time: < 2 seconds
├── Real-time latency: < 1 second
├── Clustering speed: < 500ms
└── Map render: < 1 second

User Engagement:
├── Heat map views
├── Cluster interactions
├── Filter toggles
└── Manual refreshes

Civic Impact:
├── Hotspot identification rate
├── Authority response time
├── Issue resolution correlation
└── Community awareness increase
```

---

**Legend:**
- `│` = Vertical flow
- `├──` = Branch point
- `└──` = End of branch
- `▼` = Direction of flow
- `→` = Transformation
- `✅` = Allowed/Enabled
- `❌` = Blocked/Hidden
- `⚠️` = Conditional/Warning

**Version**: 1.0.0
**Last Updated**: January 2026
