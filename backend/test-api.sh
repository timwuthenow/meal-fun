#!/bin/bash

# Simple script to test the backend API locally

echo "🧪 Testing Backend API..."
echo ""

# Test health endpoint
echo "1. Health Check:"
curl -s http://localhost:3001/health | jq '.'
echo ""

# Test get all chores
echo "2. Get All Chore Data:"
curl -s http://localhost:3001/api/chores | jq '.'
echo ""

# Test save data
echo "3. Save Test Data:"
curl -s -X POST http://localhost:3001/api/chores \
  -H "Content-Type: application/json" \
  -d '{
    "Rory": {
      "kidName": "Rory",
      "previousStreakDays": 3,
      "weeklyPointsSoFar": 25,
      "lastUpdated": "2024-01-15T10:00:00Z",
      "history": []
    }
  }' | jq '.'
echo ""

# Test get specific kid
echo "4. Get Rory's Data:"
curl -s http://localhost:3001/api/chores/Rory | jq '.'
echo ""

echo "✅ All tests complete!"
echo ""
echo "Note: Make sure the backend server is running (npm run dev)"
