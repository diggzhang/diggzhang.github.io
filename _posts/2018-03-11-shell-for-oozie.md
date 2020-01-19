---
layout:     post
title:      "构建适配Oozie调度的shell任务"
subtitle:   ""
date:       2018-03-11
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
in-post-img: "img/post-bg-unix-linux.jpg"

tags:
     - shell
     - oozie
---

Oozie在日常任务调度过程中，可以发起shell action，符合预期的情况是，当oozie调度的脚本执行失败，后续队列的任务也应该失败或者暂停。
但是我们在生产环境发现如果一个负责调度其它任务的shell脚本内部执行任务失败，oozie并不能捕捉到脚本内部任务的状态，猜测是以最后脚本执行的任务状态去判断0或1的状态。

思来想去后，正确的做法应该是构建适配于oozie调度的shell脚本。首先要整理shell脚本，使其内部模块化，保证子任务独立。当互相前后依赖的子任务失败后，应该遵循“快速失败”，让进程自杀，最终考虑优化输出，使日志清晰明了，可以通过日志快速定位失败点。

总结起来就是：模块化\快速失败\优化日志输出。

通过某块功能修整前后对比，去阐述一下优化的技术点。

首先看旧的脚本，完全是线性执行方式，这里面最大的问题就是，当`mongorestore`因为网络或者其他执行失败，后续的脚本依然还是会继续执行。最终排错只能依赖`$LOGFILE`看日志打印到了哪一行。回滚需要重新执行所有逻辑。

```shell
date >> $LOGFILE
echo "7za x today" >> $LOGFILE
7za x $YEAR$MONTH$DAY.7z
echo "mongorestore them all" >> $LOGFILE
mongorestore --drop --db coredb ./$YEAR$MONTH$DAY/onions/ >> $LOGFILE
echo "clean folder" >> $LOGFILE
rm -rf ./$YEAR$MONTH$DAY $YEAR$MONTH$DAY.7z
```

针对上述问题，优化方式是将整个功能区模块化用`{} >> $LOGFILE`包起来，代码结构清晰是第一步，不用为每一行都加个重定向。使用`set -e`可以保证任何非0状态立即终止脚本，错误立即失败，oozie可以捕捉到脚本失败的状态并终止队列中的其余任务。在确认任务执行成功后，再去清理临时文件。如果需要回滚，可以有针对性的执行某一模块，不必整体回滚。

```shell
{
  set -e
  echo "解压业务库备份包"
  7za x "$YEAR$MONTH$DAY".7z
  echo "mongorestore回滚业务库"
  mongorestore --drop --db coredb ./"$YEAR$MONTH$DAY"/onions/
  if [ $? -ne 0 ];then
    echo "清理临时文件"
    rm -rf ./"$YEAR$MONTH$DAY" "$YEAR$MONTH$DAY".7z
  fi
  date
} >> $LOGFILE
```

PS：`shellcheck`真心是个好工具。
