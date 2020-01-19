---
layout:     post
title:      "git下载慢"
subtitle:   "把省下来的时间，投入到无限的无聊中去"
date:       2017-09-16
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category:
tags:
     - git
     - github
---

## 问题

`git`为了保留历史的每一次commit，是一直增量更新，如果不小心在某次commit中提交了大文件，会对未来clone源码的人造成麻烦。

那么问题就来了，如果我不小心提交了一个大文件，比如一部电影，还有办法从git的历史中删除这个大文件，让未来不再更新吗？

经过几次尝试，终于在StackOverflow上面找到答案: [Remove folder and its contents from git/GitHub's history](https://stackoverflow.com/questions/10067848/remove-folder-and-its-contents-from-git-githubs-history)


## 解决

遵循下面的步骤，可以解决这个烦恼：

```
git clone YOUR_REPO
cd YOUR_REPO

for remote in `git branch -r | grep -v /HEAD`; do git checkout --track $remote ; done


git filter-branch --index-filter 'git rm -rf --cached --ignore-unmatch DIRECTORY_NAME/' --prune-empty --tag-name-filter cat -- --all
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d


rm -Rf .git/logs .git/refs/original


git gc --prune=all --aggressive


git push origin --all --force
git push origin --tags --force
```

## 未来怎么办

反思一下，避免提交莫名其妙文件的办法可以从两处入手：

1. 攒一个`gitignore`，尽量从一开始就避免非项目必要文件
2. 优先使用分支开发，尽量不要动master，定期合并一次代码
