---
layout:     post
title:      "Mac下转JPEG成PDF"
subtitle:   "为了看一部漫画也是蛮拼的"
date:       2016-05-10
author:     "diggzhang"
header-img: "img/in-post/post-jpg-to-pdf/joker.png"
tags:
    - DC
    - life
    - Mac
    - trick
---

随着最近`《蝙蝠侠大战超人》`的火热公映，DC的漫画再一次深入人心，提起DC两大角色之一蝙蝠侠，便想起了他的万年敌手`小丑 Joker`，个人十分喜欢小丑这一角色，有说不尽的故事。

而提起小丑，不得不提起经典`《蝙蝠侠:致命玩笑》`，据说这部漫画真正的主角是小丑，看封面是小丑的经典镜头。于是终于想拜读此神作，google了一番，下载到了该漫画，不过解压一看，是一组高质量的jpeg:

```
➜  蝙蝠侠致命玩笑  $ ls
001.jpg 006.jpg 011.jpg 016.jpg 021.jpg 026.jpg 031.jpg 036.jpg 041.jpg 046.jpg
002.jpg 007.jpg 012.jpg 017.jpg 022.jpg 027.jpg 032.jpg 037.jpg 042.jpg 047.jpg
003.jpg 008.jpg 013.jpg 018.jpg 023.jpg 028.jpg 033.jpg 038.jpg 043.jpg 048.jpg
004.jpg 009.jpg 014.jpg 019.jpg 024.jpg 029.jpg 034.jpg 039.jpg 044.jpg 049.jpg
005.jpg 010.jpg 015.jpg 020.jpg 025.jpg 030.jpg 035.jpg 040.jpg 045.jpg 050.jpg
```

庆幸的是，这组图标有严格的序号。我想可以直接把这组图片转换成PDF放到kindle上面看。转jpg为pdf的办法如下:

1. 第一步 准备工具

```
➜  ~  brew install imagemagick
```

2. 第二步 使用`convert`工具直接生成pdf

```
➜  蝙蝠侠致命玩笑  $ convert *.jpg Batman:TheKilingJoke.pdf
```

大工告成，可以去泡漫画了。
