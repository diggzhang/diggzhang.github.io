---
layout:     post
title:      "一篇文章搞懂Python中的面向对象编程"
subtitle:   "对象 类 继承 主要跟着廖老师走"
date:       2016-11-18
author:     "diggzhang"
header-img: "img/post-bg-unix-linux.jpg"
category: 高级Python编程基础
tags:
     - python
     - 编程理论
---

面向对象的设计思想是从自然界中来的，因为在自然界中，类（Class）和实例（Instance）的概念是很自然的。Class是一种抽象概念，比如我们定义的Class——Student，是指学生这个概念，而实例（Instance）则是一个个具体的Student，比如，Bart Simpson和Lisa Simpson是两个具体的Student。

面向对象的抽象程度又比函数要高，因为一个Class既包含数据，又包含操作数据的方法。

数据封装、继承和多态是面向对象的三大特点，我们后面会详细讲解。

**以上看不懂前，都是废话。**

### 类和实例

类(`Class`)和实例(`Instance`)是面向对象最重要的概念。

类是指抽象出的模板。实例则是根据类创建出来的具体的“对象”，每个对象都拥有从类中继承的相同的方法，但各自的数据可能不同。

在python中定义一个类:

```python
class Student(object):
    pass
```

关键字`class`后面跟着类名，类名通常是大写字母开头的单词，紧接着是`(object)`，表示该类是从哪个类继承下来的。通常，如果没有合适的继承类，就使用`object`类，这是所有类最终都会继承下来的类。

定义好了 **类**，就可以根据`Student`类创建实例：

```python
>>> class Student(object):
...     pass
...
>>> bart = Student() # bart是Student()的实例
>>> bart
<__main__.Student object at 0x101be77f0>
>>> Student # Student 本身是一个类
<class '__main__.Student'>
```

可以自由地给一个实例变量绑定属性，比如，给实例bart绑定一个name属性：

```python
>>> bart.name = "diggzhang"
>>> bart.name
'diggzhang'
```

类同时也可以起到模板的作用，我们可以在创建一个类的时候，把一些认为公共的东西写进类定义中去，在python中通过一个特殊的`__init__`方法实现：

```python
class Student(object):
    """__init__ sample."""
    def __init__(self, name, score):
        self.name = name
        self.score = score
```

`__init__`方法的第一个参数永远都是`self`，表示创建实例本身，在`__init__`方法内部，可以把各种属性绑定到`self`，因为`self`指向创建的实例本身。

有了`__init__`方法，在创建实例的时候，就不能传入空的参数了，必须传入与`__init__`方法匹配的参数，但`self`不需要传，Python解释器自己会把实例变量传进去。如下面的类，在新建实例的时候，需要把`name`和`score`属性捆绑上去：

```python
class Student(object):
    """example for __init__ function passin args."""
    def __init__(self, name, score):
        self.name = name
        self.score = score
```

我们直接看个实例，如果我们老老实实传name和score进去的时候，成功声明了这个实例，但是只传一个值的时候，报错：

```python
In [1]: class Student(object):
   ...:     def __init__(self, name, score):
   ...:         self.name = name
   ...:         self.score = score
   ...:

In [2]: bart = Student('diggzhang', 99)

In [3]: bart.name
Out[3]: 'diggzhang'

In [4]: bart.score
Out[4]: 99

In [5]: bart_test = Student('max')
---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-6-97f4e2f67951> in <module>()
----> 1 bart_test = Student('max')

TypeError: __init__() takes exactly 3 arguments (2 given)
```

和普通函数相比，在类中定义的函数只有一点不同，就是第一个参数永远是实例变量`self`，并且，调用时，不用传递该参数。除此之外，类的方法和普通函数没有什么区别。

面向对象编程的一个重要特点就是数据封装。在上面的`Student`类中，每个实例就拥有各自的`name`和`score`这些数据。我们可以通过函数来访问这些数据，比如打印一个学生的成绩：

```python
def print_socre(std):
    print("%s: %s" % (std.name, std.score))

print_socre(bart)

# 实际执行效果
In [7]: def print_socre(std):
   ...:         print("%s: %s" % (std.name, std.score))
   ...:

In [8]: print_socre(bart)
diggzhang: 99
```

既然我们创建的实例里有自身的数据，如果想访问这些数据，就没必要从外面的函数去访问，可以在`Student`类内部去定义这样一个访问数据的函数，这样就把“数据”给封装起来了。这些封装数据的函数和`Student`类本身关联起来的，我们称之为类的方法：

```python
class Student(object):
    def __init__(self, name, score):
        self.name = name
        self.score = score
    def print_socre(self):
        print("%s: %s" % (self.name, self.score))
```

要定义一个类的方法，除了传入的第一个参数是`self`外，其它和普通函数一样。如果想调用这个方法，直接在实例变量上调用，除了`self`不用传递，其余参数正常传入:

```python
>>> bart.print_score()
Bart Simpson: 59
```

