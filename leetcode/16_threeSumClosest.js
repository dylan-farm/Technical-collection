// 16 https://leetcode.com/problems/3sum-closest/description/

var threeSumClosest = function(nums, target) {
  nums = nums.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
  let i = 0,
    len = nums.length,
    targetClosest = null;
  while (i < len - 2) {
    if (nums[i] === nums[i - 1]) {
      i++;
      continue;
    }
    let l = i + 1,
      r = len - 1;
    while (l < r) {
      const s = nums[i];
      const s1 = nums[l];
      const s2 = nums[r];
      const s3 = s + s1 + s2;
      const t1 = Math.abs(s3 - target);
      const t2 = Math.abs(targetClosest - target);
      targetClosest = targetClosest != null && t1 > t2 ? targetClosest : s3;
      if (s3 > target) {
        r--;
      } else if (s3 < target) {
        l++;
      } else {
        break;
      }
    }
    i++;
  }
  return targetClosest;
};
var nums = [0, 1, 2];
var c = threeSumClosest(nums, 0);
console.log(c);
