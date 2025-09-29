#!/bin/bash

# 分布式任务调度系统管理后台启动脚本

echo "🚀 启动分布式任务调度系统管理后台..."

# 检查Node.js版本
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 错误: Node.js版本过低，需要16+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本检查通过: $(node -v)"

# 检查是否存在node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已存在"
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 创建环境变量文件..."
        cp .env.example .env
        echo "✅ 已创建.env文件，请根据需要修改配置"
    else
        echo "⚠️  警告: 未找到.env文件，请手动创建并配置API地址"
    fi
fi

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "📍 访问地址: http://localhost:3000"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

npm start
