#!/bin/bash

# Run the Playwright test to generate the video
echo "🎥 Recording Playwright test..."
npx playwright test record.spec.js

# Define paths for convenience
VIDEO_PATH="test-results/record-record-interactions-chromium/video.webm"
PALETTE_PATH="/tmp/palette.png"
GIF_PATH="screenshots/demo.gif"

# Step 1: Generate a high-quality color palette from the video
echo "🎨 Generating color palette..."
ffmpeg -i $VIDEO_PATH -vf "fps=10,scale=800:-1:flags=lanczos,palettegen" -y $PALETTE_PATH

# Step 2: Create the optimized GIF using the palette and mpdecimate filter
echo "🚀 Creating optimized GIF..."
ffmpeg -i $VIDEO_PATH -i $PALETTE_PATH -lavfi "fps=10,scale=800:-1:flags=lanczos[x];[x][1:v]paletteuse,mpdecimate" -y $GIF_PATH

echo "✅ Optimized GIF created at $GIF_PATH"