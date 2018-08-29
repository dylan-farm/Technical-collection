// 1 https://leetcode.com/problems/two-sum/

var twoSum = function(nums, target) {
  for (var i = 0; i < nums.length; i++) {
    for (var j = i + 1; j < nums.length; j++) {
      if (target - nums[i] === nums[j]) {
        return [i, j];
        break;
      }
    }
  }
};
var c = twoSum([2, 11, 7, 15], 9);
console.log(c);
