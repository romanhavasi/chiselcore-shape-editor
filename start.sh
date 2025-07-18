#!/bin/bash

PORT=${1:-3000}
DIST_DIR="./dist"

echo "🔧 Building Chiselcore Voxel Editor..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting static file server..."
    echo "📱 Open http://localhost:$PORT in your browser"
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Detect and use the best available HTTP server
    if command -v python3 >/dev/null 2>&1; then
        echo "🐍 Using Python 3 HTTP server"
        cd "$DIST_DIR" && python3 -m http.server "$PORT"
    elif command -v python >/dev/null 2>&1; then
        echo "🐍 Using Python 2 HTTP server"
        cd "$DIST_DIR" && python -m SimpleHTTPServer "$PORT"
    elif command -v php >/dev/null 2>&1; then
        echo "🐘 Using PHP built-in server"
        php -S "localhost:$PORT" -t "$DIST_DIR"
    elif command -v ruby >/dev/null 2>&1; then
        echo "💎 Using Ruby WEBrick server"
        cd "$DIST_DIR" && ruby -run -ehttpd . -p"$PORT"
    elif command -v node >/dev/null 2>&1; then
        echo "🟢 Using Node.js fallback server"
        node server.js
    else
        echo "❌ No suitable HTTP server found!"
        echo "💡 Please install one of: python3, python, php, ruby, or node"
        echo "🍎 On Mac: python3 is usually pre-installed"
        exit 1
    fi
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi 