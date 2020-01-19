---
layout:     post
title:      "Python添加图片水印"
subtitle:   "python练习册 0000"
date:       2016-10-21
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"

tags:
     - python
     - python练习册
---

**[Python练习册](https://github.com/Yixiaohan/show-me-the-code)** 第 0000 题：将你的 QQ 头像（或者微博头像）右上角加上红色的数字，类似于微信未读信息数量那种提示效果。

接受挑战！

首先是下载库`Pillow`:

```shell
➜  ~  sudo pip install Pillow
The directory '/Users/diggzhang/Library/Caches/pip/http' or its parent directory is not owned by the current user and the cache has been disabled. Please check the permissions and owner of that directory. If executing pip with sudo, you may want sudo's -H flag.
The directory '/Users/diggzhang/Library/Caches/pip' or its parent directory is not owned by the current user and caching wheels has been disabled. check the permissions and owner of that directory. If executing pip with sudo, you may want sudo's -H flag.
Collecting Pillow
  Downloading Pillow-3.4.2-cp27-cp27m-macosx_10_6_intel.macosx_10_9_intel.macosx_10_9_x86_64.macosx_10_10_intel.macosx_10_10_x86_64.whl (3.4MB)
    100% |████████████████████████████████| 3.5MB 14kB/s
Installing collected packages: Pillow
Successfully installed Pillow-3.4.2
➜  ~
```

测试一下:

```shell
➜  ~  python
Python 2.7.10 (default, Sep 23 2015, 04:34:21)
[GCC 4.2.1 Compatible Apple LLVM 7.0.0 (clang-700.0.72)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> from PIL import Image
>>> im = Image.open("0000.png")
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/usr/local/lib/python2.7/site-packages/PIL/Image.py", line 2258, in open
    fp = builtins.open(filename, "rb")
IOError: [Errno 2] No such file or directory: '0000.png'
# 看来需要指定绝对路径
>>> im = Image.open("/Users/diggzhang/Desktop/0000.png")
# 如果成功，返回PIL的 `image` Object
>>> im
<PIL.PngImagePlugin.PngImageFile image mode=RGBA size=443x676 at 0x103057AD0>
>>>

```

来段代码，试探一下怎么玩。骨架大概就这样：

```python
from PIL import Image, ImageFont, ImageDraw

text = "42"
img = Image.open("/Users/diggzhang/Desktop/0000.png")

draw = ImageDraw.Draw(img)
draw.text((50, 10), text, fill="white")

img.save('0000-out.png')
```

重构成最终形态，封装了一个函数`add_num_to_img()`传入图片绝对路径和要挂进去的数字，:

```python
from PIL import Image, ImageDraw, ImageFont

def add_num_to_img(img_path, num):
    img = Image.open(img_path)
    x, y = img.size
    font_location = ImageFont.truetype('/Users/diggzhang/Downloads/Hack-v2_020-ttf/Hack-Bold.ttf', x / 3)
    ImageDraw.Draw(img).text((2 * x / 3, 0), str(num), font = font_location, fill = 'red')
    img.save('output.jpg')

if __name__ == '__main__':
    add_num_to_img('/Users/diggzhang/Desktop/0000.png', 42)

```