实际代码，需要在Python3环境中测试，Python2.7会报错(`NameError: global name 'name' is not defined`)

```python
$ python3
Python 3.5.1 (v3.5.1:37a07cee5969, Dec  5 2015, 21:12:44)
[GCC 4.2.1 (Apple Inc. build 5666) (dot 3)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> class Student(object):
...     def __init__(self, name, score):
...         self.name = name
...         self.score = score
...     def print_score(self):
...         print("%s: %s" % (self.name, self.score))
...
>>> bart = Student('zhang', 99)
>>> bart.print_score()
zhang: 99
>>>
```

数据和逻辑都被封装起来，直接调用方法即可，但却可以不用知道内部的细节。

总结一下。

**类** 是创建实例的模板，而 **实例** 则是一个一个具体的对象，各个实例拥有的数据都互相独立，互不影响；

**方法** 就是与实例绑定的函数，和普通函数不同，方法可以直接访问实例的数据；

通过在实例上调用方法，我们就直接操作了对象内部的数据，但无需知道方法内部的实现细节。

和静态语言不同，Python允许对实例变量绑定任何数据，也就是说，对于两个实例变量，虽然它们都是同一个类的不同实例，但拥有的变量名称都可能不同：

```python
# 用相同类创建了两个不同实例
>>> bart = Student('Bart Simpson', 59)
>>> lisa = Student('Lisa Simpson', 87)
# 给其中一个实例绑定了一个变量名age
>>> bart.age = 8
>>> bart.age
8
# 另一个同类实例中是没有age的
>>> lisa.age
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute 'age'
>>>
```

至此，总算搞明白了什么是类，什么是对象。如何定义类，如何定义类内的方法。同类创建出的不同实例的相同和不同。

### 访问限制

在`Class`内部，可以有属性和方法，而外部代码可以通过直接调用实例变量的方法来操作数据，这样，就隐藏了内部的复杂逻辑。

但是，从前面Student类的定义来看，外部代码还是可以自由地修改一个实例的name、score属性：

```python
>>> bart = Student('Bart Simpson', 98)
>>> bart.score
98
>>> bart.score = 59
>>> bart.score
59
```

如果想让内部属性不被外部访问，可以把属性的名称前加上两个下划线`__`，在Python中，实例的变量名如果以双下划线开头，就变成了一个私有变量(`private`)，只有内部可以访问，外部不能访问：

```python
class Student(object):
    def __init__(self, name, score):
        self.__name = name
        self.__score = score
    def print_score(self):
        print('%s: %s' % (self.__name, self.__score))
```

改完后，对于外部代码来说，没有什么变动，但是已经无法从外部访问到`实例变量.__name`和`实例变量`：

```python
>>> bart = Student('Bart Simpson', 98)
>>> bart.__name
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute '__name'
```

这样就确保了外部代码不能随意修改对象内部的状态，这样通过访问限制的保护，代码更加健壮。

如果外部还需要访问到这两个内部状态的话，可以给`Student`类增加`get_name`和`get_score`这样的方法。如果外部还有修改需求的话，就给该类再增加`set_score`或`set_name`方法。用这样的方式去get set 一个内部保护量：

```python
class Student(object):
    def get_name(self):
        return self.__name
    def get_score(self):
        return self.__score
    def set_name(self, name):
        self.__name = name
    def set_score(self, score):
        self.__score = score
    # 对于set_score(self, score)我们可以借由set方法顺便做参数检查，提高代码安全性
    def set_safe_score(self, score):
        if score >= 0 and score <= 100:
            self.__score = score
        else:
            raise ValueError('bad score')
```

需要注意的是，Python中如果变量名以双下划线开头和结尾的，是特殊变量`__XXX__`。特殊变量是可以直接从类内部访问的。

有些时候，你会看到以一个下划线开头的实例变量名，比如`_name`，这样的实例变量外部是可以访问的，但是，按照约定俗成的规定，当你看到这样的变量时，意思就是，“虽然我可以被访问，但是，请把我视为私有变量，不要随意访问”。

双下划线开头的实例变量是不是一定不能从外部访问呢？其实也不是。不能直接访问`__name`是因为Python解释器对外把`__name`变量改成了`_Student__name`，所以，仍然可以通过`_Student__name`来访问`__name`变量：

```sql
>>> bart._Student__name
'Bart Simpson'
```
但是强烈建议你不要这么干，因为不同版本的Python解释器可能会把__name改成不同的变量名。

Python的访问限制其实并不严格，主要靠自觉。

### 继承和多态

在OOP程序设计中，当我们定义一个class的时候，可以从某个现有的class继承，新的class称为子类（Subclass），而被继承的class称为基类、父类或超类（Base class、Super class）。

比如，我们已经编写了一个名为Animal的class，有一个run()方法可以直接打印一句话，然后新建一个叫`Dog`的类，继承了`Animal`类：

```python
>>> class Animal(object):
...     def run(self):
...         print('running...')
...
>>> class Dog(Animal):
...     pass
...
>>> little_dog = Dog()
>>> little_dog.run()
running...
```

