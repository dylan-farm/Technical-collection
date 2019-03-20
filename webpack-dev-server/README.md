### webpack-dev-server 简介

> Use webpack with a development server that provides live reloading. This should be used for development only.
> It uses webpack-dev-middleware under the hood, which provides fast in-memory access to the webpack assets.
> 将webpack与提供实时重新加载的开发服务器一起使用。 这应该仅用于开发。
> 它使用了引擎盖下的webpack-dev-middleware，它提供了对webpack资产的快速内存访问。

### webpack-dev-server 应用
 [Getting Started](https://webpack.js.org/configuration/dev-server/#devserver)
### 源码分析解读

#### 1. 结论：热更新的流程
1. webpack在构建项目时会创建服务端（server基于node）和客户端（client通常指浏览器），项目正式启动运行时双方会通过socket保持连接，用来满足前后端实时通讯。
2. 当我们保存代码时，会被webpack监听到文件变化，触发新一轮编译生成新的编译器compiler（就是我们所说的Tapable实例。它混合在一起Tapable来吸收功能来注册和调用插件本身，可以理解为一个状态机。）。
3. 在compiler的’done’钩子函数（生命周期）里调用`_sendStats`发放向client发送`ok`或`warning`消息，并同时发送向client发送hash值，在client保存下来。
4. client接收到`ok`或`warning`消息后调用`reloadApp`发布客户端检查更新事件（`webpackHotUpdate`）
5. webpack/hot部分监听到`webpackHotUpdate`事件，调用`check`方法进行hash值对比以及检查各modules是否需要更新。如需更新会调用`hotDownloadManifest`方法下载json（manifest）文件。
6. `hotDownloadManifest`完成后调用`hotDownloadUpdateChunk`方法，通过jsonp的方式加载最新的chunk，之后分析对比文件进行文件的更新替换，完成整个热更新流程。

**注：以下源码分析采用倒叙分析方式**
#### 2. webpack/hot 源码解读
在webpack构建项目时，webpack-dev-server会在编译后js文件加上两个依赖文件：
```
/***/ 
(function(module, exports, __webpack_require__) {
  // 建立socket连接，保持前后端实时通讯
  __webpack_require__("./node_modules/webpack-dev-server/client/index.js?http://localhost:8080");
    // dev-server client热更新的方法
  __webpack_require__("./node_modules/webpack/hot/dev-server.js");
  module.exports = __webpack_require__("./src/index.js");
  /***/
})

```
  * [webpack/hot/dev-server.js](https://github.com/webpack/webpack/blob/master/hot/dev-server.js)的文件内容：

    ```
    /*
      MIT License http://www.opensource.org/licenses/mit-license.php
      Author Tobias Koppers @sokra
    */
    /*globals window __webpack_hash__ */
    if (module.hot) {
      var lastHash;
      //__webpack_hash__是每次编译的hash值是全局的，就是放在window上
      var upToDate = function upToDate() {
        return lastHash.indexOf(__webpack_hash__) >= 0;
      };
      var log = require("./log");
      var check = function check() {
        module.hot
          .check(true)  // 这里的check方法最终进入到webpack\lib\HotModuleReplacement.runtime.js文件中
          .then(function(updatedModules) {
            //检查所有要更新的module，如果没有module要更新那么返回null
            if (!updatedModules) {
              log("warning", "[HMR] Cannot find update. Need to do a full reload!");
              log(
                "warning",
                "[HMR] (Probably because of restarting the webpack-dev-server)"
              );
              window.location.reload();
              return;
            }
            //检测时候还有module需要更新，如果有=>check()
            if (!upToDate()) {
              check();
            }
            //打印更新结果，所有需要更新的module和已经被更新的module都是updatedModules
            require("./log-apply-result")(updatedModules, updatedModules);

            if (upToDate()) {
              log("info", "[HMR] App is up to date.");
            }
          })
          .catch(function(err) {
            //如果报错直接全局reload
            var status = module.hot.status();
            if (["abort", "fail"].indexOf(status) >= 0) {
              log(
                "warning",
                "[HMR] Cannot apply update. Need to do a full reload!"
              );
              log("warning", "[HMR] " + (err.stack || err.message));
              window.location.reload();
            } else {
              log("warning", "[HMR] Update failed: " + (err.stack || err.message));
            }
          });
      };
      //获取MyEmitter对象
      var hotEmitter = require("./emitter");
      //监听‘webpackHotUpdate’事件
      hotEmitter.on("webpackHotUpdate", function(currentHash) {
        lastHash = currentHash;
        //根据两点判断是否需要检查modules以及更新
        // 1 对比服务端传过来的最新hash值和客户端的__webpack_hash__是否一致
        // 2 调用module.hot.status方法获取状态 是否为 ‘idle’
        if (!upToDate() && module.hot.status() === "idle") {
          log("info", "[HMR] Checking for updates on the server...");
          check();
        }
      });
      log("info", "[HMR] Waiting for update signal from WDS...");
    } else {
      throw new Error("[HMR] Hot Module Replacement is disabled.");
    }

    ```

 *  加载最新chunk的源码分析：
    * 方法调用关系：`module.hot.check`=>`HotModuleReplacement`=>`hotDownloadManifest`=>`hotEnsureUpdateChunk`=>`hotDownloadUpdateChunk`
    * [HotModuleReplacement](https://github.com/webpack/webpack/blob/master/lib/HotModuleReplacement.runtime.js)模块内容:  
      ```
      ...
      function hotCheck(apply) {
        ...
        return hotDownloadManifest(hotRequestTimeout).then(function(update) {
          ...
          // 获取到manifest后通过jsonp加载最新的chunk 
          /*foreachInstalledChunks*/
          // eslint-disable-next-line no-lone-blocks
          {
            /*globals chunkId */
            hotEnsureUpdateChunk(chunkId);
          }
          ...
        });
      }
      ...

      function hotEnsureUpdateChunk(chunkId) {
        if (!hotAvailableFilesMap[chunkId]) {
          hotWaitingFilesMap[chunkId] = true;
        } else {
          hotRequestedFilesMap[chunkId] = true;
          hotWaitingFiles++;
          hotDownloadUpdateChunk(chunkId);
        }
      }
      ```
    * webpack会根据不同运行环境调用对应的方法
    `hotDownloadManifest`
    `hotDownloadUpdateChunk`
    来加载chunk： [node](https://github.com/webpack/webpack/blob/master/lib/node/NodeMainTemplateAsync.runtime.js)/ [webworker](https://github.com/webpack/webpack/blob/master/lib/webworker/WebWorkerMainTemplate.runtime.js)/ [web](https://github.com/webpack/webpack/blob/master/lib/web/JsonpMainTemplate.runtime.js)
    我们主要考虑web环境下的方法就可以
      ```
      // eslint-disable-next-line no-unused-vars
      function webpackHotUpdateCallback(chunkId, moreModules) {
        //...
      } 
      //$semicolon

      // eslint-disable-next-line no-unused-vars
      //jsonp方法加载chunk
      function hotDownloadUpdateChunk(chunkId) {
        var script = document.createElement("script");
        script.charset = "utf-8";
        script.src = $require$.p + $hotChunkFilename$;
        if ($crossOriginLoading$) script.crossOrigin = $crossOriginLoading$;
        document.head.appendChild(script);
      }

      // eslint-disable-next-line no-unused-vars
      function hotDownloadManifest(requestTimeout) {
        //...
      }
      ```


  * [log-apply-result](https://github.com/webpack/webpack/blob/master/hot/log-apply-result.js)模块内容:
    ```

    /*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
    */
    module.exports = function(updatedModules, renewedModules) {
      //renewedModules表示哪些模块被更新了，剩余的模块表示，哪些模块由于 ignoreDeclined，ignoreUnaccepted配置没有更新
      var unacceptedModules = updatedModules.filter(function(moduleId) {
        return renewedModules && renewedModules.indexOf(moduleId) < 0;
      });
      var log = require("./log");
      //哪些模块无法HMR，打印log
      //哪些模块由于某种原因没有更新成功。其中没有更新的原因可能是如下的:
      //  ignoreUnaccepted
      //  ignoreDecline
      //  ignoreErrored
      if (unacceptedModules.length > 0) {
        log(
          "warning",
          "[HMR] The following modules couldn't be hot updated: (They would need a full reload!)"
        );
        unacceptedModules.forEach(function(moduleId) {
          log("warning", "[HMR]  - " + moduleId);
        });
      }
      //没有模块更新，表示模块是最新的
      if (!renewedModules || renewedModules.length === 0) {
        log("info", "[HMR] Nothing hot updated.");
      } else {
        log("info", "[HMR] Updated modules:");
        //更新的模块
        renewedModules.forEach(function(moduleId) {
          if (typeof moduleId === "string" && moduleId.indexOf("!") !== -1) {
            var parts = moduleId.split("!");
            log.groupCollapsed("info", "[HMR]  - " + parts.pop());
            log("info", "[HMR]  - " + moduleId);
            log.groupEnd("info");
          } else {
            log("info", "[HMR]  - " + moduleId);
          }
        });
        //每一个moduleId都是数字那么建议使用NamedModulesPlugin
        var numberIds = renewedModules.every(function(moduleId) {
          return typeof moduleId === "number";
        });
        if (numberIds)
          log(
            "info",
            "[HMR] Consider using the NamedModulesPlugin for module names."
          );
      }
    };
    ```
#### 3. webpack-dev-server源码解读
**webpack构建过程触发module更新的时机**
  * [webpack-dev-server客户端源码的关键部分](https://github.com/webpack/webpack-dev-server/blob/master/client-src/default/index.js)
    ```
    ...
    ...
    const onSocketMsg = {
    ...
      ok() {
        sendMsg('Ok');
        if (useWarningOverlay || useErrorOverlay) overlay.clear();
        if (initial) return (initial = false); // eslint-disable-line no-return-assign
        reloadApp();
      },
      warnings(warnings) {
        log.warn('[WDS] Warnings while compiling.');
        const strippedWarnings = warnings.map((warning) => stripAnsi(warning));
        sendMsg('Warnings', strippedWarnings);
        for (let i = 0; i < strippedWarnings.length; i++) {
          log.warn(strippedWarnings[i]);
        }
        if (useWarningOverlay) overlay.showMessage(warnings);

        if (initial) return (initial = false); // eslint-disable-line no-return-assign
          reloadApp();
        },
      ...
      };

    ...

    function reloadApp() {
      if (isUnloading || !hotReload) {
        return;
      }
      if (hot) {
        log.info('[WDS] App hot update...');
        // eslint-disable-next-line global-require
        const hotEmitter = require('webpack/hot/emitter');
        hotEmitter.emit('webpackHotUpdate', currentHash);
        //重新启动webpack/hot/emitter，同时设置当前hash
        if (typeof self !== 'undefined' && self.window) {
          // broadcast update to window
          self.postMessage(`webpackHotUpdate${currentHash}`, '*');
        } 
      } else {
        //如果不是Hotupdate那么我们直接reload我们的window就可以了
        let rootWindow = self;
        // use parent window for reload (in case we're in an iframe with no valid src)
        const intervalId = self.setInterval(() => {
          if (rootWindow.location.protocol !== 'about:') {
            // reload immediately if protocol is valid
            applyReload(rootWindow, intervalId);
          } else {
            rootWindow = rootWindow.parent;
            if (rootWindow.parent === rootWindow) {
              // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
              applyReload(rootWindow, intervalId);
            }
          }
        });
    }
    function applyReload(rootWindow, intervalId) {
      clearInterval(intervalId);
      log.info('[WDS] App updated. Reloading...');
      rootWindow.location.reload();
    }
    ```
    根据以上代码 可以看出：当客户端接收到服务器端发送的ok和warning信息的时候，同时支持HMR的情况下就会要求检查更新，同时还收到服务器端本次编译的hash值。**我们再看一下服务端是在什么时机发送’ok’和’warning’消息。**
  * [webpack-dev-server服务端源码的关键部分](https://github.com/webpack/webpack-dev-server/blob/master/lib/Server.js)

    ```
    class Server {
      ...
      _sendStats(sockets, stats, force) {
        if (
          !force &&
          stats &&
          (!stats.errors || stats.errors.length === 0) &&
          stats.assets &&
          //每一个asset都是没有emitted属性，表示没有发生变化。如果发生变化那么这个assets肯定有emitted属性
          stats.assets.every((asset) => !asset.emitted)
        ) {
          
          return this.sockWrite(sockets, 'still-ok');
        }
        //设置hash
        this.sockWrite(sockets, 'hash', stats.hash);

        if (stats.errors.length > 0) {
          this.sockWrite(sockets, 'errors', stats.errors);
        } else if (stats.warnings.length > 0) {
          this.sockWrite(sockets, 'warnings', stats.warnings);
        } else {
          this.sockWrite(sockets, 'ok');
        }
      }
      ...
    }
    ```
    上面的代码是发送‘ok’和‘warning’消息的方法，那具体在什么时机调用此方法呢?
    ```
    class Server {
      constructor(compiler, options = {}, _log) {
        ...
        const addHooks = (compiler) => {
          const { compile, invalid, done } = compiler.hooks;

          compile.tap('webpack-dev-server', invalidPlugin);
          invalid.tap('webpack-dev-server', invalidPlugin);
          done.tap('webpack-dev-server', (stats) => {
            this._sendStats(this.sockets, stats.toJson(STATS));
            this._stats = stats;
          });
        };

        if (compiler.compilers) {
          compiler.compilers.forEach(addHooks);
        } else {
          addHooks(compiler);
        }
        ...
      }
    ...
    }
    ```
    再看这部分代码，就可以理解了，每次在compiler的’done’钩子函数（生命周期）被调用的时候就会通过socket向客户端发送消息，要求客户端去检查模块更新完成HMR工作。

最近正处于换工作阶段，有些闲暇时间，正好拔草，之前工作的过程就很想看一下webpack-dev-server 的实现原理，趁此机会粗略学习了一下它的源码，有什么不对的地方还望指教，互相学习，加深理解。