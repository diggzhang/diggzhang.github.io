---
layout:     post
title:      "superset初窥viz.py"
subtitle:   "so hard...or so easy..."
date:       2017-08-02
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: superset
tags:
    - superset
---

**这是一篇摸索superset的文章，不能作为任何精准调研的依据。**

根据目前研究，在superset中任何视图(`Slice`)的数据都是由`viz.py`在后端处理返回，而所有的视图类都是基于里面`BaseViz`类构建。所以弄懂`BaseViz`到底干了什么可以知道后端具体做了哪些处理并是如何返回数据到前端的。粗略预览一下`BaseViz`类的基本结构，并对比继承其的负责具体视图的子类，可以看出视图方法都是基于`BaseViz`的补充般的存在。

本文中希望借`BaseViz`和`TableViz`，依照调用顺序为路径，分析类里面具体的方法，从而理解`viz.py`中的整个调用过程。**从继承结构可以看出视图不仅继承于`BaseViz`，且会在必要情况下重写父类的一些方法。** 如图：

<img src={{site.baseurl}}"/img/in-post/superset_stuff/baseVizDigram.png" alt="BaseVizStructImg">

## 0. 前菜

1. Python中的类默认从`object`作为继承的开始
2. `__init__`会承载一些公共定义，如果在类中定义`__init__`就表名如果调用该类，就必须传入与之相匹配的参数
3. __init__ 方法的第一个参数永远都是`self`，表示创建实例本身，在__init__方法内部，可以把各种属性绑定到self，因为self指向创建的实例本身
4. __init__ 里指定了啥就传啥，`BaseViz`中是这么定义的： `def __init__(self, datasource, form_data):` 说明必须传`datasource 和 form_data`
5. 子类的的方法如果和父类的方法重名，子类会覆盖掉父类。所以`TableViz`里重写的`query_obj/get_data/json_dumps`三个方法会覆盖`BaseViz`里的三个同名方法
6. `@property`是Python中的黑魔法，廖雪峰黑魔导师已经[讲明白](https://www.liaoxuefeng.com/wiki/0014316089557264a6b348958f449949df42a6d3a2e542c000/0014318435599930270c0381a3b44db991cd6d858064ac0000)了。

## 1. 四个量 `viz_type/verbose_name/credits/is_timeseries`

这里可以认为这四个量是视图的身份标识。

```python
class BaseViz(object): # 廖老师： 通常，如果没有合适的继承类，就使用object类，这是所有类最终都会继承下来的类。

    """All visualizations derive this base class""" # 所有视图都继承于此

    viz_type = None # 从这里可以看出`viz.py`文件内所有视图都会定义一个`viz_type`就好像是给视图起的名字
    verbose_name = "Base Viz" # 视图名字的全称/详细一些，上面的`viz_type`是简称
    credits = "" # 添加视图的源链接
    is_timeseries = False # 字面意思理解:如果是强制时序的就会标记为`is_timeseries = True`
    .......

# TableViz

class TableViz(BaseViz):

    """A basic html table that is sortable and searchable"""

    viz_type = "table"
    verbose_name = _("Table View")
    credits = 'a <a href="https://github.com/airbnb/superset">Superset</a> original'
    is_timeseries = False
    ......
```

## 2. `__init__`

在`BaseViz`类的`__init__`方法中主要的工作应该是从传来的`form_data`中摘取一些信息供给后面使用。

我在Superset中新建了一个看板放了一个`Table`类型的Slice，数据源是`birth_france_by_region`，然后随性设置了一下表内容以`DEPT_ID`和`sum__2004`为表内容。样式大概长这样：

| DEPT_ID | sum__2004 |
| :--: | :--: |
| FR-59      | 36.3k |
| FR-75      | 31.8k |
| .....      | ....k |

这里知道数据源和内容样式就好，方便后面理解代码为了生产这样的数据，到底接收什么，经历了什么，到了各个方法又返回了什么，最终成为了这样的一张表格数据。


```python
def __init__(self, datasource, form_data):
    if not datasource: # 初始化时候判断是否传入`datasource`
        raise Exception("Viz is missing a datasource")
    self.datasource = datasource # 案例中datasource传入了创建slice时候选择的数据源
    self.request = request # 这里看出url+请求内容，form_data似乎就是从request里取出来的 <Request 'http://localhost:8081/superset/explore_json/table/6/?form_data={"datasou......extra_filters"%3A[]}' [GET]>
    self.viz_type = form_data.get("viz_type") # 从form_data中摘取了`viz_type`
    self.form_data = form_data #把整个`form_data`放到`self`中

    self.query = ""
    self.token = self.form_data.get(
        'token', 'token_' + uuid.uuid4().hex[:8]) #如果form_data中没有token就造一个

    # 查询数据啥就取决于这里    
    self.metrics = self.form_data.get('metrics') or [] # 取出待查数据字段 metrics指标
    self.groupby = self.form_data.get('groupby') or [] # 取出针对metrics的分组字段

    self.status = None
    self.error_message = None
```

这里`form_data`完全是从前端传来的，可以看出对请求数据的要求，`viz_type`，时间范围等信息：

```javascript
// form_data内容
{
    "datasource": "6__table",
    "viz_type": "table",
    "slice_id": 37,
    "granularity_sqla": "date",
    "time_grain_sqla": null,
    "since": "7 days ago",
    "until": "now",
    "groupby": [
        "DEPT_ID"
    ],
    "metrics": [
        "sum__2004"
    ],
    "include_time": false,
    "all_columns": [ ],
    "order_by_cols": [ ],
    "table_timestamp_format": "%Y-%m-%d %H:%M:%S",
    "row_limit": null,
    "page_length": 0,
    "include_search": false,
    "table_filter": false,
    "where": "",
    "having": "",
    "filters": [ ],
    "extra_filters": [ ]
}
```

## 3. `@property cache_timeout+cache_key`

我在`BaseViz`父子类的方法中return前都打印了log，日志输出的第二部分似乎和`cache`有关。在`cache_key`和`cache_timeout`中，先从`form_data`中取出所有key可能用作缓存查询，然后取出查询的超时时间。基本可以判断，这里想做的事情都跟缓存有关。

```python
    @property
    def cache_timeout(self):
        if self.form_data.get('cache_timeout'):
            return int(self.form_data.get('cache_timeout'))

        if self.datasource.cache_timeout:
            return self.datasource.cache_timeout

        if (hasattr(self.datasource, 'database') and
                self.datasource.database.cache_timeout):
            return self.datasource.database.cache_timeout
        return config.get("CACHE_DEFAULT_TIMEOUT")

    @property
    def cache_key(self):
        s = str([(k, self.form_data[k]) for k in sorted(self.form_data.keys())])
        return hashlib.md5(s.encode('utf-8')).hexdigest()

# pretty print
# s = str(
#   [
#     (k, self.form_data[k]) for k in sorted(self.form_data.keys())
#   ]
# )
```

## 4. `get_extra_filters`

调用过程经过缓存相关方法后，进入到`get_extra_filters`方法。其实触发这里是因为后面的`query_obj`方法，作用是取出在前端用`Filter Box`做数据筛选交互的时候产生的查询，当我们在前端操作筛选框，会看到实时的数据视图刷新，整个交互过程中，筛选的行为也是通过`form_data`传递，到后端从这里解析出来：

```python
def get_extra_filters(self):
    extra_filters = self.form_data.get('extra_filters', [])
    return {f['col']: f['val'] for f in extra_filters}
```

## 5. `query_obj`

敲黑板，重点方法就这个。在`query_obj`中构建了一个查询对象，数据要查啥，要怎么查，从这里生成。

```python
def query_obj(self):
    """Building a query object"""
    form_data = self.form_data
    groupby = form_data.get("groupby") or []
    metrics = form_data.get("metrics") or []

    # extra_filters are temporary/contextual filters that are external
    # to the slice definition. We use those for dynamic interactive
    # filters like the ones emitted by the "Filter Box" visualization
    # 在这里去接收由前端`filter box`传来的值，动态返回查询数据的粒度、范围、时序控制、行限
    extra_filters = self.get_extra_filters()
    granularity = (
        form_data.get("granularity") or form_data.get("granularity_sqla")
    )
    limit = int(form_data.get("limit") or 0)
    timeseries_limit_metric = form_data.get("timeseries_limit_metric")
    row_limit = int(
        form_data.get("row_limit") or config.get("ROW_LIMIT"))

    # __form and __to are special extra_filters that target time
    # boundaries. The rest of extra_filters are simple
    # [column_name in list_of_values]. `__` prefix is there to avoid
    # potential conflicts with column that would be named `from` or `to`
    # since这个值返回的时候长这个样子 u'since': u'28 days ago',
    # 这部分几行代码都是对数据的时间范围的判断和处理
    since = (
        extra_filters.get('__from') or
        form_data.get("since") or
        config.get("SUPERSET_DEFAULT_SINCE", "1 year ago")
    )

    # from_datetime
    from_dttm = utils.parse_human_datetime(since)
    now = datetime.now()
    if from_dttm > now:
        from_dttm = now - (from_dttm - now)

    # 判断给的查询时间范围是不是不合理
    until = extra_filters.get('__to') or form_data.get("until", "now")
    to_dttm = utils.parse_human_datetime(until)
    if from_dttm > to_dttm:
        raise Exception("From date cannot be larger than to date")

    # extras are used to query elements specific to a datasource type
    # for instance the extra where clause that applies only to Tables
    # extras里面组织了具体的查询
    extras = {
        'where': form_data.get("where", ''),
        'having': form_data.get("having", ''),
        'having_druid': form_data.get('having_filters') \
            if 'having_filters' in form_data else [],
        'time_grain_sqla': form_data.get("time_grain_sqla", ''),
        'druid_time_origin': form_data.get("druid_time_origin", ''),
    }
    filters = form_data['filters'] if 'filters' in form_data \
            else []
    for col, vals in self.get_extra_filters().items():
        if not (col and vals) or col.startswith('__'):
            continue
        elif col in self.datasource.filterable_column_names:
            # Quote values with comma to avoid conflict
            filters += [{
                'col': col,
                'op': 'in',
                'val': vals,
            }]
    # 最终将所有整理好的信息组合成`d (dict)`返回
    # 这些信息都还是从`form_data`解析出来的
    # d是数据的查询条件
    d = {
        'granularity': granularity,
        'from_dttm': from_dttm,
        'to_dttm': to_dttm,
        'is_timeseries': self.is_timeseries,
        'groupby': groupby,
        'metrics': metrics,
        'row_limit': row_limit,
        'filter': filters,
        'timeseries_limit': limit,
        'extras': extras,
        'timeseries_limit_metric': timeseries_limit_metric,
        'form_data': form_data,
    }
    return d
```

依照实例最终返回的查询对象`d`的内容：

```javascript
{
    'to_dttm': datetime.datetime(2017, 8, 3, 18, 6, 15),
    'row_limit': 50000,
    'metrics': [
        'sum__2004'
    ],
    'granularity': 'date',
    'timeseries_limit': 0,
    'timeseries_limit_metric': None,
    'is_timeseries': False,
    'filter': [],
    'extras': {
        'druid_time_origin': '',
        'time_grain_sqla': None,
        'having_druid': [],
        'where': '',
        'having': ''
    },
    'form_data': {
      // 这里有整条form_data的内容
      ......
    },
    'groupby': [
        'DEPT_ID'
    ],
    'from_dttm': datetime.datetime(2017, 7, 27, 18, 6, 15)
}
```

## 6. `TableViz::query_obj`

解读`BaseViz`的`query_obj`后，紧接着看在`TableViz`中重写的`query_obj`，我原来以为子类会覆盖掉父类中的同名方法，但是在该方法一开始用到了`super()`，所以魔幻故事发生了，这里的同名方法其实是对父类的调用，不是覆盖。

`super(TableViz, self).query_obj()`代表直接调用父类中的`query_obj()`，在父类返回`d`的基础上，对`d`做二次修改:

```python
def query_obj(self):
    d = super(TableViz, self).query_obj()
    fd = self.form_data

    if fd.get('all_columns') and (fd.get('groupby') or fd.get('metrics')):
        raise Exception(
            "Choose either fields to [Group By] and [Metrics] or "
            "[Columns], not both")

    if fd.get('all_columns'):
        d['columns'] = fd.get('all_columns')
        d['groupby'] = []
        order_by_cols = fd.get('order_by_cols') or []
        d['orderby'] = [json.loads(t) for t in order_by_cols]

    d['is_timeseries'] = self.should_be_timeseries()
    return d
```

在下面的`get_df`阶段，整个查询对象会被翻译成一段SQL：

```sql
SELECT "DEPT_ID" AS "DEPT_ID",
       SUM(birth_france_by_region."2004") AS sum__2004
FROM birth_france_by_region
WHERE date >= '2017-07-14 16:08:59.000000'
  AND date <= '2017-08-11 16:08:59.000000'
GROUP BY "DEPT_ID"
ORDER BY sum__2004 DESC
LIMIT 50000
OFFSET 0
```

## 7. `get_df`

敲黑板，重点。

顺藤摸瓜，查询对象构建好了，`get_df`将会依据`query_obj`最后的`d`去返回数据。`get_df`在这里的意思是`get_dataframe`，superset对数据的处理是用pandas的dataframe，示例中从该方法中返回的形式是pandas dataframe样子：

```shell
DEPT_ID __timestamp  sum__2004
0    FR-59  2017-07-31      36257
1    FR-75  2017-07-31      31817
2    FR-93  2017-07-31      26313
3    FR-92  2017-07-31      24649
4    FR-13  2017-07-31      24056
5    FR-69  2017-07-31      23796
6    FR-94  2017-07-31      19866
7    FR-78  2017-07-31      19431
8    FR-62  2017-07-31      19304
9    FR-95  2017-07-31      17863
......
```

看代码：

```python
def get_df(self, query_obj=None):
    """Returns a pandas dataframe based on the query object"""
    # 首先就拿`query_obj`内容
    if not query_obj:
        query_obj = self.query_obj()

    self.error_msg = ""
    self.results = None

    timestamp_format = None
    if self.datasource.type == 'table':
        dttm_col = self.datasource.get_col(query_obj['granularity'])
        if dttm_col:
            timestamp_format = dttm_col.python_date_format

    # The datasource here can be different backend but the interface is common
    # 查询sql在此处的`self.datasource.query`方法中生成,这个query方法返回的QueryResult结构如下：
    # return QueryResult(
    #   status=status, #查询成功还是失败的状态
    #   df=df, #dataframe
    #   duration=datetime.now() - qry_start_dttm, #查询时间
    #   query=sql, #查询的sql
    #   error_message=error_message
    # )
    self.results = self.datasource.query(query_obj)
    self.query = self.results.query
    self.status = self.results.status
    self.error_message = self.results.error_message

    df = self.results.df
    # Transform the timestamp we received from database to pandas supported datetime format.
    # If no python_date_format is specified, the pattern will be considered as the default ISO date format
    # If the datetime format is unix, the parse will use the corresponding parsing logic.
    # 最后如果前端指定了时间格式的话，对返回数据的时间做处理
    if df is None or df.empty:
        self.status = utils.QueryStatus.FAILED
        if not self.error_message:
            self.error_message = "No data."
        return pd.DataFrame()
    else:
        if DTTM_ALIAS in df.columns:
            if timestamp_format in ("epoch_s", "epoch_ms"):
                df[DTTM_ALIAS] = pd.to_datetime(df[DTTM_ALIAS], utc=False)
            else:
                df[DTTM_ALIAS] = pd.to_datetime(
                    df[DTTM_ALIAS], utc=False, format=timestamp_format)
            if self.datasource.offset:
                df[DTTM_ALIAS] += timedelta(hours=self.datasource.offset)
        df.replace([np.inf, -np.inf], np.nan)
        df = df.fillna(0)
    return df
```

## 8. `TableViz::get_data`

在`TableViz`的`get_data`方法中，将已经获得的`dataframe`组合成了`dict`形式，这一步就将dataframe样式的数据组装成了类似于JSON结构的数据了：

```python
def get_data(self, df):
    if not self.should_be_timeseries() and DTTM_ALIAS in df:
        del df[DTTM_ALIAS]

    return dict(
        records=df.to_dict(orient="records"),
        columns=list(df.columns),
    )
```

## 9. `get_payload`

在数据查询交互的过程中，都会经由`get_payload`优先从缓存查询，所有查询的数据也将通过`get_payload`组织成特定的结构入缓存。最终`payload`将会是返回到前端的结果。

```python
def get_payload(self, force=False):
    """Handles caching around the json payload retrieval"""
    # 优先从缓存中做查询
    cache_key = self.cache_key
    payload = None
    force = force if force else self.form_data.get('force') == 'true'
    if not force and cache:
        payload = cache.get(cache_key)

    if payload:
        stats_logger.incr('loaded_from_source')
        is_cached = True
        try:
            cached_data = zlib.decompress(payload)
            if PY3:
                cached_data = cached_data.decode('utf-8')
            payload = json.loads(cached_data)
        except Exception as e:
            logging.error("Error reading cache: " +
                          utils.error_msg_from_exception(e))
            payload = None
        logging.info("Serving from cache")

    if not payload:
        stats_logger.incr('loaded_from_cache')
        data = None
        is_cached = False
        cache_timeout = self.cache_timeout
        stacktrace = None
        try:
            df = self.get_df()
            if not self.error_message:
                data = self.get_data(df)
        except Exception as e:
            logging.exception(e)
            if not self.error_message:
                self.error_message = str(e)
            self.status = utils.QueryStatus.FAILED
            data = None
            stacktrace = traceback.format_exc()
        payload = {
            'cache_key': cache_key,
            'cache_timeout': cache_timeout,
            'data': data,
            'error': self.error_message,
            'form_data': self.form_data,
            'query': self.query,
            'status': self.status,
            'stacktrace': stacktrace,
        }
        payload['cached_dttm'] = datetime.utcnow().isoformat().split('.')[0]
        logging.info("Caching for the next {} seconds".format(
            cache_timeout))
        data = self.json_dumps(payload)
        if PY3:
            data = bytes(data, 'utf-8')
        if cache and self.status != utils.QueryStatus.FAILED:
            try:
                cache.set(
                    cache_key,
                    zlib.compress(data),
                    timeout=cache_timeout)
            except Exception as e:
                # cache.set call can fail if the backend is down or if
                # the key is too large or whatever other reasons
                logging.warning("Could not cache key {}".format(cache_key))
                logging.exception(e)
                cache.delete(cache_key)
    payload['is_cached'] = is_cached
    return payload
```
