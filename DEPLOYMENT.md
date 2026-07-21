# 失序人生离线版部署

## 部署要求

- 必须使用 HTTPS，Service Worker 才能安装并缓存全部资源。
- 网站根目录必须是本文件夹内部，而不是它的上级目录。
- 不需要构建命令、Node.js 服务或数据库。

## Cloudflare Pages

1. 新建 Pages 项目。
2. 选择 Direct Upload。
3. 上传本文件夹中的全部文件。
4. 发布后打开分配的 `pages.dev` HTTPS 地址。

## Netlify

1. 新建站点并选择手动部署。
2. 上传本文件夹。
3. `_headers` 和 `_redirects` 会自动生效。

## Vercel

1. 新建项目并将 Root Directory 指向本文件夹。
2. Framework Preset 选择 Other。
3. Build Command 留空，Output Directory 填写 `.`。

## 发布后验证

1. 首次进入后等待“离线资源准备完成”。
2. 开启飞行模式并重新打开游戏。
3. 测试选择、存档、对话和图片画廊。
4. iOS Safari 使用分享菜单添加到主屏幕。
5. Android Chrome 使用安装应用功能。

## 更新版本

使用 `.studio/build-offline.sh` 重新生成离线包。构建脚本会根据全部文件内容生成缓存版本；页面导航优先请求网络，离线时才回退到缓存。
