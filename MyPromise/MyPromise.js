const states = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED"
};
function MyPromise(fn) {
  const { PENDING, RESOLVED, REJECTED } = states;
  const _this = this;
  _this.state = PENDING;
  _this.value = null;
  _this.resolvedCallBacks = [];
  _this.rejectedCallBacks = [];

  try {
    fn(resolve, reject);
  } catch (error) {
    reject(error);
  }

  function resolve(value) {
    if (_this.state == PENDING) {
      _this.state = RESOLVED;
      _this.value = value;
      _this.resolvedCallBacks.map(cb => (_this.value = cb(_this.value)));
    }
  }
  function reject(value) {
    if (_this.state == PENDING) {
      _this.state = REJECTED;
      _this.value = value;
      _this.rejectedCallBacks.map(cb => (_this.value = cb(_this.value)));
    }
  }
}
MyPromise.prototype.then = function(onFulfilled, onRejected) {
  const _this = this;
  const { PENDING, RESOLVED, REJECTED } = states;
  onFulfilled = typeof onFulfilled == "function" ? onFulfilled : c => c;
  onRejected =
    typeof onRejected == "function"
      ? onRejected
      : c => {
          throw c;
        };
  switch (_this.state) {
    case PENDING:
      _this.resolvedCallBacks.push(onFulfilled);
      _this.rejectedCallBacks.push(onRejected);
      break;
    case RESOLVED:
      onFulfilled(_this.value);
      break;
    case REJECTED:
      onRejected(_this.value);
      break;
    default:
  }
  return _this;
};

new MyPromise(resolve => {
  setTimeout(() => {
    resolve(1);
  }, 2000);
})
  .then(res => {
    console.log(res);
    return 2;
  })
  .then(reg => console.log(reg));
