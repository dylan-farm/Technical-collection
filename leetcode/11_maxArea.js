// 1 https://leetcode.com/problems/container-with-most-water/description/

var maxArea = function(height) {
  var maxArea = 0,
    l = 0,
    r = height.length - 1;
  while (l < r) {
    var lh = height[l],
      rh = height[r];
    maxArea = Math.max(maxArea, Math.min(lh, rh) * (r - l));
    lh < rh ? l++ : r--;
  }
  return maxArea;
};
var height = [1, 8, 6, 2, 5, 4, 8, 3, 7];
var c = maxArea(height);
console.log(c);
