# Tags API Guide

Complete guide for using the Tags and Event filtering endpoints in HollyMarket API.

## Overview

The Tags API allows you to:
1. Fetch all available tags/categories from Polymarket
2. Filter events by specific tags
3. Filter events by multiple criteria (active, closed, archived, tag)

## Endpoints

### 1. Get All Tags

Fetch all available tags/categories from Polymarket.

**Endpoint:**
```
GET /api/v1/markets/tags
```

**Authentication:** Optional

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 15,
    "tags": [
      {
        "id": "politics",
        "name": "Politics",
        "slug": "politics",
        "description": "Political events and elections",
        "eventCount": 45,
        "marketCount": 120
      },
      {
        "id": "crypto",
        "name": "Crypto",
        "slug": "crypto",
        "description": "Cryptocurrency and blockchain markets",
        "eventCount": 32,
        "marketCount": 89
      },
      {
        "id": "sports",
        "name": "Sports",
        "slug": "sports",
        "description": "Sports events and outcomes",
        "eventCount": 28,
        "marketCount": 156
      },
      {
        "id": "business",
        "name": "Business",
        "slug": "business",
        "description": "Business and economic events",
        "eventCount": 21,
        "marketCount": 67
      },
      {
        "id": "technology",
        "name": "Technology",
        "slug": "technology",
        "description": "Technology and innovation",
        "eventCount": 18,
        "marketCount": 54
      },
      {
        "id": "science",
        "name": "Science",
        "slug": "science",
        "description": "Scientific discoveries and achievements",
        "eventCount": 12,
        "marketCount": 34
      },
      {
        "id": "entertainment",
        "name": "Entertainment",
        "slug": "entertainment",
        "description": "Entertainment and media events",
        "eventCount": 15,
        "marketCount": 42
      },
      {
        "id": "climate",
        "name": "Climate",
        "slug": "climate",
        "description": "Climate and environmental events",
        "eventCount": 9,
        "marketCount": 28
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl http://localhost:4000/api/v1/markets/tags
```

---

### 2. Get Events by Tag

Fetch events filtered by a specific tag ID.

**Endpoint:**
```
GET /api/v1/markets/events/tag/:tagId
```

**Authentication:** Optional

**Path Parameters:**
- `tagId` (string, required) - The tag ID to filter by (e.g., "politics", "crypto")

**Query Parameters:**
- `limit` (number, optional) - Number of events to return (default: 50)
- `offset` (number, optional) - Number of events to skip (default: 0)
- `active` (boolean, optional) - Filter by active events
- `closed` (boolean, optional) - Filter by closed events
- `archived` (boolean, optional) - Filter by archived events

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "tagId": "politics",
    "events": [
      {
        "id": "21442",
        "slug": "2024-presidential-election",
        "title": "2024 Presidential Election",
        "description": "Who will win the 2024 United States presidential election?",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-11-06T00:00:00.000Z",
        "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/2024-presidential-election.png",
        "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/icon.png",
        "active": true,
        "closed": false,
        "archived": false,
        "markets": [
          {
            "id": "0x123abc...",
            "question": "Will Donald Trump win the 2024 Presidential Election?",
            "slug": "will-donald-trump-win-2024",
            "conditionId": "0x456def...",
            "resolutionSource": "Electoral College",
            "endDate": "2024-11-06T00:00:00.000Z",
            "liquidity": 5420000,
            "volume": 15800000,
            "active": true,
            "closed": false,
            "archived": false,
            "new": false,
            "featured": true,
            "submitted_by": "Polymarket",
            "outcomes": ["Yes", "No"],
            "outcomePrices": ["0.52", "0.48"],
            "clobTokenIds": ["token_yes_123", "token_no_456"],
            "description": "This market will resolve to Yes if Donald Trump wins...",
            "category": "Politics"
          }
        ],
        "tags": ["Politics", "US Election", "2024"],
        "commentCount": 1250,
        "liquidity": 5420000,
        "volume": 15800000
      },
      {
        "id": "21445",
        "slug": "senate-control-2024",
        "title": "Senate Control 2024",
        "description": "Which party will control the US Senate after 2024 elections?",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-11-06T00:00:00.000Z",
        "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/senate-2024.png",
        "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/senate-icon.png",
        "active": true,
        "closed": false,
        "archived": false,
        "markets": [
          {
            "id": "0xabc789...",
            "question": "Will Republicans control the Senate after 2024?",
            "slug": "republicans-senate-2024",
            "conditionId": "0xdef012...",
            "resolutionSource": "Official Election Results",
            "endDate": "2024-11-06T00:00:00.000Z",
            "liquidity": 2100000,
            "volume": 7800000,
            "active": true,
            "closed": false,
            "archived": false,
            "new": false,
            "featured": true,
            "submitted_by": "Polymarket",
            "outcomes": ["Yes", "No"],
            "outcomePrices": ["0.55", "0.45"],
            "clobTokenIds": ["token_yes_sen", "token_no_sen"],
            "category": "Politics"
          }
        ],
        "tags": ["Politics", "US Election", "Senate"],
        "commentCount": 680,
        "liquidity": 2100000,
        "volume": 7800000
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

**cURL Examples:**

Basic request:
```bash
curl http://localhost:4000/api/v1/markets/events/tag/politics
```

With filters:
```bash
curl "http://localhost:4000/api/v1/markets/events/tag/politics?active=true&limit=10"
```

With pagination:
```bash
curl "http://localhost:4000/api/v1/markets/events/tag/crypto?limit=20&offset=20"
```

---

### 3. Get Events (Enhanced with Tag Filter)

The existing events endpoint now supports filtering by tag.

**Endpoint:**
```
GET /api/v1/markets/events
```

**Authentication:** Optional

**Query Parameters:**
- `limit` (number, optional) - Number of events to return (default: 50)
- `offset` (number, optional) - Number of events to skip (default: 0)
- `active` (boolean, optional) - Filter by active events
- `closed` (boolean, optional) - Filter by closed events
- `archived` (boolean, optional) - Filter by archived events
- **`tag_id` (string, optional)** - Filter by tag ID (NEW!)

**Response:** Same structure as "Get Events by Tag" above

**cURL Examples:**

Filter by tag:
```bash
curl "http://localhost:4000/api/v1/markets/events?tag_id=politics&active=true"
```

Multiple filters:
```bash
curl "http://localhost:4000/api/v1/markets/events?tag_id=crypto&active=true&limit=25"
```

---

## TypeScript Types

Add these types to your frontend:

```typescript
// Tag type
export interface PolymarketTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  eventCount?: number;
  marketCount?: number;
}

// Updated GetEventsParams
export interface GetEventsParams {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  tag?: string;  // NEW!
}
```

---

## Frontend Integration

### Update API Client

Add these methods to your API client:

```typescript
// lib/api-client.ts

async getTags() {
  const { data } = await this.client.get('/markets/tags');
  return data;
}

async getEventsByTag(
  tagId: string,
  params?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    closed?: boolean;
    archived?: boolean;
  }
) {
  const { data } = await this.client.get(`/markets/events/tag/${tagId}`, { params });
  return data;
}

