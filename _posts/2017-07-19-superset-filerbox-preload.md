---
layout:     post
title:      "superset filterbox 预填充"
subtitle:   "superset乱得就像superset"
date:       2017-07-19
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: superset
tags:
     - superset
     - BIG DATA
---

我们在superset中创建了一个Dashboard里放了一个过滤器，希望每次加载页面的时候，过滤器能默认填充几项。做到在superset Dashboard页面首次加载预填充的效果。

在`Edit Sqla Table`页面其实有一个选项叫`Fetch Values Predicate`似乎能满足这种页面加载后预填充的需求，但实在不知道怎么填，也找不到一个例子，`gitter`问了也没人回。好在老子够hack，找到个办法。

观众朋友们，在`$SUPERSET_HOME/superset/assets/visualizations`有一个文件叫`filter_box.jsx`，该文件就是负责过滤器部分的js源码，react写的，选择框部分用的控件叫`react-select`。这些都不重要，重要的是负责过滤`render`的部分是从`83`行开始:

```javascript
<Select.Creatable
  placeholder={`Select [${filter}]`}
  key={filter}
  multi
  value={this.state.selectedValues[filter]}
  ....
/>
```

里面的`value={this.state.selectedValues[filter]} `部分负责了表单内的过滤值，于是我想着增改这部分。

关键源码001部分就是对将要筛选的字段多加一层判断，如果是需要筛选的字段，就将`filter_values`填充成想预选的值，然后`filter_values`传给002部分。当页面初次打开`this.state.selectedValues[filter]`是`undefined`状态，于是`filter_values`神走位补上。在示例中，如果判断是`event_key`这个字段，就给filter_values填充一个`["d   "]`，从而筛选event_key=["d"]的字段预填充好，你需要留意到`["d      "]`后面一堆空格居然是有意义的，如果没有这堆空格`filter_values`不生效了。

关键源码：

```javascript
// 001.
var filter_values = undefined;
if (filter == "event_key") {
    filter_values = ["d                                                                       "]
}
// 002.
value={this.state.selectedValues[filter] || filter_values}
```

全部代码：

```javascript
const filters = Object.keys(this.props.filtersChoices).map((filter) => {
  const data = this.props.filtersChoices[filter];
  const maxes = {};
  maxes[filter] = d3.max(data, function (d) {
    return d.metric;
  });

  // 001
  var filter_values = undefined;
  if (filter == "event_key") {
      filter_values = ["d                                                                       "]
  }

  return (
    <div key={filter} className="m-b-5">
      {this.props.datasource.verbose_map[filter] || filter}
      <Select.Creatable
        placeholder={`Select [${filter}]`}
        key={filter}
        multi
        // 002
        value={this.state.selectedValues[filter] || filter_values}
        options={data.map((opt) => {
          const perc = Math.round((opt.metric / maxes[opt.filter]) * 100);
          const backgroundImage = (
            'linear-gradient(to right, lightgrey, ' +
            `lightgrey ${perc}%, rgba(0,0,0,0) ${perc}%`
          );
          const style = {
            backgroundImage,
            padding: '2px 5px',
          };
          return { value: opt.id, label: opt.id, style };
        })}
        onChange={this.changeFilter.bind(this, filter)}
      />
    </div>
  );

```
