---
layout:     post
title:      "超轻量超简单的markdown博客"
subtitle:   ""
date:       2025-04-18
author:     ""
tags:

---


我的markdown越攒越多了，有时候又需要给人分享。就想着找个简单轻量的markdown博客系统部署出去。
结果没想到，现在仅仅是把markdown伺服起来这么一个简单的需求，都没有合适的工具了。
大概看了ghost、cms.js等工具，感觉还是不够简单。干脆用AI写个得了。

在这篇文章中，将展示如何构建一个极简的、超轻量级的 Markdown 博客系统。整个系统依赖于 Python 的 Flask 框架，使用 Markdown 格式的文件作为文章内容，并通过简单的前端页面展示。
它不仅易于部署，而且具备基础的登录功能来保护你的内容。

### **功能概述**

- **登录保护**：确保只有经过验证的用户可以访问 Markdown 文件。
- **Markdown 渲染**：将 Markdown 文件转换为 HTML 并展示。
- **文件管理**：列出目录下的所有 Markdown 文件，用户可以点击查看。

### **技术栈**

- **Flask**：轻量级的 Python Web 框架，用于构建 Web 应用。
- **Markdown**：将 Markdown 格式的文本文件转换为 HTML。
- **HTML/CSS**：用于前端展示，没有任何排版。

### **搭建步骤**

#### 1. **安装必要的依赖**

需要安装 Flask 和 Markdown Python 库。

```bash
pip install flask markdown
```

#### 2. **项目结构**

项目的文件结构如下所示：

```
/markdown-blog
    /local-files    # 存放所有的Markdown文件
    /templates      # 存放所有的HTML模板
        index.html
        login.html
        md.html
    app.py           # 主应用文件
```

#### 3. **编写 Flask 应用（app.py）**

这是整个应用的核心部分。`Flask` 用于创建 Web 应用，`markdown` 用于将 Markdown 文件转换为 HTML，应用还实现了登录保护功能。

```python
from flask import Flask, render_template, abort, request, session, redirect, url_for
import os
import markdown

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # 设置一个随机密钥

# 配置Markdown文件目录（修改为你的实际路径）
MD_DIR = os.path.join(os.path.dirname(__file__), 'local-files')
PASSWORD = '123'  # 硬编码密码

def check_auth():
    """检查是否已登录"""
    return session.get('authenticated', False)

@app.route('/login', methods=['GET', 'POST'])
def login():
    """登录页面"""
    if request.method == 'POST':
        password = request.form.get('password', '')
        if password == PASSWORD:
            session['authenticated'] = True
            return redirect(url_for('index'))
        return render_template('login.html', error='密码错误')
    return render_template('login.html')

@app.route('/')
def index():
    """显示Markdown文件列表"""
    if not check_auth():
        return redirect(url_for('login'))

    # 获取目录下所有md文件
    mds = [f for f in os.listdir(MD_DIR) if f.endswith('.md')]
    # 按文件名排序
    mds.sort()
    return render_template('index.html', mds=mds)

@app.route('/md/<filename>')
def render_md(filename):
    """渲染指定Markdown文件"""
    if not check_auth():
        return redirect(url_for('login'))

    # 防止路径穿越攻击
    if '..' in filename or filename not in os.listdir(MD_DIR):
        abort(404)

    # 构建完整文件路径
    filepath = os.path.join(MD_DIR, filename)

    # 读取并转换Markdown
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        html_content = markdown.markdown(content, extensions=['extra'])
    except Exception as e:
        abort(500, description=f"Error reading file: {str(e)}")

    return render_template('md.html', content=html_content, filename=filename)

if __name__ == '__main__':
    # 确保目录存在
    os.makedirs(MD_DIR, exist_ok=True)
    app.run(debug=True)
```

#### 4. **创建 HTML 模板**

**index.html**（显示所有 Markdown 文件的列表）：
```html
<!DOCTYPE html>
<html>
<head>
    <title>Markdown文件列表</title>
    <style>
        body { max-width: 800px; margin: 20px auto; padding: 20px; }
        a { display: block; padding: 8px; text-decoration: none; color: #0366d6; }
        a:hover { background: #f6f8fa; }
    </style>
</head>
<body>
    <h1>选择要查看的Markdown文件：</h1>
    {% for md in mds %}
        <a href="{{ url_for('render_md', filename=md) }}">{{ md }}</a>
    {% else %}
        <p>目录下没有Markdown文件</p>
    {% endfor %}
</body>
</html>
```

**login.html**（用于登录页面）：
```html
<!DOCTYPE html>
<html>
<head>
    <title>登录</title>
</head>
<body>
    <h1>请输入访问密码</h1>
    {% if error %}
        <p style="color: red;">{{ error }}</p>
    {% endif %}
    <form method="post">
        <input type="password" name="password" required>
        <button type="submit">登录</button>
    </form>
</body>
</html>
```

**md.html**（显示 Markdown 文件内容）：
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{ filename }}</title>
    <style>
        body { max-width: 800px; margin: 20px auto; padding: 20px; }
        pre { background: #f6f8fa; padding: 15px; border-radius: 5px; }
        code { font-family: SFMono-Regular,Consolas,Menlo,monospace; }
        blockquote { border-left: 4px solid #dfe2e5; padding-left: 15px; color: #6a737d; }
        table { border-collapse: collapse; }
        th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
    </style>
</head>
<body>
    <a href="{{ url_for('index') }}">← 返回列表</a>
    <div class="markdown-content">
        {{ content|safe }}
    </div>
</body>
</html>
```

#### 5. **运行应用**

在项目目录下执行以下命令启动 Flask 应用：

```bash
python app.py
```

应用将运行在 `http://127.0.0.1:5000`，你可以通过浏览器访问它。

#### 6. **如何使用**

1. 将你的 Markdown 文件（`.md` 格式）放在 `local-files` 目录下。
2. 访问首页并输入正确的密码登录。
3. 登录后，你可以浏览所有 Markdown 文件，点击链接查看文件内容。

### **总结**
这个简单的 Markdown 博客系统是一个非常基础的项目，适合想要搭建轻量博客的开发者。你可以通过自定义 Markdown 文件目录、密码保护等，满足个人博客的需求。因为是 Flask 应用，你还可以根据需求进一步扩展功能，比如添加评论系统、分页功能等。