// Updated getEvents method
async getEvents(params?: {
  limit?: number;
  offset?: number;
  active?: boolean;
  closed?: boolean;
  archived?: boolean;
  tag_id?: string;  // NEW!
}) {
  const { data } = await this.client.get('/markets/events', { params });
  return data;
}
```

---

## React Component Examples

### 1. Tags List Component

Display all available tags as clickable filters:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketTag } from '@/types/api';

export default function TagsFilter({ onTagSelect }: { onTagSelect: (tagId: string) => void }) {
  const [tags, setTags] = useState<PolymarketTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const response = await apiClient.getTags();
      setTags(response.data.tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTag(tagId === selectedTag ? null : tagId);
    onTagSelect(tagId === selectedTag ? '' : tagId);
  };

  if (loading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => handleTagClick('')}
        className={`px-4 py-2 rounded-full border transition ${
          !selectedTag
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
        }`}
      >
        All Categories
      </button>

      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleTagClick(tag.id)}
          className={`px-4 py-2 rounded-full border transition ${
            selectedTag === tag.id
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
          }`}
        >
          {tag.name}
          {tag.eventCount && (
            <span className="ml-2 text-sm opacity-75">({tag.eventCount})</span>
          )}
        </button>
      ))}
    </div>
  );
}
```

### 2. Events with Tag Filtering

Complete events page with tag filtering:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketEvent } from '@/types/api';
import TagsFilter from '@/components/TagsFilter';

