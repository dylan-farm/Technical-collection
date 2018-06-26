##目录
> Class
> * [Class的方法 & 实例对象](#1)
> * [Class内部方法的this指向](#2)
> * [拦截器](#3)
> * [继承](#4)
> * [Class 与 构造函数 的区别](#5)
> * [Class了解](#6)
> * [Class应用Demo](#11)
>
> Decorator
> * [修饰Class](#7)
> * [修饰方法](#8)
> * [不能修饰函数](#9)
> * [项目中的应用](#10)
> * [Decorator应用Demo](#22)




## Class
ES6 的class可以看作只是一个语法糖，它的绝大部分功能，ES5 都可以做到，**完全可以看作构造函数的另一种写法**，新的class写法只是让对象原型的写法更加清晰、更像面向对象编程的语法而已。
#### 划重点
* <span id="1">Class的方法 & 实例对象</span>
  * Class的所有方法都定义在类的prototype属性上面，所以在类的实例上面调用方法，其实就是调用原型上的方法。
  * 类的实例对象与 ES5 一样，实例的属性除非显式定义在其本身（即定义在this对象上），否则都是定义在原型上（即定义在class上）。
  * Class的prototype对象的constructor属性，直接指向“类”的本身，这与 ES5 的行为是一致的。
  * 在一个方法前，加上static关键字，就表示该方法不会被实例继承，而是直接通过类来调用，静态方法内部的this关键字，指向类本身，而不是实例。
  ```javascript
  //定义类
  class Point {

    constructor() {
      this.name = 'QD';
    }

    toString() {
    }

    static classMethod() {
      return 'hello';
    }

  }

  // 等同于
  Point.prototype = {
    constructor() {
      this.name = 'QD';
    },
    toString() {
    },
  };
  // 类的实例对象
  var oPoint = new Point()
  oPoint.hasOwnProperty('name') // true
  oPoint.hasOwnProperty('toString') // false
  oPoint.__proto__.hasOwnProperty('toString') // true

  // constructor属性，直接指向“类”的本身
  Point.prototype.constructor === Point // true

  // 静态方法
  Point.classMethod() // 'hello'
  oPoint.classMethod() //TypeError: foo.classMethod is not a function
  ```
* <span id="2">this 指向</span>，class内部的方法中的this，默认指向类的实例。但是，如果将这个方法提取出来单独使用，this会指向该方法运行时所在的环境，因为找不到方法而导致报错。解决办法如下：
  * 在构造方法中绑定this。
  * 使用箭头函数。
  * 使用Proxy，获取方法的时候，自动绑定this。
* <span id="3">Class 的取值函数（getter）和存值函数（setter）,对某个属性设置存值函数和取值函数，拦截该属性的存取行为。</span>
  ```javascript
  class MyClass {
    constructor() {
      // ...
    }
    get prop() {
      return 'getter';
    }
    set prop(value) {
      console.log('setter: '+value);
    }
  }

  let inst = new MyClass();

  inst.prop = 123;
  // setter: 123

  inst.prop
  // 'getter'
  ```

* <span id="4">extends关键字实现继承</span>
  * super这个关键字，既可以当作函数使用，也可以当作对象使用
    * 作为函数时，super()只能用在子类的构造函数之中，用在其他地方就会报错。在继承父类创建子类时必须在子类的constructor方法中调用super方法，否则新建实例时会报错。
    * 作为对象时，在普通方法中，指向父类的原型对象；在静态方法中，指向父类。
    * ES6 规定，在子类普通方法中通过super调用父类的方法时，方法内部的this指向当前的子类实例。在子类的静态方法中通过super调用父类的方法时，方法内部的this指向当前的子类，而不是子类的实例。
    ```javascript
      class Parent {
        static myMethod() {
          console.log('static', this.name);
        }

        myMethod() {
          console.log('instance', this);
        }
      }

      class Child extends Parent {
        static myMethod() {
          super.myMethod(); // Parent.myMethod.call(Child)
        }

        myMethod() {
          super.myMethod(); //Parent.prototype.myMethod.call(Clild)
        }
      }
      // 指向父类的原型对象
      var oChild = new Child();
      oChild.myMethod(); // instance oChild

      // 指向父类
      Child.myMethod(); // static Child

    ```
  * 类的 prototype 属性和__proto__属性
    * 子类的__proto__属性，表示构造函数的继承，总是指向父类。

    * 子类prototype属性的__proto__属性，表示方法的继承，总是指向父类的prototype属性。
  ```javascript
      class A {
      }

      class B extends A {
      }

      B.__proto__ === A // true
      B.prototype.__proto__ === A.prototype // true

      // 类的继承实现原理
      // B 的实例继承 A 的实例
      Object.setPrototypeOf(B.prototype, A.prototype);

      // B 继承 A 的静态属性
      Object.setPrototypeOf(B, A);

      const b = new B();

      //  setPrototypeOf  ES6 正式推荐的设置原型对象的方法。  
      Object.setPrototypeOf(object, prototype)  
      //  用法  
      var o = Object.setPrototypeOf({}, null);  
      //该方法等同于下面的函数。  
      function (obj, proto) {  
          obj.__proto__ = proto;  
          return obj;  
      }  
    ```


#### <span id="5">Class 与 构造函数 的区别</span>
* Class必须使用new调用，否则会报错。这是它跟普通构造函数的一个主要区别，后者不用new也可以执行。
* Class内部定义的方法，都是不可枚举的，这一点与 ES5 的行为不一致。
  ```javascript
  class Point1 {
    constructor(x, y) {
      // ...
    }

    toString() {
      // ...
    }
  }
  Object.keys(Point1.prototype) //[]
  Object.getOwnPropertyNames(Point1.prototype) // ["constructor","toString"]

  var Point2 = function (x, y) {
    // ...
  };

  Point2.prototype.toString = function() {
    // ...
  };
  Object.keys(Point2.prototype) // ["toString"]
  Object.getOwnPropertyNames(Point2.prototype) // ["constructor","toString"]

  ```
* Class不存在变量提升（hoist），这一点与 ES5 完全不同。这种规定的原因与下文要提到的继承有关，必须保证子类在父类之后定义。
  ```javascript
    // new Foo(); // ReferenceError
    let Foo = class {};
    class Bar extends Foo {
    }
  ```

#### <span id="6">了解一下</span>
* 类和模块的内部，默认是严格模式，也就是写在类或模块中的代码，就只有严格模式可用，ES6 实际上把整个语言升级到了严格模式。
* constructor方法是类的默认方法，通过new命令生成对象实例时，自动调用该方法。一个类必须有constructor方法，如果没有显式定义，一个空的constructor方法会被默认添加。constructor方法默认返回实例对象（即this），完全可以指定返回另外一个对象。
* Class表达式
  ```javascript
  // 与函数一样，类也可以使用表达式的形式定义。
  const MyClass = class Me {
    getClassName() {
      return Me.name;
    }
  };

  // 这个类的名字是MyClass而不是Me，Me只在 Class 的内部代码可用，指代当前类
  let inst = new MyClass();
  inst.getClassName() // Me
  Me.name // ReferenceError: Me is not defined
  
  // 立即执行的 Class。
  let newClass = new class{ 
    clearCache() {
      console.log('清除缓存')
    }
  }
  newClass.clearCache(); // 清除缓存
  ````
* ES6 不提供class的私有方法和私有属性，只能通过变通方法模拟实现
  * 方法前面的下划线，表示这是一个只限于内部使用的私有方法。但是，这种命名是不保险的，在类的外部，还是可以调用到这个方法 。
  * 将私有方法移出模块，因为模块内部的所有方法都是对外可见的。
  * 利用Symbol值的唯一性，将私有方法的名字命名为一个Symbol值，第三方无法获取到它们，就达到了私有方法和私有属性的效果。
* ES6 为new命令引入了一个new.target属性，该属性一般用在构造函数之中，返回new命令作用于的那个构造函数。如果构造函数不是通过new命令调用的，new.target会返回undefined。需要注意：子类继承父类时，new.target会返回子类。
  ```javascript
    function Person(name) {
      if (new.target === Person) {
        this.name = name;
      } else {
        throw new Error('必须使用 new 命令生成实例');
      }
    }

    var person = new Person('张三'); // 正确
    var notAPerson = Person.call(person, '张三');  // 报错

    // 打造 作用域安全的构造函数 

    // function Person(name) { this.name }
    // 当没有使用 new 操作符来调用该构造函数的情况上。由于该 this 对象是在运行时绑定的，
    // 所以直接调用 Person()， this 会映射到全局对象 window 上，导致错误对象属性的意外增加。

    function Person(name){ 
      // if (this instanceof Person){ // 传统实现
      if (new.target === Person){     //利用new.target
            this.name = name;
          } else {
            return new Person(name);
          }
    }

  ```
#### <span id="11">Class应用Dome</span>
拖拽效果：
  ```javascript
    ; (function () {

      const transform = function () { // 私有方法 
        const divStyle = document.createElement('div').style;
        const transformArr = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'];
        return transformArr.find(value => divStyle.hasOwnProperty(value)) || '';
      }()

      class Drag {
        constructor(selector) {
          this.elem = typeof selector == 'Object' ? selector : document.getElementById(selector);
          this.startX = 0;
          this.startY = 0;
          this.sourceX = 0;
          this.sourceY = 0;
          this.setElemDrag();
        }

        // 获取当前元素的属性
        getStyle(property) {
          return document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(this.elem, false)[property] : this.elem.currentStyle[property];
        }

        // 获取当前元素的位置
        getPosition() {
          let pos = { x: 0, y: 0 };
          if (transform) {
            const transformValue = this.getStyle(transform);
            if (transformValue == 'none') {
              this.elem.style[transform] = 'translate(0, 0)';
            } else {
              const temp = transformValue.match(/-?\d+/g);
              pos = {
                x: parseInt(temp[4].trim()),
                y: parseInt(temp[5].trim())
              }
            }
          } else {
            if (this.getStyle('position') == 'static') {
              this.elem.style.position = 'relative';
            } else {
              pos = {
                x: parseInt(this.getStyle('left') || 0),
                y: parseInt(this.getStyle('top') || 0)
              }
            }
          }
          return pos;
        }

        // 改变当前元素的位置
        setPostion(pos) {
          const { x = 0, y = 0 } = pos
          if (transform) {
            this.elem.style[transform] = `translate(${x}px, ${y}px)`;
          } else {
            this.elem.style.left = `${x}px`;
            this.elem.style.top = `${y}px`;
          }
        }

        // 为DOM元素绑定拖拽三步
        setElemDrag() {
          let self = this;
          this.elem.addEventListener('mousedown', start, false);

          function start(event) {
            const { pageX, pageY } = event;
            const { x, y } = self.getPosition();
            self.startX = pageX;
            self.startY = pageY;
            self.sourceX = x;
            self.sourceY = y;
            document.addEventListener('mousemove', move, false);
            document.addEventListener('mouseup', end, false);
          }

          function move(event) {
            const { sourceX, startX, sourceY, startY } = self
            const { pageX, pageY } = event;
            self.setPostion({
              x: (sourceX + pageX - startX).toFixed(),
              y: (sourceY + pageY - startY).toFixed()
            })
          }

          function end(event) {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', end);
          }
        }
      }
      window.Drag = Drag;
    })();
    // 应用
    new Drag('target');

  ```


## Decorator

![锦上添花](chrimas_tree.png)

Decorator即「修饰模式」，在「不侵入原有代码」的情况下，为代码增加一些「额外的功能」（锦上添花）。

所谓「额外的功能」一般都比较独立，不和原有逻辑耦合，只是做一层包装。你也可以把它看成「包装模式」。

#### 划重点
* <span id="7">修饰Class</span>, 修饰器对类的行为的改变，是代码编译时发生的，而不是在运行时。这意味着，修饰器能在编译阶段运行代码。也就是说，修饰器本质就是编译时执行的函数。
  ```javascript
  function readable(isReadable, isWritable) {
    return function(target) {
      target.isReadable = isReadable;
      target.prototype.isWritable = isWritable;
    }
  }

  @readable(true,false)
  class MyBook {}

  MyBook.isTestable // true
  const myBook = new MyBook()
  myBook.isWritable //true

  ```
* <span id="8">修饰方法</span>，修饰器不仅可以修饰类，还可以修饰类的属性。”同一个方法有多个修饰器，会像剥洋葱一样，先从外到内进入，然后由内向外执行“ ？（先从内到外进入，然后由外向内执行）
  ```javascript
  class Math {
    @logParams
    @logKey
    add(a, b) {
      return a + b;
    }
  }

  function logParams(target, key, descriptor) {
    var oldValue = descriptor.value;
    console.log("logParams")
    descriptor.value = function () {
      console.log([].slice.call(arguments));
      return oldValue.apply(this, arguments);
    };

    return descriptor;
  }

  function logKey(target, key, descriptor) {
    var oldValue = descriptor.value;
    console.log("logKey")
    descriptor.value = function () {
      console.log(`Calling ${key}`);
      return oldValue.apply(this, arguments);
    };

    return descriptor;
  }

  const math = new Math();

  math.add(2, 4);
  ```
* <span id="9">修饰器只能用于类和类的方法，不能用于函数，因为存在函数提升</span>。类是不会提升的，所以就没有这方面的问题。如果一定要修饰函数，可以采用高阶函数的形式直接执行。  
  ```javascript
  var readOnly = require("some-decorator");

  @readOnly
  function foo() {
  }
  ```
  实际执行是下面这样
  ```javascript
  var readOnly;

  @readOnly
  function foo() {
  }

  readOnly = require("some-decorator");

  ```
## <span id="10">Decorator在实际项目（大白）应用及解析</span>
Mobx是一个功能强大，上手非常容易的状态管理工具。
React 和 MobX 是一对强力组合。React 通过提供机制把应用状态转换为可渲染组件树并对其进行渲染。而MobX提供机制来存储和更新应用状态供 React 使用。

**利用mobx带来的好处：**
1 数据 存储&更新
2 states & actions 共享
3 避免显式数据传递造成数据不安全
4 见文档（Mobx 中文文档：https://cn.mobx.js.org）
在 mobx-react 中，可以使用 @observer 对 react 对象进行包装，使其 render 方法成为一个观察者。
  ```javascript
  //  @observer 实现 （简易版）
  import {  autorun } from 'mobx'

  function observer(target) {
      const method = target.prototype.componentWillMount;
      target.prototype.componentWillMount = function() {
          method && method.call(this);
          autorun(() => {
              this.render();
              this.forceUpdate();
          });
      };
  }

  ```
## <span id="22">Decorator应用Demo</span>

![无敌浩克](banna.jpeg)

#### 创建 Banner
  ```javascript
  class Banner {
  constructor(weight = 70, height = 175, power = 100, colour = '') {
      this.init(weight, height, power, colour);
    }
    init(weight, height, power, colour) {
      this.weight = weight;
      this.height = height;
      this.power = power;
      this.colour = colour || 'white';
    }
    toString() {
      return `${this.colour == 'green' ? '无敌浩克 ( ╰_╯ )' : '班纳'} ==> 体重:${this.weight}kg，身高：${this.height}cm,力量：${this.power}kg,肤色：${this.colour}`;
    }
  }
  ```
#### 创建 variation ( 伽马射线 ==> 变异 ) 班纳 ==> 无敌浩克
  ```javascript
  function variation(type, value) {

    return function (target, key, descriptor) {
      const method = descriptor.value;
      // 变异默认值
      const config = {
        variationWeight: 1000,
        variationHeight: 1000,
        variationPower: 9999999999900,
        variationColour: 'green'
      }

      descriptor.value = (...args) => {
        const flag = typeof type == 'number' && type < 4
        if (flag) args[type] += value || Object.entries(config)[type][1];
        return method.apply(target, args);
      }

      return descriptor;
    }

  }
  ```

#### 班纳增强体重
  ```javascript
  class Banner {
    constructor(weight = 70, height = 175, power = 100, colour = '') {
      this.init(weight, height, power, colour);
    }
    @variation(0)
    init(weight, height, power, colour) {
      this.weight = weight;
      this.height = height;
      this.power = power;
      this.colour = colour || 'white';
    }
    toString() {
      return `${this.colour == 'green' ? '无敌浩克 ( ╰_╯ )' : '班纳'} ==> 体重:${this.weight}kg，身高：${this.height}cm,力量：${this.power}kg,肤色：${this.colour}`;   
    }
  }
  var MrGreen = new Banner();
  console.log(`输出： ${MrGreen}`);
  // 输出：班纳 ==> 体重:1070kg，身高：175cm,力量：100kg,肤色：white
  ```
#### 班纳增强身高
  ```javascript
  class Banner {
    constructor(weight = 70, height = 175, power = 100, colour = '') {
      this.init(weight, height, power, colour);
    }
    @variation(1)
    @variation(0)
    init(weight, height, power, colour) {
      this.weight = weight;
      this.height = height;
      this.power = power;
      this.colour = colour || 'white';
    }
    toString() {
      return `${this.colour == 'green' ? '无敌浩克 ( ╰_╯ )' : '班纳'} ==> 体重:${this.weight}kg，身高：${this.height}cm,力量：${this.power}kg,肤色：${this.colour}`;   
    }
  }
  var MrGreen = new Banner();
  console.log(`输出： ${MrGreen}`);
  // 输出：班纳 ==> 体重:1070kg，身高：375cm,力量：100kg,肤色：white
  ```
#### 班纳增强力量
  ```javascript
  class Banner {
    constructor(weight = 70, height = 175, power = 100, colour = '') {
      this.init(weight, height, power, colour);
    }
    @variation(2)
    @variation(1)
    @variation(0)
    init(weight, height, power, colour) {
      this.weight = weight;
      this.height = height;
      this.power = power;
      this.colour = colour || 'white';
    }
    toString() {
      return `${this.colour == 'green' ? '无敌浩克 ( ╰_╯ )' : '班纳'} ==> 体重:${this.weight}kg，身高：${this.height}cm,力量：${this.power}kg,肤色：${this.colour}`;
    }
  }
  var MrGreen = new Banner();
  console.log(`输出： ${MrGreen}`);
  // 输出：班纳 ==> 体重:1070kg，身高：375cm,10000000000000kg,肤色：white
  ```
#### 班纳改变肤色, 完成 终极进化 ==> 无敌浩克（完整版）
  ```javascript
  class Banner {
    constructor(weight = 70, height = 175, power = 100, colour = '') {
      this.init(weight, height, power, colour);
    }
    @variation(3)
    @variation(2)
    @variation(1)
    @variation(0)
    init(weight, height, power, colour) {
      this.weight = weight;
      this.height = height;
      this.power = power;
      this.colour = colour || 'white';
    }
    toString() {
      return `${this.colour == 'green' ? '无敌浩克 ( ╰_╯ )' : '班纳'} ==> 体重:${this.weight}kg，身高：${this.height}cm,力量：${this.power}kg,肤色：${this.colour}`;
    }
  }
  var MrGreen = new Banner();
  console.log(`输出： ${MrGreen}`);
  // 输出：无敌浩克 ( ╰_╯ ) ==> 体重:1070kg，身高：175cm,10000000000000kg,肤色：green
  ```

![无敌浩克](hulk.jpg)







