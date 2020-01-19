---
layout:     post
title:      "Superset集成第三方图表"
subtitle:   "so hard...or so easy..."
date:       2018-01-15
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: superset
tags:
    - superset
---

从接触`Superset`开始，身边就有很多朋友希望集成第三方图表进去。印象中Superset在未来规划todo里写，希望做成一个在线的图表市场。毕竟应对不同场景，需要有不同的后端数据到前端展示的适配。能否按需定制是主要的矛盾。

需求如此，虽然针对图表的二次开发已经有诸位前辈走在前面，但是还是喜欢用个人思路整理一番。本文追求的是通用，可能两个月后，Superset开发者们又重构了一番项目，但是重读本文，还能有序可循完成开发。

目前Superset后端部分似乎已经足够稳健，更新集中于前端部分，近期每一次commit都似乎在填补前端的问题。把握住**后端只动`viz.py`，前端视图慢慢来**的思路应该可以少走弯路。就算真的遇到原生无法满足需求的大坑，用`iframe`嵌入图表也是相当优雅的做法。

在一切开始之前，感谢老王和矛十八的专栏，国内少有的相关开发资料都是TA们悉心整理而出，所有博文打到开发痛点：

- [Superset，开发者视角](https://zhuanlan.zhihu.com/c_100045590)
- [superset二次开发](https://zhuanlan.zhihu.com/c_151634429)


## 环境统一

Superset几个小版本的更迭却涉及到一些重构的地方，所以为了少走弯路最好还是对照一下我们研究的版本是否一致。如果后续开发遇到问题，可以到github比对一下迅速定位这堆鸡血开发者到底又改了啥。

```shell
 $ ./superset/bin/superset version -v
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
Superset 0.23.0dev
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[DB] : Engine(sqlite:////home/diggzhang/.superset/superset.db)

```

```
git commit: 04680e5ff138f7113a3d655133307049bc91ff3d
```

```
$ python --version
Python 3.6.3
```

```
$ npm -v
5.4.2
$ yarn -v
1.3.2
```

## 数据准备

在一切开始之前我们先统一一下数据源，需要准备一个`user_metric.csv`，假装这是一个统计用户行为的数据库。

```shell
user,action
001,enterHomePage
002,enterHomePage
003,enterHomePage
001,clickVideo
002,clickVideo
001,finishVieo
```

## 引入数据源

打开`Superset`后，顶部导航栏内，`Sources - Upload a CSV`。

在`CSV to Database configuration`页面内设置如下：

1. Table Name  填写 `users_metrics`
2. CSV File 上传准备好的 `user_metric.csv`
3. Database 默认 `main`
4. Delimiter 分隔符默认逗号

其余不挂心，直接在页面底部`Save`。保存后会跳转到`List Tables`页面。

至此准备工作完毕，我们统一了环境和数据源，为正式开发做好了保障。

## 图表选型

待定制的图表决定了后续前后端要开展的工作。这里以[G2的饼图](https://antv.alipay.com/zh-cn/g2/3.x/demo/pie/innerlabel.html)为例讲解，根据官方示例的代码可以看出待展示的数据结构是一个嵌套json对象的数组：

```javascript
  const data = [
    { item: '事例一', count: 40 },
    { item: '事例二', count: 21 },
    { item: '事例三', count: 17 },
    { item: '事例四', count: 13 },
    { item: '事例五', count: 9 }
  ];
```

后面我们依据上述的数据结构去取数适配。

在未来遇到其他图表需要引入的时候，第一步还是先观察待引入图表所需要的数据结构是否方便提供。不同的视图需要不同的数据结构灌入，superset目前的做法是按需定制，没有一个通用的数据结构作为接口。

## 后端定制

针对不同视图，没有统一结构的数据源，所以`Superset`后端的重要功能是负责提供源数据的加工和转换，从读取源数据到最终返回结果都会由`viz.py`打理，是所有视图就的中转站。Superset原生可以渲染哪些视图，都在这个文件里了。如果需要定制的话，首先要在这里开工，图表后端的二次开发的工作说白了就是仿造其它视图的函数写自定义视图的函数。

这里要点亮的技能点是`pandas dataframe`是怎么整理、转换、切割数据的，python的类加载方式等。无需深入，用到现查(抄)应该可以满足需求。

挑最简单的`BigNumberTotalViz`分析，该视图的功能是在前端展示一个大数。

```python
class BigNumberTotalViz(BaseViz):

    """Put emphasis on a single metric with this big number viz"""

    viz_type = 'big_number_total' # 必填，用于区分是哪个视图，需在前端同名对应
    verbose_name = _('Big Number')
    credits = 'a <a href="https://github.com/airbnb/superset">Superset</a> original'
    is_timeseries = False

    # query_obj构建了一个查询用的对象结构体
    def query_obj(self):
        d = super(BigNumberTotalViz, self).query_obj()
        # 从前端传来的from_data中获取`metric`
        metric = self.form_data.get('metric')
        if not metric:
            raise Exception(_('Pick a metric!'))
        d['metrics'] = [self.form_data.get('metric')]
        self.form_data['metric'] = metric
        return d  #query_obj从baseviz同名方法中继承了一堆字段，在这里自己填补了`metric`字段，组合了一个类json结构的消息体，供给到sqla使用，models.py文件里的`get_sqla_query()`方法会读取这个结构体。

    def get_data(self, df):
        # 最终返回的数据由get_data产生
        form_data = self.form_data
        df.sort_values(by=df.columns[0], inplace=True)
        return {
            'data': df.values.tolist(),
            'subheader': form_data.get('subheader', ''),
        }
```

视图函数有两个关键信息点：

1. 继承`BaseViz`
2. 覆写`query_obj` 和 `get_data`

在源数据是`users_metrics.csv`情况下，我在前端创建了一个大数视图，Metric选择了`COUNT(*)`，会在图表里显示一个`6`。

`BaseViz`中的`query_obj()`的作用就是构建一个供给从数据源查询数据的类json结构的对象，**在自定义视图的过程中如果需要构建特定的查询结构体，就继承、覆写这个方法。**

示例中的`get_data()`中最终返回的是`{'data': [[6]], 'subheader': ''}`,被拼接到最终的返回结果`data`当中。后面前端渲染出图，应该也是读到了`data`里的数据。

前端通过header信息可以看到`form_data`请求的消息体：

```javascript
form_data:{"datasource":"13__table","viz_type":"big_number_total","granularity_sqla":null,"time_grain_sqla":"Time Column","since":"7 days ago","until":"now","metric":"count","y_axis_format":".3s","where":"","having":"","filters":[]}
```

相应的response:

```javascript
{"cache_key": "...", "cached_dttm": null, "cache_timeout": 86400, "data": {"data": [[6]], "subheader": ""}, "error": null, "form_data": {"datasource": "13__table", "viz_type": "big_number_total", "granularity_sqla": null, "time_grain_sqla": "Time Column", "since": "7 days ago", "until": "now", "metric": "count", "y_axis_format": ".3s", "where": "", "having": "", "filters": []}, "is_cached": false, "query": "SELECT COUNT(*) AS count\nFROM users_metrics\nORDER BY count DESC\nLIMIT 50000\nOFFSET 0;", "status": "success", "stacktrace": null, "rowcount": 1}
```

`get_data()`负责了取数，那么数据是怎么来的，就需要注意到函数中的`df`了。在继承的`BaseViz`中囊括了大量细节需要去摸索，在构建好查询用的`query_obj`后，传到了`get_df(self, query_obj=None)`函数中，不同的数据源都统一向外提供了接受`query_obj`的`query`函数接口。返回的数据是基于`pandas dateframe`结构返回。在最后返回的时候，对于数据结构的转换和整理都是pandas自身API所提供的。

在自定义视图后端，最终返回的数据都是统一的daraframe数据结构，数据源的数据用pandas提供的API加工整理转换成前端所需要的数据结果。如果pandas最终处理返回的结果不能满足前端图表渲染所需要的数据结构，还需要在前端部分写代码手工再转换一轮。

了解基本的套路后，我们基于选型的g2饼图尝试写一个自己的视图函数，Superset原生自带一个`NVD3`的饼图，直接借来改改：

```python
class g2PieChartViz(BaseViz):

    """ g2 pie chart viz """

    viz_type = 'g2_pie_chart' # 同学们一定要记着这个响亮的名字，就当是视图的身份证了，前后端都认ta做关联。
    verbose_name = _('g2 - Pie Chart')
    is_timeseries = False

    def get_data(self, df):
        # 待返回数据的最初形式是pandas dataframe处理成透视表的样子
        df = df.pivot_table(
            index=self.groupby,
            values=[self.metrics[0]])
        # 余下一系列针对dataframe的转换    
        df.sort_values(by=self.metrics[0], ascending=False, inplace=True)
        df = df.reset_index()
        # 最终定义返回了两列数据
        df.columns = ['item', 'count']
        return df.to_dict(orient='records')
```

`viz.py`内，或者说后端需要做的工作只有这些了。

## 视图引入

在前端部分，我们需要创建相应的图表。各个图表对应的前端文件都在`superset/assets/visualizations`目录下：

```shell
$PATH/$TO/$YOUR/$SUPERSET/incubator-superset/superset/assets/visualizations/
```

比如`big_number`所对应的就是`big_number.js`，这种组建化的文件编配方式非常适合用`react.js`所以也有很多`jsx`文件在同目录下。

这里先解决依赖问题，把g2包装好，在图表引入部分，大部分都图表库本身的：

```shell
# 这里需装两个包是因g2新版本把数据层封装出去了详情参考官方文档
npm install @antv/g2 --save
npm install @antv/data-set --save
```

然后在`visualizations`文件夹下面创建`g2_pie_chart.js`，文件包含的内容其实就是将g2官方饼图示例包裹到了`g2PieChartViz`函数下面，这里有很多g2自身语法，你可能需要去翻阅一下官方文档，需要注意的是渲染数据用的`data`是写死的，还不是后端传来的。

这里需要点亮的技能点就是去花半个小时跑几个g2的官方示例，了解一下大概用法。


```javascript
import G2 from '@antv/g2';
import { View } from '@antv/data-set';

function g2PieChartViz(slice , payload) {
    const div = d3.select(slice.selector);

    var html = '<div id="main"></div>';
    div.html(html);

// 此处开始完全拷贝官方示例代码
// https://antv.alipay.com/zh-cn/g2/3.x/demo/pie/innerlabel.html
    const data = [
        { item: '事例一', count: 40 },
        { item: '事例二', count: 21 },
        { item: '事例三', count: 17 },
        { item: '事例四', count: 13 },
        { item: '事例五', count: 9 }
    ];
    const dv = new View();
    dv.source(data).transform({
        type: 'percent',
        field: 'count',
        dimension: 'item',
        as: 'percent'
    });
    const chart = new G2.Chart({
        container: 'main',
        forceFit: true,
        height: slice.height(),
    });
    chart.source(dv, {
        percent: {
            formatter: val => {
                val = (val * 100) + '%';
                return val;
            }
        }
    });
    chart.coord('theta');
    chart.tooltip({
        showTitle: false,
        itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
    });
    chart.intervalStack()
        .position('percent')
        .color('item')
        .label('percent', {
            offset: -40,
            // autoRotate: false,
            textStyle: {
                rotate: 0,
                textAlign: 'center',
                shadowBlur: 2,
                shadowColor: 'rgba(0, 0, 0, .45)'
            }
        })
        .tooltip('item*percent', (item, percent) => {
            percent = percent * 100 + '%';
            return {
                name: item,
                value: percent
            };
        })
        .style({
            lineWidth: 1,
            stroke: '#fff'
        });
    chart.render();
// 此处结束拷贝官方示例代码

}

module.exports = g2PieChartViz;
```

这里的关键之处就是`function g2PieChartViz(slice , payload) {...}` 从外部传来的`slice`和`payload`。slice是看板的相关信息，主要从中获得视图的宽高。`payload`是就是后端返回的数据。我们通过整理`payload`的消息体，生成渲染所需要的`data`。

我们知道后端的`get_data()`会将计算得出的结果通过`data`返回，其实就是对应到`payload.data`，直接修改源码，将刚刚写死的`data`替换:

```javascript
    const data = payload.data;
```

## 组件注册

现在到了前端最后的步骤，我们要将准备好的`g2_pie_chart`注册到Superset里面。

在`visualizations`文件夹下面，`main.js`负责了注册的注册工作，文件结构分为两个部分：`VIZ_TYPES`和`vizMap`：

- `VIZ_TYPES`，负责声明了视图的名字，这个名字就是前后端所需要对应的`viz_type`。
- `vizMap`，负责对应看是什么视图，对应到哪个前端文件。

我们增改如下：

```javascript
// VIZ_TYPES 内增加一条
  g2_pie_chart: 'g2_pie_chart',

// vizMap 内增加一条
  [VIZ_TYPES.g2_pie_chart]: require('./g2_pie_chart.js'),
```

最后需要在`./assets/javascripts/explore/stores/visTypes.js`文件中添加我们的自定义视图，这个文件的作用是决定了在我们编辑视图的时候，编辑页面左侧的控制栏所显示的内容。我们可以直接照着原生的`pie`抄一个进去，所要修改的是`visTypes`对象，在里面增补我们的`g2_pie_chart`:

```javascript
export const visTypes = {
  g2_pie_chart: {
    label: t('g2 Pie View'),
    showOnExplore: true,
    controlPanelSections: [
        {
          label: t('Query'),
          expanded: true,
          controlSetRows: [
              ['metrics'],
              ['groupby'],
              ['columns'],
          ]
        }
    ]
  },
```

前端代码折腾的部分大概就这些，完成后效仿其它视图补一张于viz_type同名的预览图到`./assets/images/viz_thumbnails/g2_pie_chart.png`。

在`./assets/`下执行`npm run dev`重新编译前端源码，在Superset项目的根目录下重启`superset runserver`，准备惊喜一下。

## 测试

重启Superset后，在`SQL Lab`下测试我们的自定义视图。Database选择成我们统一的`users_metrics`，执行sql：

```sql
--! Database/Schema: main,  Add a table:  users_metrics
SELECT * FROM users_metrics
GROUP by action
```

`Run Query`后将执行结果可视化起来，单击`Visualize`后弹出`Visulize`窗口， 选择自建的`Chart Type`: `g2 Pie View`，完工。
