---
layout:     post
title:      "从git提交历史中移除某个文件"
subtitle:   "gitignore写得好，啥都不用愁"
date:       2018-06-28
author:     "diggzhang"

---

### 起因

背景是干了一个脑残事情，我在git项目中提交了两个30M左右的文件，并且push到了github上面。然后在下一次提交代码时候，发现push一直卡顿在`writing objects`:

```
Writing objects:  99% (219/220), 12.65 MiB | 97 KiB/s
```

自己的锅自己洗。

### 解决

有个工具叫`BFG`,专门用于清除git中的大文件和脱敏。但是其实我需要的仅仅是摘除两个已知的大文件。

办法官方已经给出[Removing files from a repository's history](https://help.github.com/articles/removing-files-from-a-repository-s-history/#platform-mac)

首先移除指定的文件：

```
git rm --cached giant_file
```

然后在commit时候使用`--amend -CHEAD`:

```
git commit --amend -CHEAD
```

最后push到github，重新clone项目后提交，问题解决：

```
git push
```
