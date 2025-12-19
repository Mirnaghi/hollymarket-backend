# Tags API Quick Reference

## Endpoints Summary

### 1. Get All Tags
```bash
GET /api/v1/markets/tags
```

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 8,
    "tags": [
      {
        "id": "politics",
        "name": "Politics",
        "slug": "politics",
        "eventCount": 45
      }
      // ... more tags
    ]
  }
}
```

---

### 2. Get Events by Tag (Path Parameter)
```bash
GET /api/v1/markets/events/tag/:tagId
```

**Example:**
```bash
curl http://localhost:4000/api/v1/markets/events/tag/politics?active=true&limit=10
```

---

### 3. Get Events with Tag Filter (Query Parameter)
```bash
GET /api/v1/markets/events?tag_id=:tagId
```

**Example:**
```bash
curl "http://localhost:4000/api/v1/markets/events?tag_id=crypto&active=true"
```

---

## Frontend API Client Methods

```typescript
// Get all tags
async getTags() {
  const { data } = await this.client.get('/markets/tags');
  return data;
}

// Get events by tag (path parameter)
async getEventsByTag(tagId: string, params?: { limit?: number; active?: boolean }) {
  const { data } = await this.client.get(`/markets/events/tag/${tagId}`, { params });
  return data;
}

// Get events (with tag_id query parameter)
async getEvents(params?: { limit?: number; active?: boolean; tag_id?: string }) {
  const { data } = await this.client.get('/markets/events', { params });
  return data;
}
```

---

## Key Points

✅ **Correct parameter name:** `tag_id` (not `tag`)
✅ **Two ways to filter by tag:**
   - Path: `/markets/events/tag/:tagId`
   - Query: `/markets/events?tag_id=:tagId`

✅ **Both methods support:**
   - `limit` - Number of results
   - `offset` - Pagination offset
   - `active` - Filter active events
   - `closed` - Filter closed events
   - `archived` - Filter archived events

---

## Testing Examples

```bash
# Get all tags
curl http://localhost:4000/api/v1/markets/tags

# Get politics events (path parameter)
curl http://localhost:4000/api/v1/markets/events/tag/politics

# Get crypto events (query parameter)
curl "http://localhost:4000/api/v1/markets/events?tag_id=crypto&active=true"

# Get sports events with pagination
curl "http://localhost:4000/api/v1/markets/events/tag/sports?limit=20&offset=0"
```

---

For complete documentation, see [TAGS_API_GUIDE.md](TAGS_API_GUIDE.md)
