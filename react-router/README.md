#### 简介
> React-Router 是基于history这个库，来实现对路由变化的监听，所以我们先对这个库进行简单的分析.

#### history(第三方库)
我们查看modules下面的[index.js](https://github.com/ReactTraining/history/blob/master/modules/index.js)的源码，可以看出history 暴露出了七个方法:

```
export { default as createBrowserHistory } from './createBrowserHistory';
export { default as createHashHistory } from './createHashHistory';
export { default as createMemoryHistory } from './createMemoryHistory';
export { createLocation, locationsAreEqual } from './LocationUtils';
export { parsePath, createPath } from './PathUtils';
```

BrowserRouter , 其history 引用的是 [createBrowserHistory](https://github.com/ReactTraining/history/blob/master/modules/createBrowserHistory.js) 方法，所以我们接下来主要分析这个方法.

```
  const history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref,
    push,
    replace,
    go,
    goBack,
    goForward,
    block,
    listen
  };

  return history;   
```

分析其中几个重要的方法
##### listen

listen 是一个最主要的方法，在Router 组件中有引用，其是实现路由监听的功能，也就是观察者 模式.

```
function listen(listener) {
    const unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);

    return () => {
      checkDOMListeners(-1);
      unlisten();
    };
  }
```

checkDOMListeners 方法，是真正实现了路由切换的事件监听：

```
const PopStateEvent = 'popstate';
const HashChangeEvent = 'hashchange';

// ...

 function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(PopStateEvent, handlePopState);

      if (needsHashChangeListener)
        window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);

      if (needsHashChangeListener)
        window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }
```

其中window 监听了两种事件: popstate 和hashchange,这两个事件都是HTML5中的API，也就是原生的监听URL变化的事件.

```

  function setState(nextState) {
    Object.assign(history, nextState);
    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if (isExtraneousPopstateEvent(event)) return;
    handlePop(getDOMLocation(event.state));
  }

  function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  }

  let forceNextPop = false;

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      const action = 'POP';

      transitionManager.confirmTransitionTo(
        location,
        action,
        getUserConfirmation,
        ok => {
          if (ok) {
            setState({ action, location });
          } else {
            revertPop(location);
          }
        }
      );
    }
  }

```

以上代码可看出：分析事件监听的回调函数handlePopState ,其最终是听过setState 来触发路由监听者。

其中notifyListeners 会调用所有的listen 的回调函数，从而达到通知监听路由变化的监听者

#### history在React-Router中如何应用

##### [Router组件](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/Router.js)

在 constructor 中注册了对history 路由变更的监听，并且在监听后去变更state中的location。

```
 this.unlisten = props.history.listen(location => {
        if (this._isMounted) {
          this.setState({ location });
        } else {
          this._pendingLocation = location;
        }
      });
```
在componentWillUnmount（组件销毁时）注销监听。


**由此分析，Router最主要的功能就是去注册监听history 路由的变更，然后重新render 组件。**

##### [Switch组件](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/Switch.js)

查看源码会发现最明显的一块代码就是:` React.Children.forEach` ， 去遍历Switch 下面的所有的children, 然后根据path 去匹配对应的children, 然后将匹配到的children render 出来。
Switch 的主要功能就是根据path 匹配上对应的children, 然后去Render 一个元素`React.cloneElement(child, { location, computedMatch: match })`


而Switch 的所有的Children 是一个Route 组件，我们接下来就要分析这个组件的源代码。

##### [Route组件](https://github.com/ReactTraining/react-router/blob/master/packages/react-router/modules/Route.js)

**分析`render`方法：**


从`render`方法可以知道，其中有三个重要props, 决定了怎么去render 一个路由。

1. component (直接传递一个组件， 然后去render 组件)
2. render (render 是一个方法， 通过方法去render 这个组件)
3. children (如果children 是一个方法， 则执行这个方法， 如果只是一个子元素，则直接render 这个元素)

 在render组件的时候，都会将props 传递给子组件
 `props = {match, location, history, staticContext}` 这些属性在组件中会有很大的用途
 
**使用方式**
从上面的代码可以发现Route的使用方式有四种:

1. <Route exact path="/" component={Home}/> 直接传递一个组件
2. <Route path="/login" render={(props) => <Login {...props} />} /> 使用render 方法
3. <Route path="/category"> <Category/><Route/>
4. <Route path="/category" children={(props) => <Category {...props} />} /> 跟render 使用方式一样

**分析props：**

1. path 很简单，就是一个字符串类型，也就是我们这个路由要匹配的的URL路径.
2. component, 居然是个func 类型， 我们上面分析render 方法，发现conponent 传递的是一个组件.其实React component 其实就是一个function .不管是Class component 或者是一个函数式组件，其实说白了都是function(typeof App === 'function')
3. render, 上面在render 方法也已经分析，其实是通过一个function 来render 一个组件
4. children 上面render 方法也已经分析了
5. computedMatch 是从Switch 传递过来的，就是Switch 组件已经找到对应的match.这个也是Switch 组件的主要功能， 就是用Swtich 包裹所有的Route 组件，在Switch 中已经查找到对应的Route组件了， 不用将Switch 下面的所有的Route 去Render一遍了。也是性能提升的一个方式。
6. strict 从字面上理解是“严格的”,也就是严格模式匹配,对后面的"/" 也是需要匹配上的， 如: <Route strict path="/one/" component={About}/> 只会匹配/one/ 或者/one/two 不会匹配 /one
7. sensitive 用来设置path 匹配是否区分大小写，如果设置了这个值，是区分大小写的，如: <Route sensitive path="/one" component={About}/> 只会匹配/one 不会匹配/One or /ONe
8. location
9. computedMatch, 是一个私有的属性，我们不会使用
10. exact 从字面意义上理解是“精确的”，也就是要精确去匹配路径，
