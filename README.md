# S9 胜者为王地图轮换查询器

一个纯前端静态网页，用来根据 6 天轮换规则查询任意日期对应的地图安排。

## 文件说明

- `index.html`：页面结构
- `styles.css`：页面样式
- `app.js`：轮换规则与日期查询逻辑

## 本地打开

直接双击 `index.html` 即可使用。

如果你想用本地静态服务器，也可以在这个目录运行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`

## 部署方式

这是一个静态站点，可以直接部署到：

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

部署时把整个 `s9-map-rotation-web` 目录上传即可，不需要后端。
