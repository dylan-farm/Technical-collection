// 15 https://leetcode.com/problems/3sum/description/

var threeSum = function (nums) {
  nums = nums.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
  const len = nums.length, res = []
  let i = 0
  while (i < len - 2) {
    if (nums[i] === nums[i - 1]) {
      i++
      continue;
    }
    let l = i + 1, r = len - 1
    while (l < r) {
      const s = nums[i]
      const s1 = nums[l]
      const s2 = nums[r]
      if (s + s1 > -s2) {
        r--
      } else if (s + s1 < -s2) {
        l++
      } else {
        res.push([s, s1, s2])
        while (nums[l] === nums[l + 1]) {
          l++;
        }
        while (nums[r] === nums[r - 1]) {
          r--;
        }
        l++; r--;
      }
    }
    i++
  }
  return res
};
var nums = [-1, 0, 1, 2, -1, -4]
var c = threeSum(nums)
console.log(c)
