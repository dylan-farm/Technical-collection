// 5 https://leetcode.com/problems/longest-palindromic-substring/description/
var longestPalindrome = function(s) {
  if (typeof s !== "string" || !s) return "";
  var i = 0,
    len = s.length;
  var longest = 0,
    ind = 0;
  while (i < len && longest / 2 <= len - i - 1) {
    // odd
    var j = 1;
    var l = 1;
    while (j <= i) {
      var m = i + j,
        n = i - j;
      if (s[m] == s[n]) {
        l += 2;
      } else {
        break;
      }
      j++;
    }
    l > longest && (longest = l) && (ind = i);
    console.log("odd", i, longest);
    // even
    var i2 = i + 1;
    if (s[i] == s[i2]) {
      var j2 = 1;
      var l2 = 2;
      while (j2 <= i) {
        var m2 = i2 + j2,
          n2 = i - j2;
        if (s[m2] == s[n2]) {
          l2 += 2;
        } else {
          break;
        }
        j2++;
      }
      l2 > longest && (longest = l2) && (ind = i);
    }
    console.log("even", i, longest);
    i++;
  }
  var t = longest % 2 > 0,
    z = (t ? longest - 1 : longest - 2) / 2;
  var start = ind - z,
    end = t ? ind + z : ind + 1 + z;
  console.log("result", ind, longest, z, start, end);
  return s.substring(start, end + 1) || "";
};
var s = "cccc",
  c = longestPalindrome(s);
console.log(c);
