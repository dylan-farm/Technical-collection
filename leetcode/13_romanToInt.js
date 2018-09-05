// 13 https://leetcode.com/problems/roman-to-integer/description/

var romanToInt = function(str) {
  var obj = {
    M: 1000,
    D: 500,
    C: 100,
    L: 50,
    X: 10,
    V: 5,
    I: 1
  };
  var num = 0;
  var pre = -1;
  var i = str.length - 1;
  while (i >= 0) {
    let cur = obj[str.charAt(i)];
    num += pre > cur ? -cur : cur;
    pre = cur;
    --i;
  }
  return num;
};
var str = "MCMXCIV";
var c = romanToInt(str);
console.log(c);
