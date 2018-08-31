// 7 https://leetcode.com/problems/reverse-integer/description/

var reverse = function (x) {
  x = x * 1
  if (typeof x !== 'number' || !x) return 0
  var f = x >= 0 ? 1 : (-1)
  var rs = (x * f).toString().split('').reverse().join('') * f
  return (rs >= -2147483648 && rs <= 2147483648) ? rs : 0
};