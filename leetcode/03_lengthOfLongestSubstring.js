// 3 https://leetcode.com/problems/longest-substring-without-repeating-characters/

var lengthOfLongestSubstring = function(s) {
  var result = 0,
    n = s.length,
    i = 0,
    j = 0;
  for (var i = 0; i < n; i++) {
    for (var j = i; j < n; j++) {
      if (i != j && s.substring(i, j).indexOf(s[j]) >= 0) {
        break;
      }
      result = Math.max(result, j - i + 1);
    }
  }
  return result;
};
var s = "aa"; // '' ' ' 'aads'
var c = lengthOfLongestSubstring(s);
console.log(c);
