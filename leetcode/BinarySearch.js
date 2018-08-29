// 二分法查找目标索引
var BinarySearch = function(arr, target) {
  let s = 0;
  let e = arr.length - 1;
  let m = Math.floor((s + e) / 2);
  let sortTag = arr[s] <= arr[e]; //确定排序顺序
  while (s < e && arr[m] !== target) {
    if (arr[m] > target) {
      sortTag ? (e = m - 1) : (s = m + 1);
    } else {
      sortTag ? (s = m + 1) : (e = m - 1);
    }
    m = Math.floor((s + e) / 2);
    console.log(s, e, m);
  }
  if (arr[m] == target) {
    console.log("数组中存在此元素,索引=>%s,值=>%s", m, arr[m]);
    return m;
  } else {
    console.log("数组中无此元素");
    return -1;
  }
};

let arr = [88, 77, 66, 55, 44, 33, 22, 21, 12, 11, 5];
const c = BinarySearch(arr, 77);
console.log(c);