对于Dog来说，Animal就是它的父类，对于Animal来说，Dog就是它的子类。

子类获得了父类的全部功能。Dog()里继承了run()函数，可以给自己的实例里直接用。

那么问题来了，子类和父类如果定义的时候都有个`run()`，会发生什么？

```python
class Animal(object):
    def run(self):
        print('running...')

class Dog(Animal):
    def run(self):
        print("Dog running...")

class Cat(Animal):
    def run(self):
        print("Cat running...")

# 结果如下
Dog is running...
Cat is running...
```

子类的的方法如果和父类的方法重名，子类会覆盖掉父类。因为这个特性，就获得了一个继承的好处"多态"。

当我们定义一个class的时候，实际上也就是定义了一种数据类型。跟`list str dict`一个意思。使用`isinstance(待判断值, 数据类型)`可以做数据类型判定。

```python
>>> a = list()
>>> b = Animal()
>>> c = Dog()
>>> isinstance(a, list)
True
>>> isinstance(a, dict)
False
>>> isinstance(b, Animal)
True
>>> isinstance(c, Dog)
True
```

有意思的是，Dog继承自Animal，那么Dog的实例同事也是Animal数据类型：

```python
>>> isinstance(c, Animal)
True

# 但是如果继承自父类，想跟子类去做判断的话返回False
>>> isinstance(b, Dog)
False
```

要理解多态的好处，我们还需要再编写一个函数，这个函数接受一个Animal类型的变量：

```python
"""
    run_twice() 函数接收了一个`Animal`类型的变量
"""
def run_twice(animal):
    animal.run()
    animal.run()

>>> def run_twice(animal):
...     animal.run()
...     animal.run()
...
"""
    当我们将Animal()的实例传入run_twice中...
"""
>>> run_twice(Animal())
running...
running...
"""
    当我们将Dog()的实例传入run_twice中...
"""
>>> run_twice(Dog())
running...
running...
>>>
```

看上去没啥意思，但是仔细想想，现在，如果我们再定义一个Tortoise类型，也从Animal派生：

```python
>>> class Tortoise(Animal):
...     def run(self):
...         print("Tortoise is running slowly...")
...
"""
当我们调用run_twice()时，传入Tortoise的实例
"""
>>> run_twice(Tortoise())
Tortoise is running slowly...
Tortoise is running slowly...
>>>
```

Tortoise作为Animal的子类，不必对`run_twice()`做任何修改。实际上，任何依赖`Animal`作为参数的函数或者方法都可以不加修改地正常运行，原因在于多态。

多态的好处就是，当我们需要传入Dog、Cat、Tortoise……时，我们只需要接收Animal类型就可以了，因为Dog、Cat、Tortoise……都是Animal类型，然后，按照Animal类型进行操作即可。由于Animal类型有run()方法，因此，传入的任意类型，只要是Animal类或者子类，就会自动调用实际类型的run()方法，这就是多态的意思：

对于一个变量，我们只需要知道它是Animal类型，无需确切地知道它的子类型，就可以放心地调用run()方法，而具体调用的run()方法是作用在Animal、Dog、Cat还是Tortoise对象上，由运行时该对象的确切类型决定，这就是多态真正的威力：调用方只管调用，不管细节，而当我们新增一种Animal的子类时，只要确保run()方法编写正确，不用管原来的代码是如何调用的。这就是著名的“开闭”原则：

- 对扩展开放：允许新增Animal子类；
- 对修改封闭：不需要修改依赖Animal类型的run_twice()等函数。

对于静态语言（例如Java）来说，如果需要传入Animal类型，则传入的对象必须是Animal类型或者它的子类，否则，将无法调用run()方法。

对于Python这样的动态语言来说，则不一定需要传入Animal类型。我们只需要保证传入的对象有一个run()方法就可以了：

```python
class Timer(object):
    def run(self):
        print('Start...')
```

这就是动态语言的“鸭子类型”，它并不要求严格的继承体系，一个对象只要“看起来像鸭子，走起路来像鸭子”，那它就可以被看做是鸭子。

Python的“file-like object“就是一种鸭子类型。对真正的文件对象，它有一个read()方法，返回其内容。但是，许多对象，只要有read()方法，都被视为“file-like object“。许多函数接收的参数就是“file-like object“，你不一定要传入真正的文件对象，完全可以传入任何实现了read()方法的对象。

总结一下：

继承可以把父类的所有功能都直接拿过来，这样就不必重零做起，子类只需要新增自己特有的方法，也可以把父类不适合的方法覆盖重写。

动态语言的鸭子类型特点决定了继承不像静态语言那样是必须的。

### 获取对象信息

当我们拿到一个对象的引用时，如何知道这个对象是什么类型、有哪些方法呢？

`type()` 可以检查类型。用法超级简单：

