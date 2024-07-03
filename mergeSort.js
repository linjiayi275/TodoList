let fakeStorage = [
  {todo: 'a', todoMonth: '3', todoDate: '1'},
  {todo: 'b', todoMonth: '12', todoDate: '14'},
  {todo: 'c', todoMonth: '3', todoDate: '2'},
  {todo: 'd', todoMonth: '3', todoDate: '2'},
  {todo: 'e', todoMonth: '5', todoDate: '4'}
  // {todo: 'f', todoMonth: '5', todoDate: '12'}
  // {todo: 'g', todoMonth: '1', todoDate: '4'},
  // {todo: 'h', todoMonth: '5', todoDate: '2'}
]

// 合併
function mergeTime(arr1,arr2) {
  let result = [];
  // console.log('result 1',result);
  let i = 0, j = 0; //arr1的index為i，arr2的index為j
  // 當i<arr1的長度，並且j<arr2的長度，執行此迴圈
  while(i<arr1.length && j<arr2.length){
    //如果arr1的index(也就是i)的月份>arr2的index(也就是j)的月份，將arr2目前的值(arr2[j])放入result，再將j+1(把arr2的index向後移一位)
    if(Number(arr1[i].todoMonth) > Number(arr2[j].todoMonth)){
      result.push(arr2[j]);
      j++;
    }//如果arr1的index(也就是i)的月份<arr2的index(也就是j)的月份，將arr1目前的值(arr1[i])放入result，再將i+1(把arr1的index向後移一位)
    else if(Number(arr1[i].todoMonth) < Number(arr2[j].todoMonth)){
      result.push(arr1[i]);
      i++;
    }//如果arr1的index(i)的月份=arr2的index(j)的月份，就比較arr1的index(也就是i)的日期與arr2的index(也就是j)的日期
    else if(Number(arr1[i].todoMonth) == Number(arr2[j].todoMonth)){
      //如果arr1的index(也就是i)的日期>arr2的index(也就是j)的日期，將arr2目前的值(arr2[j])放入result，再將j+1(把arr2的index向後移一位)
      if(Number(arr1[i].todoDate) > Number(arr2[j].todoDate)){
        result.push(arr2[j]);
        j++;
      }//如果arr1的index(也就是i)的日期<arr2的index(也就是j)的日期，將arr1目前的值(arr1[i])放入result，再將i+1(把arr1的index向後移一位)
      else{
        result.push(arr1[i]);
        i++;
      }
    }
  }

  // 如果arr1的index(也就是i)<arr1的長度，代表arr1這個陣列還有殘留值，所以要將其放入result中，每次放入一個值就將i+1(把arr1的index向後移一位)，直到arr1的index(也就是i)=arr1的長度，就會跳出此迴圈
  // 殘留的值，都是已經排序過的，所以並不需要再次排序
  while (i<arr1.length) {
    result.push(arr1[i]);
    i++;
  }

  // 如果arr2的index(也就是j)<arr2的長度，代表arr2這個陣列還有殘留值，所以要將其放入result中，每次放入一個值就將j+1(把arr2的index向後移一位)，直到arr2的index(也就是j)=arr2的長度，就會跳出此迴圈
  // 殘留的值，都是已經排序過的，所以並不需要再次排序
  while (j<arr2.length){
    result.push(arr2[j]);
    j++;
  }
  console.log('result 2',result);
  return result;
}

// 拆分
function mergeSort(arr) {
  if (arr.length === 1) {
    return arr;
  }else{
    let middle = Math.floor(arr.length / 2);
    let left = arr.slice(0,middle);
    let right = arr.slice(middle, arr.length);
    console.log(left,right);
    // console.log('mergeTime',mergeTime(mergeSort(left),mergeSort(right)));
    return mergeTime(mergeSort(left),mergeSort(right)); //遞迴演算法
    // 執行流程：
    // 陣列對切一次後，分成前後兩個陣列
    // 先處理前陣列：前陣列一樣繼續切，直到每個長度都為1
    //             ，然後執行function mergeTime() → 排序並合併前陣列
    // 再處理後陣列：後陣列一樣繼續切，直到每個長度都為1
    //             ，然後執行function mergeTime() → 排序並合併後陣列
    // 最後處理前後陣列：執行function mergeTime() → 排序並合併後陣列
    // 完成
  }
}

console.log('排序後:',mergeSort(fakeStorage));

