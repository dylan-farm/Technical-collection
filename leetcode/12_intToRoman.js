// 12 https://leetcode.com/problems/integer-to-roman/description/

var intToRoman = function (num) {
  var obj = [
    {
      value: 1000,
      symbol: "M",
    },
    {
      value: 900,
      symbol: "CM",
    },
    {
      value: 500,
      symbol: "D",
    },
    {
      value: 400,
      symbol: "CD",
    },
    {
      value: 100,
      symbol: "C",
    },
    {
      value: 90,
      symbol: "XC",
    },
    {
      value: 50,
      symbol: "L",
    },
    {
      value: 40,
      symbol: "XL",
    },
    {
      value: 10,
      symbol: "X",
    },
    {
      value: 9,
      symbol: "IX",
    },
    {
      value: 5,
      symbol: "V",
    },
    {
      value: 4,
      symbol: "IV",
    },
    {
      value: 1,
      symbol: "I",
    }
  ]
  var strs = ''
  for (var i = 0; i < obj.length; i++) {
    var item = obj[i]
    while (num >= item.value) {
      num -= item.value;
      strs += item.symbol;
    }
  }
  return strs
};
