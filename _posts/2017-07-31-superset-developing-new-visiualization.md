---
layout:     post
title:      "superset开发自定义视图"
subtitle:   "so hard...or so easy..."
date:       2017-07-31
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: superset
tags:
    - superset
---

## 问题

superset部署好后，我们希望增加一个自定义的视图进去，很明显找不到一个教程去讲这块，官方提供了一个`example issue`:

> Q: How do I go about developing a new visualization type?

> A: Here’s an example as a Github PR with comments that describe what the different sections of the code do: https://github.com/airbnb/superset/pull/3013

该PR最终实现是`New chart type : Chord Diagrams`，一共修改了8个文件，且每个修改都有针对开发者的commented，只能死扣着这个PR了。八个文件分别是：

1. superset/assets/images/viz_thumbnails/chord.png
2. superset/assets/javascripts/explore/stores/controls.jsx
3. superset/assets/javascripts/explore/stores/visTypes.js
4. superset/assets/package.json
5. superset/assets/visualizations/chord.css
6. superset/assets/visualizations/chord.jsx
7. superset/assets/visualizations/main.js
8. superset/viz.py

从目录上区分`8号`文件肯定是后端handle视图的类，其余7个文件均为前端修改部分。前端部分可以刨去`chord.png`和`package.json`，一个缩略图，然后另一个是添加了`react-alert`依赖。排除干扰因素以后，前端需要研究的是两个部分：

1. `superset/assets/javascripts/explore/stores/*` 2个文件
2. `superset/assets/visualizations/*` 3个文件

## 原example issue解读

### controls.jsx

`superset/assets/javascripts/explore/stores/controls.jsx`

> This file (`controls.jsx`) holds configuration for a "pool" of controls that can be used across visualizations. When creating a new visualization, you'll want to reuse controls that already exist. If the exact control that you need doesn't exist already, you'll want to create it here.

> **Note** that type references controls React components defined in `javascripts/explore/component/controls/`.

> Also note that controls can be dynamic with `mapStateToProps`, allowing to map anything from the app's state into a prop for the component. This allows in this case to get configuration elements proper to the datasource in this case, but can also be used to change a control based on another control's value.


阅读该comment可以获取的信息是：

- `controls.jsx`负责配置一堆针对视图的`controls`
- 牵扯到React知识

### visTypes.js

`superset/assets/javascripts/explore/stores/visTypes.js`

> This file contains configuration of the new chord viz type. It defines the panels of controls that should render on the left panel of the explore view.

> `controlSetRows` references controls defined in controls.jsx, and can have one or two items and that defines how many items will render on that row.

> `controlOverrides` allows you to override the control configuration coming from `controls.jsx`. By reusing the same control across visualizations we allow continuity in the sense that the values are carried over when going from a viz type to the next. For instance as you go from one viz type to the next, it's nice to have metrics carried over, though you might want a slightly different label or tooltip in the different contexts, this is what the overrides are for.

阅读该comment可以获取的信息是：

- 该文件定义了控制面板应该如何渲染view
- `controlSetRows`跟刚刚的`controls.jsx`关联，可以看出到底有哪些行要渲染
- `controlOverrides`用来覆盖`controls.jsx`传来的参数


### chord.jsx

`superset/assets/visualizations/chord.jsx/css`

> This function is the heart of this new visualization, the framework will pass it a `slice` and `json` object, and expects you to mutate the dom element referenced in the slice object. It will be called whenever the slice needs to be rendered or re-rendered. Knowing that this function may be called many times, you can use closures here if you want to persists certain things in the module namespace.

> The json objects corresponds to the data returned from running your query and related context. To see exactly what you should expect in here you can click the json button in the explore view.

> The slice object contains, amongst other things, a reference to the dom element that you should mutate.

> `json.data` corresponds exactly to what is returned in the backend `ChordViz.get_data` lower in this PR

> On of the things that the slice object exposes isf the information provided by the user controls. The keys of this `slice.formData` object are the control's "id" defined in `controls.jsx` and their values are the ones provided by the user.

> The slice object exposes `width()` and `height()` methods that can be useful while rendering your chart.

> that function should be exported as the default export for the visualization module

阅读该comment可以获取的信息是：

- 敲黑板，核心文件就这个。
- slice这个概念就是我们创建出的新视图呈现在看板上的地方
- superset框架会传 `slice` 和 `json`两个参数到这里来，关联到要渲染的dom
- 在`slice`加载和重载的时候都是调用这里
- `json.data`负责接收了后端来的数据`ChordViz.get_data`
- `slice.formData`对应着`controls.jsx`里的id
- 该`slice`在重渲染的时候预读了一个宽搞值


### main.js

`superset/assets/visualizations/main.js`

> simply adding the mapping from the chord visualization type to the appropriate javascript modules. It's possible here to have multiple visualization types target the same module (look at nvd3.js!)

阅读该comment可以获取的信息是：

- 在`main.js`里注册刚刚创建的新视图

### viz.py

`superset/viz.py`

> This is the backend part of this component, you can derive `BaseViz` or other `BaseViz derivatives`

> You need to override `query_obj` and it has to return a query object, which is essentially a Python dict with key/values that are expected by the query method of the connectors. Until this is better documented, you can look at the connector's Datasource query method to get a sense for it.

> `get_data` receives a pandas dataframe (df) that correspond to what is returned when applying your query object defined above. The shape of that dataframe is related to what you ask for in that query_obj.

> Now whatever get_data returns needs to be json-serializable, and will be made available to the javascript visualization function as payload.data.