export default function EventsPage() {
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>('');

  useEffect(() => {
    loadEvents();
  }, [selectedTag]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getEvents({
        active: true,
        limit: 50,
        tag_id: selectedTag || undefined,
      });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Events</h1>

      {/* Tags Filter */}
      <TagsFilter onTagSelect={setSelectedTag} />

      {/* Loading State */}
      {loading && (
        <div className="text-center p-8">Loading events...</div>
      )}

      {/* Events Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && events.length === 0 && (
        <div className="text-center p-8 text-gray-500">
          No events found for this category
        </div>
      )}
    </div>
  );
}

function EventCard({ event }: { event: PolymarketEvent }) {
  return (
    <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
      {event.image && (
        <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{event.title}</h2>
        {event.description && (
          <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags?.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-200 rounded text-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{event.markets.length} markets</span>
          {event.volume && <span>Vol: ${(event.volume / 1000000).toFixed(1)}M</span>}
        </div>
      </div>
    </div>
  );
}
```

### 3. Custom Hook for Tags

```typescript
// hooks/useTags.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketTag } from '@/types/api';

export function useTags() {
  const [tags, setTags] = useState<PolymarketTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getTags();
      setTags(response.data.tags);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  return { tags, loading, error, refresh: loadTags };
}
```

### 4. Custom Hook for Events by Tag

```typescript
// hooks/useEventsByTag.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { PolymarketEvent } from '@/types/api';

export function useEventsByTag(tagId: string | null, active: boolean = true) {
  const [events, setEvents] = useState<PolymarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tagId) {
      loadEventsByTag();
    } else {
      loadAllEvents();
    }
  }, [tagId, active]);

  const loadEventsByTag = async () => {
    if (!tagId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getEventsByTag(tagId, { active, limit: 50 });
      setEvents(response.data.events);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadAllEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getEvents({ active, limit: 50 });
      setEvents(response.data.events);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refresh: tagId ? loadEventsByTag : loadAllEvents };
}
```

---

## Testing the Endpoints

### Using cURL

**1. Get all tags:**
```bash
curl http://localhost:4000/api/v1/markets/tags
```

**2. Get events by tag:**
```bash
curl http://localhost:4000/api/v1/markets/events/tag/politics
```

**3. Get events with tag filter:**
```bash
curl "http://localhost:4000/api/v1/markets/events?tag_id=crypto&active=true"
```

**4. Get events by tag with pagination:**
```bash
curl "http://localhost:4000/api/v1/markets/events/tag/sports?limit=10&offset=0"
```

### Using Postman/Thunder Client

1. **GET Tags:**
   - URL: `http://localhost:4000/api/v1/markets/tags`
   - Method: GET

2. **GET Events by Tag:**
   - URL: `http://localhost:4000/api/v1/markets/events/tag/politics`
   - Method: GET
   - Query Params: `active=true`, `limit=10`

3. **GET Events with Tag Filter:**
   - URL: `http://localhost:4000/api/v1/markets/events`
   - Method: GET
   - Query Params: `tag_id=crypto`, `active=true`

---

## Common Use Cases

### 1. Category Navigation

Display a navigation menu with all categories:

```typescript
const { tags } = useTags();

return (
  <nav>
    {tags.map(tag => (
      <Link key={tag.id} href={`/events/${tag.slug}`}>
        {tag.name} ({tag.eventCount})
      </Link>
    ))}
  </nav>
);
```

### 2. Filter Events by Multiple Tags

Allow users to select multiple tags:

```typescript
const [selectedTags, setSelectedTags] = useState<string[]>([]);

// Load events with first selected tag
const { events } = useEventsByTag(selectedTags[0] || null);

// Filter client-side for additional tags
const filteredEvents = selectedTags.length > 1
  ? events.filter(event =>
      event.tags?.some(tag => selectedTags.includes(tag.toLowerCase()))
    )
  : events;
```

### 3. Tag-based Routing

Create dynamic routes for each tag:

```typescript
// app/events/[tag]/page.tsx
export default function TagPage({ params }: { params: { tag: string } }) {
  const { events, loading } = useEventsByTag(params.tag);

  return (
    <div>
      <h1>Events in {params.tag}</h1>
      {/* Render events */}
    </div>
  );
}
```

---

## Summary

You now have three ways to work with tags:

1. **`GET /markets/tags`** - Fetch all available tags
2. **`GET /markets/events/tag/:tagId`** - Fetch events filtered by specific tag
3. **`GET /markets/events?tag_id=tagId`** - Fetch events with tag_id as query parameter

All endpoints support pagination and filtering by active/closed/archived status.

For more details, see [README.md](README.md) and [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md).