```python
>>> type(123)
<class 'int'>
>>> type('helloworld')
<class 'str'>
>>> type(None)
<class 'NoneType'>
>>> type(abs)
<class 'builtin_function_or_method'>
>>> type(a)
<class 'list'>
>>> type(Animal)
<class 'type'>
>>> type(Dog)
<class 'type'>
>>> type(Dog())
<class '__main__.Dog'>
>>>
```

type()经常被用来做类型比较：

```python
>>> type(123) == type(456)
True
>>> type(123) == int
True
>>> type(123) == type('123')
False
```

判断基本数据类型可以直接写`int`，`str`等，但如果要判断一个对象是否是函数怎么办？可以使用types模块中定义的常量：

```python
>>> import types
>>> def fn():
...     pass
...
>>> type(fn) == types.FunctionType
True
>>> type(abs) == types.BuiltinFunctionType
True
>>> type(lambda x: x)==types.LambdaType
True
>>> type((x for x in range(10)))==types.GeneratorType
True
```

还有大杀器`isinstance()`。

对于`class`的继承关系来说，使用`type()`就很不方便。我们要判断`class`的类型，可以使用`isinstance()`函数。

我们回顾上次的例子，如果继承关系是：

```
object -> Animal -> Dog -> Husky
```

那么，`isinstance()`就可以告诉我们，一个对象是否是某种类型。这玩意儿也是上手熟系列：

```python
>>> a = Animal()
>>> b = Dog()

>>> isinstance(c, Animal)
True
>>> isinstance(c, Dog)
True

>>> isinstance(a, Animal)
True
>>> isinstance(a, Dog)
False
```

还可以判断一个变量是否是某些类型中的一种，比如下面的代码就可以判断是否是list或者tuple：

```python
>>> isinstance([1, 2, 3], (list, tuple))
True
>>> isinstance((1, 2, 3), (list, tuple))
True
>>> isinstance((1, 2, 3), (tuple))
True
>>> isinstance((1, 2, 3), (list))
False
```

最后一个大杀器`dir()`。

如果要获得一个对象的所有属性和方法，可以使用`dir()`函数，它返回一个包含字符串的list，比如，获得一个str对象的所有属性和方法：

```python
dir('ABC')
[........,'__add__',.....,'__len__',...,'lower','upper'...]
```

类似__xxx__的属性和方法在Python中都是有特殊用途的，比如__len__方法返回长度。在Python中，如果你调用len()函数试图获取一个对象的长度，实际上，在len()函数内部，它自动去调用该对象的__len__()方法，所以，下面的代码是等价的：

```python
>>> len('ABC')
3
>>> 'ABC'.__len__()
3
```

我们自己写的类，如果也想用len(myObj)的话，就自己写一个__len__()方法：

```python
>>> class MyDog(object):
...     def __len__(self):
...         return 100
...
>>> dog = MyDog()
>>> len(dog)
100
```

`dir()`返回的非双下划线样子的，都是普通属性或方法，比如`lower`:

```python
>>> 'ABC'.lower()
'abc'
```

当然既然能列出这属性和方法，也可以相应的修改。python准备了`getattr()、setattr()、hasattr()`，可以直接操作一个对象的状态：

```python
>>> class MyObject(object):
...     def __init__(self):
...         self.x = 9
...     def power(self):
...         return self.x + self.x
...
>>> obj = MyObject()


>>> hasattr(obj, 'x') # 有属性'x'吗？
True
>>> obj.x
9
>>> hasattr(obj, 'y') # 有属性'y'吗？
False
>>> setattr(obj, 'y', 19) # 设置一个属性'y'
>>> hasattr(obj, 'y') # 有属性'y'吗？
True
>>> getattr(obj, 'y') # 获取属性'y'
19
>>> obj.y # 获取属性'y'
19

>>> hasattr(obj, 'power') # 有属性'power'吗？
True
>>> getattr(obj, 'power') # 获取属性'power'
<bound method MyObject.power of <__main__.MyObject object at 0x10077a6a0>>
>>> fn = getattr(obj, 'power') # 获取属性'power'并赋值到变量fn
>>> fn # fn指向obj.power
<bound method MyObject.power of <__main__.MyObject object at 0x10077a6a0>>
>>> fn() # 调用fn()与调用obj.power()是一样的
81
```

实际编码过程中，可以设置一个default值，如果属性不存在，就返回默认值：

```python
>>> getattr(obj, 'k', 404)
404
```

通过内置的一系列函数，我们可以对任意一个Python对象进行剖析，拿到其内部的数据。要注意的是，只有在不知道对象信息的时候，我们才会去获取对象信息。如果可以直接写：

```python
sum = obj.x + obj.y
```

就不要写：

```python
sum = getattr(obj, 'x') + getattr(obj, 'y')
```

一个正确的用法如下：

```python
def readImage(fp):
    if hasattr(fp, 'read'):
        return readData(fp)
    return None
```

假设我们希望从文件流fp中读取图像，我们首先要判断该fp对象是否存在read方法，如果存在，则该对象是一个流，如果不存在，则无法读取。hasattr()就派上了用场。

