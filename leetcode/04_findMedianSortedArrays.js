// 4 https://leetcode.com/problems/median-of-two-sorted-arrays/

var findMedianSortedArrays = function(nums1, nums2) {
  const arr = [...nums1, ...nums2];
  const narr = arr.sort((a, b) => {
    return a - b;
  });
  const len = narr.length,
    n = len % 2,
    i = len / 2;
  const rs = n > 0 ? narr[Math.floor(i)] : (narr[i] + narr[i - 1]) / 2;
  return rs;
};
var nums1 = [1, 3],
  nums2 = [3.5, 4, 5];
var c = findMedianSortedArrays(nums1, nums2);
console.log(c);
