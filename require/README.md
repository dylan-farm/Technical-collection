

#### 结论
>《深入浅出nodejs》一书中提到，每个模块文件的require，exports和module这3个变量并没有在模块中定义，也并非全局函数/对象。而是在编译的时候Node对js文件内容进行了头尾的包装。在头部加了(function (exports, require, module, __filename, __dirname) {，在尾部加了 \n});。

**node源码分析：有关require的内容，阅读下面两个文件就可以了**
*   [bootstrap_node.js](https://github.com/nodejs/node/blob/v5.x/lib/internal/bootstrap_node.js)
*   [module.js](https://github.com/nodejs/node/blob/v5.x/lib/module.js)

**require 的整个过程可以大致分两个步骤：**

1. 根据path获取真实文件名及路径
2. 根据文件名及后缀选用不同的加载方法加载不同类型的文件（
js，json，node等）

##### 获取真实文件名及路径：
`require(path)` -> `Module._load` -> `Module._resolveFilename`  -> `Module._findPath`

在lib/module.js文件中可以看到Module._findPath方法源码：

![83a2609e41d968c60686b3735723bb90.png](en-resource://database/877:1)
![485a076783419947773a7f2d672af1fa.png](en-resource://database/879:1)


这里完整的显示了node是如何根据require传入的名称来定位具体的文件的，他们的顺序依次是：

>1. 先从缓存中读取，如果没有则继续往下
>2. 判断需要模块路径是否以/结尾，如果不是，则要判断   
> a. 检查是否是一个文件，如果是，则转换为真实路径    
> b. 否则如果是一个目录，则调用tryPackage方法读取该目录下的package.json文件，把里面的main属性设置为filename    
> c. 如果没有读到路径上的文件，则通过tryExtensions尝试在该路径后依次加上.js，.json和.node后缀，判断是否存在，若存在则返回加上后缀后的路径
> 3. 如果依然不存在，则同样调用tryPackage方法读取该目录下的package.json文件，把里面的main属性设置为filename
> 4. 如果依然不存在，则尝试在该路径后依次加上index.js，index.json和index.node，判断是否存在，若存在则返回拼接后的路径。
> 5. 若解析成功，则把解析得到的文件名cache起来，下次require就不用再次解析了，否则若解析失败，则返回false

##### 加载文件：
`Module._load`  -> `Module.load` -> `Module._extensions` 
-> 加载js文件后续方法：`module._compile` -> `Module.wrap`  && `runInThisContext`
```
// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
   -> 加载js文件后续方法：`module._compile`(internalModule.stripBOM(content), filename);
};


// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
  var content = fs.readFileSync(filename, 'utf8');
  try {
    module.exports = JSON.parse(internalModule.stripBOM(content));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};


//Native extension for .node
Module._extensions['.node'] = function(module, filename) {
  return process.dlopen(module, path._makeLong(filename));
};
```


可以看到，js文件将在读入文件（同步读）内容后进行编译，json文件则用JSON.parse解析内容，node文件则使用dlopen进行动态链接库载入


这里仅分析对js文件加载的方法源码：
```
Module.prototype._compile = function(content, filename) {
  // remove shebang
  content = content.replace(shebangRe, '');

  // create wrapper function
  var wrapper = Module.wrap(content);

  var compiledWrapper = runInThisContext(wrapper,
                                      { filename: filename, lineOffset: 0 });
  if (global.v8debug) {
    if (!resolvedArgv) {
      // we enter the repl if we're not given a filename argument.
      if (process.argv[1]) {
        resolvedArgv = Module._resolveFilename(process.argv[1], null);
      } else {
        resolvedArgv = 'repl';
      }
    }

    // Set breakpoint on module start
    if (filename === resolvedArgv) {
      // Installing this dummy debug event listener tells V8 to start
      // the debugger.  Without it, the setBreakPoint() fails with an
      // 'illegal access' error.
      global.v8debug.Debug.setListener(function() {});
      global.v8debug.Debug.setBreakPoint(compiledWrapper, 0, 0);
    }
  }
  const dirname = path.dirname(filename);
  const require = internalModule.makeRequireFunction.call(this);
  const args = [this.exports, require, this, filename, dirname];
  const depth = internalModule.requireDepth;
  if (depth === 0) stat.cache = new Map();
  const result = compiledWrapper.apply(this.exports, args);
  if (depth === 0) stat.cache = null;
  return result;
};
```

可以看出：js文件内容先被wrap（包装）了一下，然后才使用runInThisContext来运行包装后的代码，而传入的参数就是前面说的exports, require, module，还有当前文件名及所在目录名。


Module.wrap源码：
```
Module.wrapper = NativeModule.wrapper
Module.wrap = NativeModule.wrap
```
```
  NativeModule.wrap = function(script) {
    return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
  };

  NativeModule.wrapper = [
    '(function (exports, require, module, __filename, __dirname) { ',
    '\n});'
  ];
```

**至此可以理解：**
《深入浅出nodejs》一书中提到，每个模块文件的require，exports和module这3个变量并没有在模块中定义，也并非全局函数/对象。而是在编译的时候Node对js文件内容进行了头尾的包装。在头部加了(function (exports, require, module, __filename, __dirname) {，在尾部加了 \n});。