请注意，在Python这类动态语言中，根据鸭子类型，有read()方法，不代表该fp对象就是一个文件流，它也可能是网络流，也可能是内存中的一个字节流，但只要read()方法返回的是有效的图像数据，就不影响读取图像的功能。

如果你成功看到这部分，你可以跟自己说：“来了，这份感觉终于来了，我的人生开始赢了。”

### 实例属性和类属性

由于Python是动态语言，根据类创建的实例可以任意绑定属性。那就会有这种情况：

```python
class Student(object):
    name = 'Student'
```

类的名字是`Student`，类里的属性也叫`Student`。这会导致黑人问号脸。

```python
>>> class Student(object):
...     name = 'Student'
...
>>> s = Student() # 创建实例s
>>> print(s.name) # 打印name属性，因为实例并没有name属性，所以会继续查找class的name属性
Student
>>> print(Student.name) # 打印类的name属性
Student
>>> s.name = 'Michael' # 给实例绑定name属性
>>> print(s.name) # 由于实例属性优先级比类属性高，因此，它会屏蔽掉类的name属性
Michael
>>> print(Student.name) # 但是类属性并未消失，用Student.name仍然可以访问
Student
>>> del s.name # 如果删除实例的name属性
>>> print(s.name) # 再次调用s.name，由于实例的name属性没有找到，类的name属性就显示出来了
Student
```

从上面的例子可以看出，在编写程序的时候，千万不要把实例属性和类属性使用相同的名字，因为相同名称的实例属性将屏蔽掉类属性，但是当你删除实例属性后，再使用相同的名称，访问到的将是类属性。

----

数据封装、继承和多态只是面向对象程序设计中最基础的3个概念。在Python中，面向对象还有很多高级特性，允许我们写出非常强大的功能。

接下来我们会讨论多重继承、定制类、元类等概念。

### 使用 __slots__

正常情况下，当我们定义了一个class，创建了一个class的实例后，我们可以给该实例绑定任何属性和方法。但是，如果我们想要限制实例的属性怎么办？

为了达到限制的目的，Python允许在定义class的时候，定义一个特殊的__slots__变量，来限制该class实例能添加的属性：

```python
class Student(object):
    __slots__ = ('name', 'age') # 用tuple定义允许绑定的属性名称

"""实际执行效果"""
>>> class Student(object):
...     __slots__ = ('name', 'age')
...
>>> s = Student()
>>> s.name = 'digg'
>>> s.age = '19'
>>> s.score = 99
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute 'score'
>>>
```

由于'score'没有被放到__slots__中，所以不能绑定score属性，试图绑定score将得到AttributeError的错误。

使用`__slots__`要注意，`__slots__`定义的属性仅对当前类实例起作用，对继承的子类是不起作用的：

```python
>>> class GraduateStudent(Student):
...     pass
...
>>> g = GraduateStudent()
>>> g.score = 9999
```

除非在子类中也定义__slots__，这样，子类实例允许定义的属性就是自身的__slots__加上父类的__slots__。

### 使用 @property

在绑定属性时，如果我们直接把属性暴露出去，虽然写起来很简单，但是，没办法检查参数，导致可以把成绩随便改：

```python
s = Student()
s.score = 9999
```

这显然不合逻辑。为了限制score的范围，可以通过一个set_score()方法来设置成绩，再通过一个get_score()来获取成绩，这样，在set_score()方法里，就可以检查参数：

```python
class Student(object):
    def get_score(self):
        return self._socre
    def set_socre(self, value):
        if not isinstance(value, int):
            raise ValueError('score must be an integer!')
        if value < 0 or value > 100:
            raise ValueError('score must between 0 - 100.')
```

现在，对任意的Student实例进行操作，就不能随心所欲地设置score了：

```python
>>> s = Student()
>>> s.set_score(60) # ok!
>>> s.get_score()
60
>>> s.set_score(9999)
Traceback (most recent call last):
  ...
ValueError: score must between 0 ~ 100!
```

有没有既能检查参数，又可以用类似属性这样简单的方式来访问类的变量呢？对于追求完美的Python程序员来说，这是必须要做到的！

Python的装饰器（decorator）可以给函数动态加上功能。对于类的方法，装饰器一样起作用。Python内置的`@property装饰器`就是负责把一个方法变成属性调用的：

```python
class Student(object):
    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if not isinstance(value, int):
            raise ValueError('score must be an integer!')
        if value < 0 or value > 100:
            raise ValueError('score must between 0 - 100!')
        self._score = value
```

把一个getter方法变成属性，只需要加上`@property`就可以了。此时，`@property`本身又创建了另一个装饰器`@score.setter`，负责把一个setter方法变成属性赋值，于是，我们就拥有一个可控的属性操作。看一下实际执行效果：

