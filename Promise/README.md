
### Promises 的起源

* 金字塔问题 经常出现。它描述的是大量的回调函数慢慢向右侧屏幕延伸的一种状态。
* 回调函数真正的问题在于他剥夺了我们使用 return 和 throw 这些关键字的能力。
* 整个代码流程都是基于副作用的: 一个函数会附带调用其他函数。实际上所有异步调用都可以视为带有副作用的行为。
* 回调更加恼人的是，他会将我们通常在大部分编程语言中能获得的 堆栈 破坏。


### 新手错误


**#1： promise版的金字塔问题**

正确的风格应该是这样:
```
remotedb.allDocs(...).then(function (resultOfAllDocs) {
  return localdb.put(...);}).then(function (resultOfPut) {
  return localdb.get(...);}).then(function (resultOfGet) {
  return localdb.put(...);}).catch(function (err) {
  console.log(err);
}); 
```

**#2： WTF, 用了 promises 后怎么用 forEach?**
```
// I want to remove() all
docsdb.allDocs({include_docs: true}).then(function (result) {
  result.rows.forEach(function (row) {
    db.remove(row.doc);  
  });
}).then(function () {
  // I naively believe all docs have been removed() now!
});
```

问题在于第一个函数实际上返回的是 undefined，这意味着第二个方法不会等待所有 documents 都执行 db.remove()。实际上他不会等待任何事情，并且可能会在任意数量的文档被删除后执行！


你需要的是 Promise.all():
```
db.allDocs({include_docs: true}).then(function (result) {
  return Promise.all(result.rows.map(function (row) {
    return db.remove(row.doc);
  }));
}).then(function (arrayOfResults) {
  // All docs have really been removed() now!
});
```

**#3： 忘记使用 .catch()**
>类似 Bluebird 之类的 Promise 库会在这种场景抛出 UnhandledRejectionError 警示有未处理的异常，这类情况一旦发现，就会造成脚本异常，在 Node 中更会造成进程 Crash 的问题，因此正确的添加 .catch() 非常重要。 译者注

```
somePromise().then(function () {
  return anotherPromise();
  }).then(function () {
    return yetAnotherPromise();
  }).catch(console.log.bind(console)); // <-- this is badass
```
**#5：使用副作用调用而非返回**

问题代码
```

somePromise().then(function () {
  someOtherPromise();
  }).then(function () {
  // Gee, I hope someOtherPromise() has resolved!
  // Spoiler alert: it hasn't.
  });
```


promises 的奇妙在于给予我们以前的 return 与 throw。但是在实践中这到底是怎么一回事呢？
每一个 promise 都会提供给你一个 then() 函数 (或是 catch()，实际上只是 then(null, ...) 的语法糖)。
当我们在 then() 函数内部时：

有三种事情：

1. return 另一个 promise
2. return 一个同步的值 (或者 undefined)
3. throw 一个同步异常


### 进阶错误


**#1：不知道 Promise.resolve()**


用来捕获同步异常时也极其的好用。由于它实在是好用，因此我已经养成了在我所有 promise 形式的 API 接口中这样使用它：
```
function somePromiseAPI() {
  return Promise.resolve().then(function () {
    doSomethingThatMayThrow();
    return 'foo';
  }).then(/* ... */);}
```

切记：任何有可能 throw 同步异常的代码都是一个后续会导致几乎无法调试异常的潜在因素。但是如果你将所有代码都使用 Promise.resolve() 封装，那么你总是可以在之后使用 catch() 来捕获它。类似的，
还有 Promise.reject() 你可以用来返回一个立刻返回失败的 promise。


**#3：promises vs promises factories**

当我们希望执行一个个的执行一个 promises 序列，即类似 Promise.all() 但是并非并行的执行所有 promises。
```
function executeSequentially(promises) {
  var result = Promise.resolve();
  promises.forEach(function (promise) {
    result = result.then(promise);
  });
  return result;
}
```
正确打开方式：
```

function executeSequentially(promiseFactories) {
  var result = Promise.resolve();
  promiseFactories.forEach(function (promiseFactory) {
    result = result.then(promiseFactory);
  });
  return result;
}
  
function myPromiseFactory() {
  return somethingThatCreatesAPromise();
}
```
then内 应返回一个 新的Promise函数 而不是简单执行函数。
实际上，一个 promises factory 是十分简单的，它仅仅是一个可以返回 promise 的函数


**#4：好了，如果我希望获得两个 promises 的结果怎么办**

这样是没问题的，但是我个人认为这样做有些杂牌。我推荐的策略是抛弃成见，拥抱金字塔：
```
getUserByName('nolan').then(function (user) {
  return getUserAccountById(user.id).then(function (userAccount) {
    // okay, I have both the "user" and the "userAccount"
  });
});
```

**#5：promises 穿透**
```
Promise.resolve('foo').then(null).then(function (result) {
  console.log(result);
});
```

添加任意数量的 then(null)，它依然会打印 foo。


then() 是期望获取一个函数，因此你希望做的最可能是：

```
Promise.resolve('foo').then(function () {
  return Promise.resolve('bar');}).then(function (result) {
  console.log(result);
});
```