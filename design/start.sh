#!/bin/bash

# 分布式任务调度系统管理后台启动脚本
# 作者: AI Assistant
# 日期: 2024-01-15

set -e

echo "=== 分布式任务调度系统管理后台 ==="
echo ""

# 检查Python是否安装
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ 错误: 未找到Python，请先安装Python"
    exit 1
fi

# 检查端口是否被占用
PORT=8081
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  警告: 端口 $PORT 已被占用，尝试使用端口 8082"
    PORT=8082
fi

# 获取当前脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 工作目录: $SCRIPT_DIR"
echo "🌐 启动HTTP服务器..."
echo "🔗 管理后台地址: http://localhost:$PORT"
echo ""

# 启动HTTP服务器
echo "启动中..."
$PYTHON_CMD -m http.server $PORT

echo ""
echo "✅ 管理后台已启动"
echo "📱 请在浏览器中访问: http://localhost:$PORT"
echo "🛑 按 Ctrl+C 停止服务器"
