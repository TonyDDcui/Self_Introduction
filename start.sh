#!/bin/bash
# TonyDDcui Portfolio - Quick Start Script
# 快速啟動本地開發服務器

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     TonyDDcui - Apple Style Portfolio                      ║"
echo "║     快速啟動本地開發服務器                                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 檢查 Python 是否安裝
if command -v python3 &> /dev/null; then
    echo "✓ 檢測到 Python 3"
    echo ""
    echo "啟動本地服務器..."
    echo "訪問地址: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo ""
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✓ 檢測到 Python"
    echo ""
    echo "啟動本地服務器..."
    echo "訪問地址: http://localhost:8000"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo ""
    python -m http.server 8000
elif command -v npx &> /dev/null; then
    echo "✓ 檢測到 Node.js"
    echo ""
    echo "啟動本地服務器..."
    echo "訪問地址: http://localhost:8080"
    echo ""
    echo "按 Ctrl+C 停止服務器"
    echo ""
    npx http-server
else
    echo "✗ 未找到 Python 或 Node.js"
    echo ""
    echo "請安裝以下之一:"
    echo "1. Python 3: https://www.python.org/downloads/"
    echo "2. Node.js: https://nodejs.org/"
    echo ""
fi