阅读该comment可以获取的信息是：

- 默认读懂viz.py基本可以搞清楚从后端返回了什么数据，前端逻辑再多也是针对返回的源数据做处理
- 所有视图的基类都是`BaseViz`
- 自建的视图处理函数会重写`query_obj`并返回一个object对象
- `get_data`会接收一个pandas的`dataframe`数据格式，至于`dataframe`到底哪些数据内容取决于`query_obj`
- 最终由`get_data`返回的对象在前端做json序列化操作后使用


## 阅读example issue可以习得(猜想)什么

### 0. `superset/assets/images/viz_thumbnails/`

在`viz_thumbnails`里提供待创建视图的预览图。未来如果自定义了视图，前端提供的预览是从这里取图。

### 1. `superset/assets/javascripts/explore/stores/`

这里面牵扯到的两个文件`visTypes.js`和`controls.js`，未来如果自定义视图会应用到一些公共配置，这些配置可能是由`controls.js`提供，该文件提供的配置都是跨视图通用的。而`vizTypes.js`承接了精细到视图级别的配置，打开该文件一共有三部分`sectionsToRender/sections/vizTypes`，重点在`vizTypes`中，已有的视图都在这里注册，如果希望新加视图，也从这里添加配置。

### 2. `superset/assets/visualizations/`

自定义视图的核心部分，从这里创建视图的js或jsx文件，打开文件夹看到的都是视图的具体实现，我们看到的最终渲染效果都是从这里出来的。如果希望做`superset`的二次开发，说白了也就是在这里多加一些自定义的视图文件，这里牵扯到的技术栈主要是以`react/d3/jQuery`三个块为主。这里我姑且先这么理解：新加一个视图，说白也就是这里新引入一个`d3`的视图，然后用`react`做封装方便数据交互，再用`jQuery`修修补补。

在创建了自定义的视图后，最终需要在该目录下的`main.js`注册到`vizMap`参数中，形式是`key: require('自定义视图.js')`，这里的`key`将对应到后端类中的`viz_type`：

```javascript
/* eslint-disable global-require */
const vizMap = {
  area: require('./nvd3_vis.js'),
  bar: require('./nvd3_vis.js'),
  ......
};
export default vizMap;
```

### 3. `superset/viz.py`

最后，无论自定义了怎样的视图，都需要后端提供已经格式化的数据，数据的返回取决于`get_data()`函数，而返回格式取决于前端数据视图渲染所需的格式。所有的自定义视图类，都是基于`BaseViz`，必须定制的部分是：

```python
    viz_type = "" #用于指明是哪种视图
    query_obj     #用于查询数据
    get_data      #用于返回数据
```

## CODE

搞起来。直接复制粘贴一个`pivot table`测试是否能验证猜想。虽然是照抄，但也算是开发自定义视图了，变的地方就是给重起个名字叫`privot table plus`。

### 0. 创建预览图

直接cp一个

```shell  
$ cd $SUPERSET_HOME/superset/assets/images/viz_thumbnails
$ cp pivot_table.png pivot_table_plus.png
```

### 1. 添加视图配置

```shell
$ cd $SUPERSET_HOME/superset/assets/javascripts/explore/stores/
$ # 在这里对控制整体的`controls.js`没需求，只在`visTypes.js`里面添加我们自己的视图配置
$ vim visTypes.js
```

找到`pivot_table`部分的代码，照抄并改名：

```javascript
pivot_table: {
  label: 'Pivot Table',
  controlPanelSections: [
    {
      label: null,
      controlSetRows: [
        ['groupby', 'columns'],
        ['metrics', 'pandas_aggfunc'],
        ['number_format'],
      ],
    },
  ],
},

pivot_table_plus: {
  label: 'Pivot Table Plus',
  controlPanelSections: [
    {
      label: null,
      controlSetRows: [
        ['groupby', 'columns'],
        ['metrics', 'pandas_aggfunc'],
        ['number_format'],
      ],
    },
  ],
},
```

### 2. 增加自定义的视图文件

直接cp一个并改名字，就当你自己写的了：

```shell
$ cd $SUPERSET_HOME/superset/assets/visualizations
$ cp pivot_table.js pivot_table_plus.js  
```

然后将你“写”好的`pivot_table_plus.js`注册到`main.js`中：

```shell
$ cd $SUPERSET_HOME/superset/assets/visualizations
$ vim main.js
```

找到原来的`pivot_table`再照抄一下，修改如下：

```javascript
pivot_table: require('./pivot_table.js'),
pivot_table_plus: require('./pivot_table_plus.js'),
```

前端部分我们至此完工，创建一个自定义视图叫`pivot_table_plus`，接下来就是写对应的后端部分。

### 3. 后端`viz.py`

```shell
$ vim $SUPERSET_HOME/superset/viz.py
```

找到`class PivotTableViz(BaseViz)`把整个类都照抄一下：

```python
class PivotTableVizPlus(BaseViz):

    viz_type = "pivot_table_plus" # 这里对应到前端的main.js
    verbose_name = _("Pivot Table Plus")
    credits = 'a <a href="https://github.com/airbnb/superset">Superset</a> original'
    is_timeseries = False

    def query_obj(self):
        .......

    def get_data(self, df):
        .......
```

创建好自定义类后，还需到`viz.py`最底部的`viz_types_list`中将自定义类注册进去:

```python
viz_types_list = [
    TableViz,
    PivotTableViz,
    PivotTableVizPlus,
    ......
```

至此大工告成，如果没问题，就可以在`superset`中看到这个所谓的自定义开发的视图了。
