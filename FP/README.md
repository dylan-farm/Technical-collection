

### 函数式编程的思想
* 函数式编程有用吗？
* 什么是函数式编程？
* 函数式编程的优点。

>面向对象编程(OOP)通过封装变化使得代码更易理解。 
>函数式编程(FP)通过最小化变化使得代码更易理解。
> -- Michacel Feathers（Twitter）


**设计应用程序的设计原则：**

* 可扩展性--我是否需要不断地重构代码来支持额外的功能？
* 易模块化--如果我更改了一个文件，另一个文件是否会受到影响？
* 可重用性--是否有很多重复的代码？
* 可测性--给这些函数添加单元测试是否让我纠结？
* 易推理性--我写的代码是否非结构化严重并难以推理？

**学会了函数式编程，这些问题迎刃而解。**

### 什么是函数式编程？
>函数式编程的目的是使用函数来**抽象作用在数据之上的控制流和操作**，从而在系统中**消除副作用并减少对状态的改变**。


#### 基本概念

* 声明式编程：函数式编程属于声明是编程范式：这种范式会描述一系列的操作，但并不会暴露它们是如何实现的或是数据流如何传过它们。
* 纯函数：纯函数是指相同的输入总会得到相同的输出，并且不会产生副作用的函数。
* 引用透明：如果一个函数对于相同的输入始终产生相同的结果，那么我们就说它是引用透明。
* 不可变性
###  函数式编程的优点

* 使用纯函数的代码绝不会更改或破坏全局状态，有助于提高代码的可测试性和可维护性
* 函数式编程采用声明式的风格，易于推理，提高代码的可读性。
* 函数式编程将函数视为积木，通过一等高阶函数来提高代码的模块化和可重用性。
* 可以利用响应式编程组合各个函数来降低事件驱动程序的复杂性(这点后面可能会单独拿一篇来进行讲解)。


#### 函数式编程具有两个基本特征。

* 函数是第一等公民：指函数跟其它的数据类型一样处于平等地位，可以**赋值给其他变量**，可以**作为参数**传入另一个函数，也可以**作为别的函数的返回值**。
* 函数是纯函数


**纯函数具有两个特点：**

* 同输入同输出
* 无副作用


**副作用：**

* 改变一个全局的变量、属性或数据结构
* 改变一个函数参数的原始值
* 处理用户输入抛出一个异常
* 屏幕打印或记录日志
* 查询 HTML 文档，浏览器的 Cookie 或访问数据库

#### 函数式编程具有两个最基本的运算：

* 合成（compose）：将代表各个动作的多个函数合并成一个函数。
* 柯里化（Currying）：


通用 **compose** 函数的代码
```
function compose() {
  var args = arguments;
  var start = args.length - 1;
  return function () {
    var i = start - 1;
    var result = args[start].apply(this, arguments);
    while (i >= 0){
      result = args[i].call(this, result);
      i--;
    }
    return result;
  };
}

```


**函数柯里化（Currying）**

> 在计算机科学中，柯里化，又译为卡瑞化或加里化，是把接受多个参数的函数变换成接受一个单一参数（最初函数的第一个参数）的函数，并且返回接受余下的参数而且返回结果的新函数的技术。


柯里化函数则是将函数柯里化之后得到的一个新函数。由上述定义可知，柯里化函数有如下两个特性：

* 接受一个单一参数；
* 返回接受余下的参数而且返回结果的新函数；

**柯里化通用式**

```
var currying = function (fn) {
    var args = [].slice.call(arguments, 1);
    return function () {
        // 主要还是收集所有需要的参数到一个数组中，便于统一计算
        var _args = args.concat([].slice.call(arguments));
        return fn.apply(null, _args);
    }
}
```

**收集参数能力加强版**
```
// 参数只能从左到右传递
function createCurry(func, arrArgs) {
    var args=arguments;
    var funcLength = func.length;
    var arrArgs = arrArgs || [];

    return function() {
        var _arrArgs = Array.prototype.slice.call(arguments);
        var allArrArgs=arrArgs.concat(_arrArgs)

        // 如果参数个数小于最初的func.length，则递归调用，继续收集参数
        if (allArrArgs.length < funcLength) {
            return args.callee.call(this, func, allArrArgs);
        }

        // 参数收集完毕，则执行func
        return func.apply(this, allArrArgs);
    }
}

```
**Currying 使用场景:**

* 参数复用：固定不变的参数，实现参数复用是 Currying 的主要用途之一。
* 延迟执行：也是 Currying 的一个重要使用场景，同样 bind 和箭头函数也能实现同样的功能。

### 结论

* Currying 在 JavaScript 中是“低性能”的，但是这些性能在绝大多数场景，是可以忽略的。
* Currying 的思想极大地助于提升函数的复用性。
* Currying 生于函数式编程，也陷于函数式编程。假如没有准备好写纯正的函数式代码，那么 Currying 有更好的替代品。