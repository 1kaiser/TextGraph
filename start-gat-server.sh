#!/bin/bash

# TextGraph GAT Server Starter
# Starts the GAT (Graph Attention Networks) visualization server

LOCAL_IP=$(ip route get 1 | awk '{print $7; exit}' 2>/dev/null || echo "127.0.0.1")
PORT=42040

echo "🧠 Starting TextGraph GAT Server..."
echo "📍 Local access: http://localhost:${PORT}"
echo "🌐 Network access: http://${LOCAL_IP}:${PORT}"
echo ""
echo "Press Ctrl+C to stop the server"
echo "----------------------------------------"

npm run start:gat