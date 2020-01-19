---
layout:     post
title:      "修改superset pivot table去除All字段"
subtitle:   "superset乱得就像superset"
date:       2017-07-19
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: superset
tags:
     - superset
     - BIG DATA
---

superset默认提供的图表里有个`Pivot Table`，默认情况下会在行末和列尾增加一个`All`字段计算行或列的和。然而贴心的功能不一定有用，我们希望去到这两行，防止数据意义误读。

最终发现控制`Pivot Table`部分的源码在：

```shell
$SUPERSET_HOME/superset/assets/visualizations/pivot_table.js
```

同学们，怀疑人生吗？打开代码看两眼，你就更加怀疑了。想满足需求吗？代码里的注释已经告诉答案了——`jQuery hack to ...`。
这部分去掉所有`All`字段的思路就是学着源码使用`jQuery hack`的方法：

```javascript
// jQuery hack to set verbose names in headers
const replaceCell = function () {
  const s = $(this)[0].textContent;
  $(this)[0].textContent = slice.datasource.verbose_map[s] || s;
};

slice.container.find('thead tr:first th').each(replaceCell);
```

整个表单数据内容都在`slice`里，使用`jQuery`的选择语法可以获的内容，然后传参到`replaceCell`去一些操作。顺着这个思路，我们修改这部分源码：

```javascript
// jQuery hack to set verbose names in headers
const replaceCell = function () {
  const s = $(this)[0].textContent;
  $(this)[0].textContent = slice.datasource.verbose_map[s] || s;
};
const removeFiledAll = function () {
  let s = $(this)[0].textContent;
  if(s == 'All') {
    $(this)[0].remove();
  }
};
const removeColFiledAll = function () {
  let s = $(this)[0].textContent;
  $(this)[0].remove();
};
const removeFieldRowAll = function () {
  let s = $(this)[0].textContent;
  if(s == 'All') {
    $(this).parent().remove();
  }
};
slice.container.find('thead tr:first th').each(replaceCell);
slice.container.find('thead tr th:first-child').each(replaceCell);
//用于删除最后一列thead里的All
slice.container.find('thead tr :last-child').each(removeFiledAll);
//用于删除最后一行All
slice.container.find('tbody tr th').each(removeFieldRowAll);
//用于删除最列一行All
slice.container.find('tbody tr :last-child').each(removeColFiledAll);
```

It works!
