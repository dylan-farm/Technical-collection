// 9 https://leetcode.com/problems/palindrome-number/description/

var isPalindrome = function(x) {
  x = x.toString();
  var midIndex = Math.floor((x.length - 1) / 2),
    jo = x.length % 2 > 0;
  var i = 1,
    j = 0,
    result = true;
  if (jo) {
    while (i <= midIndex) {
      result = x[midIndex - i] == x[midIndex + i];
      if (!result) break;
      i++;
    }
  } else {
    var midNextIndex = midIndex + 1;
    if (x[midIndex] == x[midNextIndex]) {
      while (j <= midIndex) {
        result = x[midIndex - j] == x[midNextIndex + j];
        if (!result) break;
        j++;
      }
    } else {
      result = false;
    }
  }
  return result;
};
var num = 121,
  c = isPalindrome(num);
console.log(c);
