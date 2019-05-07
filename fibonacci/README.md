#### 方法 1  最直观的解题思路

```javascript
function fibonacci(n) {
  var num1 = 1,
    num2 = 1,
    sum;
  for (var i = 3; i <= n; i += 1) {
    sum = num1 + num2;
    num1 = num2;
    num2 = sum;
  }
  return sum;
}
//稍微改进一下以上的方法
function fibonacci(n) {
  var num1 = 1,
    num2 = 1,
    num3;
  var arr = [1, 1];
  for (var i = 3; i <= n; i++) {
    num3 = num1 + num2;
    num1 = num2;
    num2 = num3;
    arr.push(num3);
  }
  return arr;
}
```

#### 方法 2  使用递归的方法, 但是当数字过大时浏览器会出现假死现象。毕竟递归需要堆栈，数字过大内存不够。

```javascript
function result(n) {
  if (n == 1 || n == 2) {
    return 1;
  }
  return result(n - 2) + result(n - 1);
}
//同样使用递归，只不过使用了三元表达式。
var fib = function(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
};
for (var i = 0; i <= 10; i += 1) {
  console.log(fib(i));
}
```

#### 方法 3  使用 ES6 中的 generator

```javascript
function* fib(x) {
  let a = 1;
  let b = 1;
  let n = 0;
  while (n <= x) {
    yield a;
    [a, b] = [b, a + b];
    n++;
  }
}
console.log(fib(5));
```