```python
>>> class Student(object):
...     @property
...     def score(self):
...         return self._score
...     @score.setter
...     def score(self, value):
...         if not isinstance(value, int):
...             raise ValueError('score must be integer!')
...         if value < 0 or value > 100:
...             raise ValueError('score must between 0 - 100!')
...         self._score = value
...
>>> s = Student()
>>> s.score = 60
>>> s.score
60
>>> s.score = 9999
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 10, in score
ValueError: score must between 0 - 100!
>>>
```

还可以定义只读属性，只定义getter方法，不定义setter方法就是一个只读属性：

```python
class Student(object):

    @property
    def birth(self):
        return self._birth

    @birth.setter
    def birth(self, value):
        self._birth = value

    @property
    def age(self):
        return 2015 - self._birth
```

上面的`birth`是可读写属性，而`age`就是一个只读属性，因为`age`可以根据`birth`和当前时间计算出来。

`@property`广泛应用在类的定义中，可以让调用者写出简短的代码，同时保证对参数进行必要的检查，这样，程序运行时就减少了出错的可能性。

廖老师给了一个作业：

利用@property给一个Screen对象加上width和height属性，以及一个只读属性resolution。

```python
"""
    作业解决方案
"""
>>> class Screen(object):
...     @property
...     def width(self):
...         return self._width
...     @width.setter
...     def width(self, value):
...         self._width = value
...     @property
...     def height(self):
...         return self._height
...     @height.setter
...     def height(self, value):
...         self._height = value
...     @property
...     def resolution(self):
...         return self._width * self._height
...
>>> s = Screen()
>>> s.width = 1024
>>> s.height = 768
>>> s.resolution
786432
>>>
```

### 多重继承

继承是面向对象编程的一个重要的方式，因为通过继承，子类就可以扩展父类的功能。

之前我们的讲的例子中有`Animal`类，以及继承了Animal类的`Dog`类。这个继承关系是单向的。我们可以再创建一个类，让Dog继承Animal同时，继承新建的类：

```python
class Runnable(object):
    def run(self):
        print("I'm running...")
```

多重继承：

```python
class Dog(Animal, Runnable):
    pass
```

通过多重继承，一个子类就可以同时获得多个父类的所有功能。

这里有个概念叫`Mixin`。在设计类的继承关系时，通常，主线都是单一继承下来的，例如，Dog继承自Animal。但是，如果需要“混入”额外的功能，通过多重继承就可以实现，比如，让Dog除了继自Animal外，再同时继承Runnable。这种设计通常称之为MixIn。

MixIn的目的就是给一个类增加多个功能，这样，在设计类的时候，我们优先考虑通过多重继承来组合多个MixIn的功能，而不是设计多层次的复杂的继承关系。

通过各种组合继承类，不需要复杂而庞大的继承链，只要选择组合不同的类的功能，就可以快速构造出所需的子类。由于Python允许使用多重继承，因此，MixIn就是一种常见的设计。

只允许单一继承的语言（如Java）不能使用MixIn的设计。

### 定制类

看到类似`__slots__`这种形如`__xxx__`的变量或者函数名就要注意，这些在Python中是有特殊用途的。

`__slots__`我们已经知道怎么用了，`__len__()`方法我们也知道是为了能让class作用于`len()`函数。

除此之外，Python的class中还有许多这样有特殊用途的函数，可以帮助我们定制类。

- `__str__`

```python
>>> class Student(object):
...     def __init__(self, name):
...         self.name = name
...
>>> print(Student('diggzhang'))
<__main__.Student object at 0x1016e4828> # 这里打印了一堆丑东西
>>>
```

如果想改变这堆打印的的丑东西，就需要用到`__str___`，在类里重新定义这个方法就可以了：

```python
>>> class Student(object):
...     def __init__(self, name):
...         self.name = name
...     def __str__(self):
...         return "Student name is %s" % self.name
...
>>> print(Student('diggzhang'))
Student name is diggzhang
>>>    
# 但是去掉print
>>> Student('diggzhang')
<__main__.Student object at 0x1016e4828>
```
去掉print打印丑是因为直接显示变量不归`__str__`管了，由`__repr__`管，一般这俩类如果定制的话，处理办法都一样，于是可以来个简单的，在定制好`__str__`后直接重新赋值给`__str__`：

```python
class Student(object):
    def __init__(self, name):
        self.name = name
    def __str__(self):
        return 'Student object (name=%s)' % self.name
    __repr__ = __str__
```

- `__iter__` 和 `__next__`

如果一个类想被用于`for ... in`循环，类似`list`或`tuple`那样，就必须实现一个`__iter__()`方法，该方法返回一个迭代对象，然后，Python的for循环就会不断调用该迭代对象的`__next__()`方法拿到循环的下一个值，直到遇到`StopIteration`错误时退出循环。

```python
class Fib(object):
    def __init__(self):
        self.a, self.b = 0, 1 # 初始化两个计数器
    def __iter__(self):
        return self # 实例本身即是迭代对象，故而返回自己
    def __next__(self):
        self.a, self.b = self.b, self.a + self.b # 计算下一个值
        if self.a > 100000: # 退出循环条件
            raise StopIteration();
        return self.a

# 测试
for n in Fib():
    print(n)
```

