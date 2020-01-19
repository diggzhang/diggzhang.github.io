---
layout:     post
title:      "shell下用数组传参给函数"
subtitle:   ""
date:       2018-03-13
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
in-post-img: "img/post-bg-unix-linux.jpg"

tags:
     - shell

---

## 问题

在构建一个数据库恢复工具过程中，我在维护一个表名列表，需要写一行一行的恢复命令去挨个回滚表。形式如下：

```shell
restore collection01
restore collection02
restore collection03
......
```

初期维护几张表还好，但是随着量级增加写这么一大串还是很烦的。于是想试着只维护一个名单就足够，恢复部分抽象成shell函数。

知识点一，如何在shell下面构建一个数组。使用`declare -a`声明：

```shell
## declare an array variable
declare -a array=("one" "two" "three")
```

知识点二，传参给函数。如果只使用`${elem_arr}`作为值传递，只会投递数组第一个值到函数，`"$@"`代表将所有参数传递。放到数组传参给函数的方法就是：

```shell
pass_array_arg_to_function "${elem_arr[@]}"
```

知识点三，到函数以后使用`local`做变量隔离。

知识点四，使用`for...in...`做数组遍历。


## 解决

完整参考代码：

```shell
#!/bin/bash

pass_array_arg_to_function() {
  local arr=("$@")

  for elem in "${arr[@]}";
  do
      echo "$elem"
      # do something here...
  done
}

declare -a elem_arr=(
  "elem01"
  "elem02"
  "elem03"
  "elem04"
  "elem05"
)

pass_array_arg_to_function "${elem_arr[@]}"

```
