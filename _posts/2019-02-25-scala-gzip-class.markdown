---
layout:     post
title:      "Scala实现gzip压缩解压类"
subtitle:   "hmmmmmm"
date:       2019-02-25
author:     "diggzhang"
tags:
    - scala
---


在一个项目中，做gzip解压request消息体的部分用到了两个较旧的库，在mvn打包时候会提示将被移除。

```
import sun.misc.BASE64Encoder;
import sun.misc.BASE64Decoder;
```

```shell
sun.misc.BASE64Encoder is internal proprietary API and may be removed in a future release
```

由于项目主体是scala项目，这部分做压缩解压的java代码，我想试着用scala重写：


```scala
import java.io.{ByteArrayInputStream, ByteArrayOutputStream}
import java.util.zip.{GZIPInputStream, GZIPOutputStream}
import scala.collection.mutable.ArrayBuffer

object Gzip {
  def compress(input: Array[Byte]): Array[Byte] = {
    val bos = new ByteArrayOutputStream(input.length)
    val gzip = new GZIPOutputStream(bos)
    gzip.write(input)
    gzip.close()
    val compressed = bos.toByteArray
    bos.close()
    compressed
  }

  def decompress(compressed: Array[Byte]): Array[Byte] = {
    val gzipInputStream = new GZIPInputStream(new ByteArrayInputStream(compressed))
    val output = new ArrayBuffer[Byte]()
    var totalByteCount = 0
    val bytes = new Array[Byte](1024)
    while (gzipInputStream.available() == 1) {
      val byteCount = gzipInputStream.read(bytes)
      if (byteCount > 0) {
        output ++= bytes.take(byteCount)
        totalByteCount += byteCount
      }
    }
    output.take(totalByteCount).toArray
  }
}
```


- [主要参考](https://gist.github.com/owainlewis/1e7d1e68a6818ee4d50e)