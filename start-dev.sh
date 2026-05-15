#!/bin/bash
# ================================================
# AI PPT 本地一键启动脚本
# 统一入口：http://localhost:81
# ================================================

set -e
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "🚀 AI PPT 本地开发环境启动中..."
echo ""

# 1. 启动管理面板 Vite (:8181)
echo "📊 启动管理面板 (:8181)..."
cd "$BASE_DIR/AI PPT 后台管理系统/frontend"
npm run dev -- --mode local &
ADMIN_PID=$!

# 2. 启动用户前台 Vite (:3000)
echo "🎨 启动用户前台 (:3000)..."
cd "$BASE_DIR/AI PPT 用户端"
npm run dev &
USER_PID=$!

# 3. 等待 Vite 启动
sleep 3

# 4. 启动网关 (:81)
echo "🌐 启动统一网关 (:81)..."
cd "$BASE_DIR"
node dev-gateway.mjs &
GW_PID=$!

# 清理函数
cleanup() {
    echo ""
    echo "🛑 停止所有服务..."
    kill $ADMIN_PID $USER_PID $GW_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo "✅ 所有前端服务已启动！"
echo ""
echo "   统一入口:  http://localhost:81"
echo "   用户前台:  http://localhost:81/"
echo "   管理面板:  http://localhost:81/admin/"
echo ""
echo "   ⚠️  后端需单独启动 (Spring Boot :48080)"
echo ""
echo "   按 Ctrl+C 停止所有服务"
echo ""

# 等待任意子进程退出
wait
