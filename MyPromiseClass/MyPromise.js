// 极简版Promise 满足的使用方式
// - 生成实例对象的方式：`new MyPromise()`
// - 通过类直接调用静态方法：`MyPromise.resolve()`，目前静态方法仅支持`resolve` & `reject`

class MyPromise {
  constructor(fn) {
    // 定义Promise 三种状态
      this.states = {
          PENDING: 'PENDING', RESOLVED: 'RESOLVED', REJECTED: 'REJECTED'
      }
      // 定义传递到then的value
      this.value = null
      // 定义当前Promise运行状态
      this.state = this.states.PENDING
      // 定义Promise失败状态的回调函数集合
      this.resolvedCallBacks = []
      // 定义Promise成功状态的回调函数集合
      this.rejectedCallBacks = []
      // 为静态方法定义其内部使用的指向实例的that  
      MyPromise.that = this
      try {
      // 执行 new MyPromise() 内传入的方法
          fn(MyPromise.resolve, MyPromise.reject)
      } catch (error) {
          MyPromise.reject(this.value)
      }
  }
    // 静态resolve方法，MyPromise实例不可访问；
    //支持类MyPromise访问，例：MyPromise.resolve('success').then(e=>e)
  static resolve(value) {
      // 由于静态方法内部的this指向 类 而不是 实例，所以用下面的方法访问实例对象
      const that = MyPromise.that
      // 判断是否是MyPromise实例访问resolve
      const f = that instanceof MyPromise
      // MyPromise实例对象访问resolve
      if (f && that.state == that.states.PENDING) {
          that.state = that.states.RESOLVED
          that.value = value
          that.resolvedCallBacks.map(cb => (that.value = cb(that.value)))
      }
      // MyPromise类访问resolve
      if (!f) {
          const obj = new MyPromise()
          return Object.assign(obj, {
              state: obj.states.RESOLVED,
              value
          })
      }
  }
   // 静态reject方法，MyPromise实例不可访问；
   //支持类MyPromise访问，例：MyPromise.reject('fail').then(e=>e)
  static reject(value) {
      const that = MyPromise.that
      const f = that instanceof MyPromise
      if (f && that.state == that.states.PENDING) {
          that.state = that.states.REJECTED
          that.value = value
          that.rejectedCallBacks.map(cb => (that.value = cb(that.value)))
      }
      if (!f) {
          const obj = new MyPromise()
          return Object.assign(obj, {
              state: obj.states.REJECTED,
              value
          })
      }
  }
  // 定义在MyPromise原型上的then方法
  then(onFulfilled, onRejected) {
      const { PENDING, RESOLVED, REJECTED } = this.states
      const f = typeof onFulfilled == "function" ? onFulfilled : c => c;
      const r =
          typeof onRejected == "function"
              ? onRejected
              : c => {
                  throw c;
              };

      switch (this.state) {
          case PENDING:
              // ‘PENDING’状态下向回调函数集合添加callback
              this.resolvedCallBacks.push(f)
              this.rejectedCallBacks.push(r)
              break;
          case RESOLVED:
              // 将回调函数的返回值赋值给 实例的 value，满足链式调用then方法时传递value
              this.value = f(this.value)
              break;
          case REJECTED:
              // 同上
              this.value = r(this.value)
              break;
          default:
              break;
      }
      // 满足链式调用then，返回MyPromise实例对象
      return this
  }
}

MyPromise.resolve('success').then((e) => {
  console.log(e);
  return e + 1
}).then( res=> {
  console.log(res);
})
new MyPromise(resolve => {
  setTimeout(() => {
      resolve(1);
  }, 2000);
})
  .then(res1 => {
      console.log(res1);
      return 2;
  })
  .then(res2 => console.log(res2 ));