- `__getitem__`

Fib实例虽然能作用于for循环，看起来和list有点像，但是，把它当成list来使用还是不行，比如，取第5个元素：

```python
>>> Fib()[5]
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: 'Fib' object does not support indexing
```

要表现得像list那样按照下标取出元素，需要实现`__getitem__()`方法：

```python
class Fib(object):
    def __getitem__(self, n):
        a, b = 1, 1
        for x in range(n):
            a, b = b, a + b
        return a
```

这样，就可以按下标访问数列的任意一项了：

```python
>>> f = Fib()
>>> f[0]
1
>>> f[1]
1
>>> f[2]
2
>>> f[3]
3
>>> f[10]
89
>>> f[100]
573147844013817084101
```

- `__getattr__`

还记得之前如果访问实例中的属性不存在就会抛出的`no attribute`错误吗？

`__getattr__`可以动态的返回一个属性，当要访问的属性不存在的时候，Python解释器会试图调用`__getattr__(XXX)`来尝试获得需要的属性。利用这一点，可以把一个类的所有属性和方法调用全部动态化处理。

利用到实际中的例子，如果我们要实现几个API的话，会需要对应的URL就写一个对应的方法去处理。API一旦改动，SDK也跟着要改。

利用完全动态的__getattr__，我们可以写出一个链式调用：

```python
class Chain(object):
    def __init__(self, path=''):
        self._path = path
    def __getattr__(self, path):
        return Chain('%s/%s' % (self._path, path))
    def __str__(self):
        return self._path
    __repr__ = __str__

>>> Chain().status.user.timeline.list
/status/user/timeline/list
```

这样，无论API怎么变，SDK都可以根据URL实现完全动态的调用，而且，不随API的增加而改变！

还有些REST API会把参数放到URL中，比如GitHub的API：

```
GET /users/:user/repos
```

调用时，需要把:user替换为实际用户名。如果我们能写出这样的链式调用：

```python
Chain().users('michael').repos
```

- `__call__`

一个对象实例可以有自己的属性和方法，当我们调用实例方法时，我们用instance.method()来调用。能不能直接在实例本身上调用呢？在Python中，答案是肯定的。

任何类，只需要定义一个__call__()方法，就可以直接对实例进行调用。请看示例：

```python
class Student(object):
    def __init__(self, name):
        self.name = name
    def __call__(self):
        print('My name is %s.' % self.name)
```

调用方法如下：

```python
>>> s = Student('Michael')
>>> s() # self参数不要传入
My name is Michael.
```

`__call__()`还可以定义参数。对实例进行直接调用就好比对一个函数进行调用一样，所以你完全可以把对象看成函数，把函数看成对象，因为这两者之间本来就没啥根本的区别。

那么，怎么判断一个变量是对象还是函数呢？其实，更多的时候，我们需要判断一个对象是否能被调用，能被调用的对象就是一个Callable对象，比如函数和我们上面定义的带有`__call__()`的类实例：

```python
>>> callable(Student())
True
>>> callable(max)
True
>>> callable([1, 2, 3])
False
>>> callable(None)
False
>>> callable('str')
False
```

本节介绍的是最常用的几个定制方法，还有很多可定制的方法，请参考Python的官方文档。

### 使用枚举类

当我们需要定义常量时，一个办法是用大写变量通过整数来定义，例如月份：

```
JAN = 1
FEB = 2
MAR = 3
...
NOV = 11
DEC = 12
```

好处是简单，缺点是类型是int，并且仍然是变量。

更好的方法是为这样的枚举类型定义一个`class`类型，然后，每个常量都是`class`的一个唯一实例。Python提供了`Enum`类来实现这个功能：

```python
from enum import Enum

Month = Enum('Month', (
    'Jan', 'Feb', 'Mar', 'Apr',
    'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'    
))
```

这样我们就获得了`Month`类型的枚举类，可以直接使用`Month.Jan`来引用一个常量，或者枚举它的所有成员：

```python
>>> for name, member in Month.__members__.items():
...     print(name, '=>', member, ',', member.value)
...
Jan => Month.Jan , 1
Feb => Month.Feb , 2
Mar => Month.Mar , 3
Apr => Month.Apr , 4
May => Month.May , 5
Jun => Month.Jun , 6
Jul => Month.Jul , 7
Aug => Month.Aug , 8
Sep => Month.Sep , 9
Oct => Month.Oct , 10
Nov => Month.Nov , 11
Dec => Month.Dec , 12
>>>
```

value属性则是自动赋给成员的int常量，默认从1开始计数。

如果需要更精确地控制枚举类型，可以从Enum派生出自定义类：

```python
from enum import Enum, unique

# @unique装饰器可以帮助我们检查保证没有重复值。
@unique
class Weekday(Enum):
    Sun = 0 # Sun的value被设定为0
    Mon = 1
    Tue = 2
    Wed = 3
    Thu = 4
    Fri = 5
    Sat = 6
```

