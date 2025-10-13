#!/bin/bash

# Run the Playwright test to generate the video
npx playwright test record.spec.js

# Convert the video to a GIF
ffmpeg -i test-results/record-record-interactions-chromium/video.webm -r 10 -f gif screenshots/demo.gif -y