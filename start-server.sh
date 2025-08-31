#!/bin/bash

# TextGraph Server Starter
# Starts the main text-as-graph visualization server

LOCAL_IP=$(ip route get 1 | awk '{print $7; exit}' 2>/dev/null || echo "127.0.0.1")
PORT=3000

echo "🚀 Starting TextGraph Server..."
echo "📍 Local access: http://localhost:${PORT}"
echo "🌐 Network access: http://${LOCAL_IP}:${PORT}"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

npm run start