Enum可以把一组相关常量定义在一个class中，且class不可变，而且成员可以直接比较。

```python
>>> day1 = Weekday.Mon
>>> print(day1)
Weekday.Mon
>>> print(Weekday.Tue)
Weekday.Tue
>>> print(Weekday['Tue'])
Weekday.Tue
# 直接根据value的值获得枚举常量
>>> print(Weekday.Tue.value)
2
>>> print(day1 == Weekday.Mon)
True
>>> print(day1 == Weekday.Tue)
False
>>> print(Weekday(1))
Weekday.Mon
>>> print(day1 == Weekday(1))
True
>>> Weekday(7)
Traceback (most recent call last):
  ...
ValueError: 7 is not a valid Weekday
>>> for name, member in Weekday.__members__.items():
...     print(name, '=>', member)
...
Sun => Weekday.Sun
Mon => Weekday.Mon
Tue => Weekday.Tue
Wed => Weekday.Wed
Thu => Weekday.Thu
Fri => Weekday.Fri
Sat => Weekday.Sat
```

### 使用元类

动态语言和静态语言最大的不同，就是函数和类的定义，不是编译时定义的，而是运行时动态创建的。

比方说我们要定义一个`Hello`的class，就写一个`hello.py`模块：

```python
class Hello(object):
    def hello(self, name='world'):
        print('Hello, %s.' % name)
```

当Python解释器载入hello模块时，就会依次执行该模块的所有语句，执行结果就是动态创建出一个Hello的class对象，测试如下：

```python
>>> from hello import Hello
>>> h = Hello()
>>> h.hello()
Hello, world.
>>> print(type(Hello))
<class 'type'>
>>> print(type(h))
<class 'hello.Hello'>
```

`type()`函数可以查看一个类型或变量的类型，`Hello`是一个`class`，它的类型就是`type`，而`h`是一个实例，它的类型就是`class Hello`。

`class`的定义是运行时动态创建的，而创建`class`的方法就是使用`type()`函数。

`type()`函数既可以返回一个对象的类型，又可以创建出新的类型，比如，我们可以通过`type()`函数创建出`Hello`类，而无需通过`class Hello(object)...`的定义：

```python
>>> def fn(self, name='world'): # 先定义函数
...     print('Hello, %s.' % name)
...
>>> Hello = type('Hello', (object,), dict(hello=fn)) # 创建Hello class
>>> h = Hello()
>>> h.hello()
Hello, world.
>>> print(type(Hello))
<class 'type'>
>>> print(type(h))
<class '__main__.Hello'>
```

要创建一个`class`对象，`type()`函数依次传入3个参数：

> type('Hello', (object,), dict(hello=fn))

1. class名称；
2. 继承父类的集合，注意Python支持多重继承，别忘了tuple的单元素写法；
3. class的方法名称与函数绑定，这里我们把函数fn绑定到方法名hello上。

通过type()函数创建的类和直接写class是完全一样的，因为Python解释器遇到class定义时，仅仅是扫描一下class定义的语法，然后调用type()函数创建出class。

正常情况下，我们都用class Xxx...来定义类，但是，type()函数也允许我们动态创建出类来，也就是说，动态语言本身支持运行期动态创建类，这和静态语言有非常大的不同，要在静态语言运行期创建类，必须构造源代码字符串再调用编译器，或者借助一些工具生成字节码实现，本质上都是动态编译，会非常复杂。

除了使用`type()`动态创建类以外，要控制类的创建行为，还可以使用`metaclass`。

metaclass，直译为 **元类** ，简单的解释就是：

*当我们定义了类以后，就可以根据这个类创建出实例，所以：先定义类，然后创建实例。*

*但是如果我们想创建出类呢？那就必须根据metaclass创建出类，所以：先定义metaclass，然后创建类。*

*连接起来就是：先定义metaclass，就可以创建类，最后创建实例。*

所以，metaclass允许你创建类或者修改类。换句话说，你可以把类看成是metaclass创建出来的“实例”。

来个例子感受一下，按照默认习惯，metaclass的类名总是以Metaclass结尾，以便清楚地表示这是一个metaclass：

```python
# metaclass是类的模板，所以必须从`type`类型派生：
class ListMetaclass(type):
    def __new__(cls, name, bases, attrs):
        attrs['add'] = lambda self, value: self.append(value)
        return type.__new__(cls, name, bases, attrs)
```

有了`ListMetaclass`，我们在定义类的时候还要指示使用`ListMetaclass`来定制类，传入关键字参数`metaclass`：

```python
class MyList(list, metaclass=ListMetaclass):
    pass
```

当我们传入关键字参数metaclass时，魔术就生效了，它指示Python解释器在创建MyList时，要通过`ListMetaclass.__new__()`来创建，在此，我们可以修改类的定义，比如，加上新的方法，然后，返回修改后的定义。


`__new__()`方法接收到的参数依次是：

1. 当前准备创建的类的对象；
2. 类的名字；
3. 类继承的父类集合；
4. 类的方法集合。
