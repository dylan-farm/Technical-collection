// 浅拷贝实现
var shallowCopy = function(obj) {
  // 只拷贝对象
  if (typeof obj !== "object") return;
  // 过滤 null
  if (!data) return data;
  // 在typeof data === "object" && data !== null情况下，确定newData的类型
  const newData = data instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};



// 深拷贝实现
const deepCopy = function(data) {
  if (typeof data !== "object") return;
  // 过滤 null
  if (!data) return data;
  // 在typeof data === "object" && data !== null情况下，确定newData的类型
  const newData = data instanceof Array ? [] : {};
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      const o = data[key];
      newData[key] = typeof o === "object" ? deepCopy(o) : o;
    }
  }
  return newData;
};
const n = {
  c: 12,
  d: null,
  a: [],
  b: undefined,
  fuc: function() {},
  obj: {
    name: "23"
  }
};
const v = deepCopy(n);
v.c = 2;
v.obj.name = "45";
console.log(n);
console.log(v);

// 性能问题
// 尽管使用深拷贝会完全的克隆一个新对象，不会产生副作用，但是深拷贝因为使用递归，性能会不如浅拷贝，在开发中，还是要根据实际情况进行选择。




// 其他手段实现 深拷

// 1 创建对象副本的最古老方法之一是：将该对象转换为其 JSON 字符串表示形式，然后将其解析回对象。
// 优点：简单粗暴，满足日常应用
// 缺点：
// 1不能拷贝函数
// 2 不能处理循环对象。而且循环对象经常发生。例如，当您构建树状数据结构，其中一个节点引用其父级，而父级又引用其子级。
// const x = {};
// const y = { x };
// x.y = y;
// 3 诸如 Map, Set, RegExp, Date, ArrayBuffer 和其他内置类型在进行序列化时会丢失。

const copy = JSON.parse(JSON.stringify(obj));

// MessageChannel 它是异步的
function structuralClone(obj) {
  return new Promise(resolve => {
    const { port1, port2 } = new MessageChannel();
    port2.onmessage = ev => resolve(ev.data);
    port1.postMessage(obj);
  });
}
const obj1 = { a: 2 };
const clone = await structuralClone(obj1);

// History API
// 缺点：仅仅为了复制一个对象，而使用浏览器的引擎，感觉有点过分。另外，Safari 浏览器对replaceState调用的限制数量为 30 秒内 100 次。
function historyStructuralClone(obj) {
  const oldState = history.state;
  history.replaceState(obj, document.title);
  const copy = history.state;
  history.replaceState(oldState, document.title);
  return copy;
}
const obj2 = { c: 12 };
const clone = historyStructuralClone(obj2);

// Notification API 需要浏览器内部的权限机制，它是可能很慢
function notificationStructuralClone(obj) {
  return new Notification("", { data: obj, silent: true }).data;
}
const obj3 = { d: 45 };
const clone = notificationStructuralClone(obj3);
