#!/bin/bash
# ============================================================
# 邵阳蓝印花布 — 阿里云 ECS 一键部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh
# ============================================================

set -e

echo "🚀 邵阳蓝印花布 · 服务器部署开始"

# ---------- 1. 安装依赖 ----------
echo "📦 安装 Node.js..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "📦 安装 Nginx..."
sudo apt-get update && sudo apt-get install -y nginx

# ---------- 2. 初始化项目 ----------
APP_DIR="/home/www/shaoyang-blue-calico"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER /home/www

echo "📂 部署项目文件到 $APP_DIR"
cd $APP_DIR

# 如果目录已有内容，跳过克隆；否则从 Git 拉取
if [ ! -f "package.json" ]; then
  git clone https://github.com/sun511001/shaoyang-blue-calico.git .
fi

# ---------- 3. 安装 Node 依赖 ----------
cd server
npm install --production

# ---------- 4. 配置环境变量 ----------
if [ ! -f ".env" ]; then
  read -p "🔑 请输入 HuggingFace API Key: " HF_KEY
  echo "HF_API_KEY=$HF_KEY" > .env
  echo "✅ .env 已创建"
else
  echo "✅ .env 已存在，跳过"
fi

# ---------- 5. 配置 Nginx ----------
sudo cp nginx.conf /etc/nginx/sites-available/blue-calico
sudo ln -sf /etc/nginx/sites-available/blue-calico /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
echo "✅ Nginx 配置完成"

# ---------- 6. 启动 Node 服务 (PM2) ----------
if ! command -v pm2 &>/dev/null; then
  sudo npm install -g pm2
fi

pm2 delete blue-calico 2>/dev/null || true
pm2 start index.js --name blue-calico --env production
pm2 save
pm2 startup systemd -u $USER --hp $HOME
echo "✅ PM2 进程守护已配置"

# ---------- 7. 完成 ----------
IP=$(curl -s ifconfig.me 2>/dev/null || echo "服务器IP")
echo ""
echo "🎉 部署完成！"
echo "   访问地址: http://$IP"
echo "   API 测试: http://$IP/api/auth/me"
echo ""
echo "   PM2 管理:"
echo "     pm2 status          # 查看状态"
echo "     pm2 logs blue-calico # 查看日志"
echo "     pm2 restart blue-calico # 重启"
