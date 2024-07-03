/** 我寫的邏輯 =>
 *  ● 第一步：確認localStorage是否有資料，並渲染網頁
 *    第二步：監聽並獲取 以下
 *           1.使用者輸入的資料
 *           2.使用者改變項目勾選狀態、改變active在哪個tab
 *           3.使用者刪除單一項目、刪除所有已完成項目、RESET(clear localStorage)
 *    第三步：將改變的值存入localStorage
 *    第四步：取出localStorage裡需要的值，重新渲染網頁
 *    (確認是否有名稱：function whostodolist =>不會用到 function render，
 *     因為已經寫在function whostodolist裡了)
 *  
 *  ● 除外，
 *    " 時間排序 " 改變時，
 *    先將所需資料(每個item)從localStorage拿出，
 *    並根據使用者選擇的要求做出排序，然後存在暫時的陣列當中，
 *    另外使用不同的render函式來炫染畫面。
 * 
 *  localStorage儲存的資料(key名稱：value內容)會有
 *  1. name：儲存輸入的名字 - 格式：文字
 *  2. (不重複的)number：儲存輸入的待辦事項含以下4個：
 *     Date、ToDo、check、id(與key number相同) - 格式：物件
 *     (ex. {"Date":"2023-01-10","ToDo":"515","check":"","id":2} )
 *  3. currTodoNum：儲存目前用到的id數字為多少 - 格式：數字 
 *  4. UndoItem：儲存目前存於localStorage中 "未完成項目數量" - 格式：數字 
 *  5. ItemNum：儲存目前存於localStorage中 "所有項目數量" - 格式：數字 
 */


// ----------------------------------------------
// 選取需要的element
// ----------------------------------------------
let myName = document.querySelector('.myName');
let choseDate = document.querySelector('.curr');
let enterToDoText = document.querySelector('.enterToDoText');
let addItemBtn = document.querySelector('.addItemBtn');
let sortByTime = document.querySelector('#sortByTime');
// https://hsuchihting.github.io/javascript/20200609/2466460421/
let countUnDone = document.querySelector('.countUnDone');
let deleteAllDone = document.querySelector('.deleteAllDone');
let allItemTab = document.querySelector('.allItemTab');
let UnDoneItemTab = document.querySelector('.UnDoneItemTab');
let DoneItemTab = document.querySelector('.DoneItemTab');
let tabContent = document.querySelector('.tabContent');
let resetBtn = document.querySelector('.reset');

// ----------------------------------------------
// 確認是否有名字並渲染畫面
// ----------------------------------------------

// render
window.addEventListener('load',render);
// set name and render
window.addEventListener('load',whostodolist);




// ----------------------------------------------
// 監聽使用者動作
// ----------------------------------------------

// add item
enterToDoText.addEventListener('keydown',UseEnteradditem);
choseDate.addEventListener('keydown',UseEnteradditem);
addItemBtn.addEventListener('click',UseMouseadditem);

// sort
sortByTime.addEventListener('change',sortItemByTime);

// delete All done
deleteAllDone.addEventListener('click', deleteAllDoneItem);

// mouse click -> add active to the tab that be clicked and render
allItemTab.addEventListener('click', whereActive);
UnDoneItemTab.addEventListener('click', whereActive);
DoneItemTab.addEventListener('click', whereActive);

// checkbox -> check or not
tabContent.addEventListener('click', checkboxChanged);

// delete item
tabContent.addEventListener('click', deleteItem);

// delete all localstorage
resetBtn.addEventListener('click', clearLocalstorage);





// ----------------------------------------------
// 被監聽後呼叫的function
// ----------------------------------------------

// 確認是否有填過名稱，不會用到function render()
function whostodolist() {
  let checkName = localStorage.getItem('name');
  if (checkName == null || checkName == '' || checkName == undefined) {
    // 沒有的話，跳出 prompt 給使用者 enter name
    let setName = prompt("請輸入你的名字","your name");
    if (setName == null) {
      // 點選取消鈕
      alert("請輸入您的暱稱後，並點選確定");
      whostodolist();
    }else {
       // 點選確定鈕
      let nametotrim = setName.trim();
      if (nametotrim == "") {
        alert("請輸入您的暱稱，並點選確定");
        whostodolist();
      }else{
        localStorage.setItem('name',nametotrim);
        myName.innerText = `${nametotrim}'s`;
      }
    }
  }else{
    // 有的話，將localStorage的name render於畫面
    let getName = localStorage.getItem('name');
    myName.innerText = `${getName}'s`;
  }
}

// 使用滑鼠點選"+"，來增加將項目
function UseMouseadditem(e) {
  e.preventDefault(); // 阻止預設事件發生(表單送出去這件事)
  let choseDateValue = choseDate.value;
  let enterToDoTextValue_check = enterToDoText.value.trim(); //trim：去除前後空格
  let enterToDoTextValue = '';

  // 將字串拆開，一個一個確認是否為中文
  [...enterToDoTextValue_check].forEach(word => {
    let pattern = new RegExp("[\u4E00-\u9FA5]+"); //判斷是否為中文，若為中文就不須使用encodeURI
    let check = pattern.test(word) ? word : encodeURI(word); //encodeURI：防止XSS攻擊
    enterToDoTextValue+=check;
  });

  // 確認日期、代辦事項是否有值
  if(choseDateValue == '' && enterToDoTextValue == ''){
    alert('請選擇待辦日期，並輸入待辦事項');
    return;
  }else if(enterToDoTextValue == ''){
    alert('請輸入待辦事項');
    return;
  }else if (choseDateValue == ''){
    alert('請選擇待辦日期');
    return;
  }else{
    // 若有，step1. 先執行checkcurrTodoNum()確認目前key用到數字幾
    let currTodoNum = checkcurrTodoNum();
    let DateAndValue = {
      Date: choseDateValue, //選擇的日期
      ToDo: enterToDoTextValue, //輸入的待辦事項
      check: "", //預設勾選為無
      id: currTodoNum //給此一個id number => 此值剛好為此項目的key
    };
    // step2. 將項目存至localStorage
    localStorage.setItem(currTodoNum,JSON.stringify(DateAndValue));
    countAllItemNum_PlusOne(); //計算目前有多少個項目
    countUndoItem(); //計算目前"未完成"項目有多少
    render();
    enterToDoText.value = ''; //將待辦事項輸入框的value刪除
  }
}

// 使用鍵盤enter，來增加將項目
function UseEnteradditem(e) {
  if (e.key == 'Enter') {
    e.preventDefault(); // 阻止預設事件發生
    addItemBtn.click(); // 此行會執行function UseMouseadditem()
  }
}

// 依照使用者選擇來排序，由近到遠或由遠到近
function sortItemByTime() {
  let optionIndex = sortByTime.options.selectedIndex; //找到目前點選的INDEX
  let optionValue = sortByTime.options[optionIndex].value; //將目前點選的INDEX的值取出

  // 以下使用氣泡排序法
  // switch (optionValue) { //點選的值
  //   case 'chose': //若值為chose，則console.log('chose');
  //     console.log('chose');
  //     break;
  //   case 'neartofar': //若值為neartofar，則以近到遠排序
  //     let start = JSON.parse(localStorage.getItem('currTodoNum'));
  //     let result = [];
  //     for (let i = start; i > 0; i--) {
  //       let item = JSON.parse(localStorage.getItem(`${i}`));
  //       if (item == null) {
  //         continue;
  //       }else{
  //         result.push(item);
  //       }
  //     }
  //     let j = result.length;
  //     while (j>0) {
  //       j--;
  //       for (let i = 0 ; i < result.length-1 ; i++) {
  //         let dateToNum = Number(result[i].Date.replace(/-/g,'')); // 正規表達式 /xxx/g，代表找到全部的xxx
  //         let dateToNum_Next = Number(result[i+1].Date.replace(/-/g,''));
  //         if (dateToNum > dateToNum_Next){
  //           let temp = '';
  //           temp = result[i];
  //           result[i] = result[i+1];
  //           result[i+1] = temp;
  //         }
  //       }
  //     }
  //     console.log(result);
  //     render_sortItemByTime(result);
  //     break;
  //   case 'fartonear': //若值為fartonear，則以遠到近排序
  //     let start2 = JSON.parse(localStorage.getItem('currTodoNum'));
  //     let result2 = [];
  //     for (let i = start2; i > 0; i--) {
  //       let item = JSON.parse(localStorage.getItem(`${i}`));
  //       if (item == null) {
  //         continue;
  //       }else{
  //         result2.push(item);
  //       }
  //     }
  //     let j2 = result2.length;
  //     while (j2>0) {
  //       j2--;
  //       for (let i = 0 ; i < result2.length-1 ; i++) {
  //         let dateToNum = Number(result2[i].Date.replace(/-/g,'')); // 正規表達式 /xxx/g，代表找到全部的xxx
  //         let dateToNum_Next = Number(result2[i+1].Date.replace(/-/g,''));
  //         if (dateToNum < dateToNum_Next){
  //           let temp = '';
  //           temp = result2[i];
  //           result2[i] = result2[i+1];
  //           result2[i+1] = temp;
  //         }
  //       }
  //     }
  //     render_sortItemByTime(result2);
  //     break;
  //   default:
  //     break;
  // }

  // 以下使用合併排序法 merge sort
  let start = JSON.parse(localStorage.getItem('currTodoNum')); //取得目前TODO的id到多少了
  // 將local Storage的值取出放入result_unsort
  let result_unsort = []; 
  while (start > 0) {
    let unsort_item = JSON.parse(localStorage.getItem(start));
    if (unsort_item) {
      result_unsort.push(unsort_item);
    }
    start --;
  }
  switch (optionValue) { //點選的值
    case 'chose': //若值為chose，則console.log('chose');
      render_sortItemByTime(result_unsort);
      break;
    case 'neartofar': //若值為neartofar，則以近到遠排序
      // 合併
      function mergeTime_neartofar(arr1,arr2) {
        let result = [];
        let i = 0, j = 0;

        while(i<arr1.length && j<arr2.length){
          if(Number(arr1[i].Date.replace(/-/g,'')) > Number(arr2[j].Date.replace(/-/g,''))){
            result.push(arr2[j]);
            j++;
          }else if(Number(arr1[i].Date.replace(/-/g,'')) < Number(arr2[j].Date.replace(/-/g,''))){
            result.push(arr1[i]);
            i++;
          }else{
            result.push(arr2[j]);
            j++;
          }
        }
        while (i<arr1.length){
          result.push(arr1[i]);
          i++;
        }
        while (j<arr2.length){
          result.push(arr2[j]);
          j++;
        }
        return result;
      }
      // 拆分
      function mergeSort_neartofar(arr) {
        if (arr.length === 1) {
          return arr;
        }else{
          let middle = Math.floor(arr.length / 2);
          let left = arr.slice(0,middle);
          let right = arr.slice(middle, arr.length);
          return mergeTime_neartofar(mergeSort_neartofar(left),mergeSort_neartofar(right)); 
        }
      }
      
      render_sortItemByTime(mergeSort_neartofar(result_unsort));

      break;
    case 'fartonear': //若值為fartonear，則以遠到近排序
      // 合併
      function mergeTime_fartonear(arr1,arr2) {
        let result = [];
        let i = 0, j = 0;

        while(i<arr1.length && j<arr2.length){
          if(Number(arr1[i].Date.replace(/-/g,'')) > Number(arr2[j].Date.replace(/-/g,''))){
            result.push(arr1[i]);
            i++;
          }else if(Number(arr1[i].Date.replace(/-/g,'')) < Number(arr2[j].Date.replace(/-/g,''))){
            result.push(arr2[j]);
            j++;
          }else{
            result.push(arr2[j]);
            j++;
          }
        }
        while (i<arr1.length){
          result.push(arr1[i]);
          i++;
        }
        while (j<arr2.length){
          result.push(arr2[j]);
          j++;
        }
        return result;
      }
      // 拆分
      function mergeSort_fartonear(arr) {
        if (arr.length === 1) {
          return arr;
        }else{
          let middle = Math.floor(arr.length / 2);
          let left = arr.slice(0,middle);
          let right = arr.slice(middle, arr.length);
          return mergeTime_fartonear(mergeSort_fartonear(left),mergeSort_fartonear(right)); 
        }
      }
      
      render_sortItemByTime(mergeSort_fartonear(result_unsort));
      break;
    default:
      break;
  }
}

// 刪除所有"已完成"項目
function deleteAllDoneItem() {
  let start = JSON.parse(localStorage.getItem('currTodoNum'));
  let deleteNum = 0;
  for (let i = start; i > 0; i--) {
    let item = JSON.parse(localStorage.getItem(`${i}`));
    if (item == null) {
      continue;
    }else{
      if (item.check) {
        deleteNum++;
        localStorage.removeItem(`${i}`);
      }
    }
  }
  countAllItemNum_MinuDeleteNum(deleteNum);
  render();
}

// 判斷目前是在哪個tab下
function whereActive(e) {
  // 先將目前3個tab裡有active這個class的，移除active
  let arr = e.target.parentNode.children;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].classList.contains("active")) {
      arr[i].classList.remove("active");
    }
  }
  // 判斷滑鼠點選位置，來決定active在哪
  if (e.target.classList.contains("allItemTab")) {
    e.target.classList.add("active");
  }else if (e.target.classList.contains("DoneItemTab")) {
    e.target.classList.add("active");
  }else if (e.target.classList.contains("UnDoneItemTab")) {
    e.target.classList.add("active");
  }
  render();
}

/**滑鼠點選到某項的checkbox時，
 * 將其CSS、localStorage內item的check與UndoItem之值作更改，並渲染於畫面
*/
function checkboxChanged(e) {
  // 使用目標id後幾個數字
  let clickId = Number(e.target.id.replace("todo",""));

  if(e.target.type == 'checkbox'){
    // 若點選目標為checkbox，則執行以下程式

    // 從localStorage取出目前點選的內容
    let itemId = JSON.parse(localStorage.getItem(clickId));

    // 若此點選動作為true，則將localStorage裡此項的check改為checked；反之改為無，並計算UndoItem，然後渲染畫面
    if (e.target.checked == true){
      itemId.check = "checked";
      localStorage.setItem(clickId,JSON.stringify(itemId));
      countUndoItem();
      render();
    }else if(e.target.checked == false){
      itemId.check = "";
      localStorage.setItem(clickId,JSON.stringify(itemId));
      countUndoItem();
      render();
    }
  }
}

// 刪除被點選的項目
function deleteItem(e) {
  
  // console.log(e.target.parentElement.classList[1]);
  if (e.target.classList.contains("deleteBtn")) {
    // 使用目標class後幾個數字
    let clickId = Number(e.target.classList[1].replace("delete",""));
    execute(clickId);
  }else if(e.target.parentElement.classList.contains("deleteBtn")){
    let clickId2 = Number(e.target.parentElement.classList[1].replace("delete",""));
    execute(clickId2);
  }
  function execute(itemkey) {
    localStorage.removeItem(itemkey);
    countAllItemNum_MinuOne()
    countUndoItem();
    render();
  }
}

// 清空localStorage，會把name與UndoItem、currTodoNum、ItemNum，還有所有項目都刪除
function clearLocalstorage(){
  localStorage.clear();
  window.location.reload();
}




// ----------------------------------------------
// 以下function會被上面的function呼叫(使用到)
// ----------------------------------------------

// 查看目前key用到數字幾(insert項目的時候會用到(function UseMouseadditem))
function checkcurrTodoNum() {
  let checkcurrTodoNum = localStorage.getItem('currTodoNum');
  if(checkcurrTodoNum == null || checkcurrTodoNum == '' || checkcurrTodoNum == undefined){
    // 若無，將1作為currTodoNum值
    localStorage.setItem('currTodoNum',JSON.stringify(1));
    let currTodoNum = JSON.parse(localStorage.getItem('currTodoNum'));
    return currTodoNum;
  }else{
    // 若有，把localStorage裡currTodoNum的值拿出+1後再放回去localStorage
    let currTodoNum = JSON.parse(localStorage.getItem('currTodoNum'))+1;
    localStorage.setItem('currTodoNum',JSON.stringify(currTodoNum));
    return currTodoNum;
  }
}

// 計算目前有多少個項目(將ItemNum加1)，並存入localStorage(insert項目的時候會用到(function UseMouseadditem))
function countAllItemNum_PlusOne() {
  let ItemNumHadOrNot = localStorage.getItem('ItemNum');
  // 確認localStorage裡是否有ItemNum
  if (ItemNumHadOrNot == null) {
    // 若無，將1作為ItemNum的值
    localStorage.setItem('ItemNum',JSON.stringify(1));
  }else{
    // 若有，將ItemNum的值拿出+1後再放回去localStorage
    let ItemNum = JSON.parse(localStorage.getItem("ItemNum"))+1;
    localStorage.setItem('ItemNum',JSON.stringify(ItemNum));
  }
}

// 計算目前有多少個項目(將ItemNum減1)，並存入localStorage(刪除單一項目會用到(function deleteItem))
function countAllItemNum_MinuOne(){
  let ItemNum = JSON.parse(localStorage.getItem('ItemNum'));
  ItemNum--;
  localStorage.setItem("ItemNum",JSON.stringify(ItemNum));
}

// 計算目前有多少個項目(將ItemNum減去被刪除的Item數量)，並存入localStorage(刪除單一項目會用到(function deleteItem))
function countAllItemNum_MinuDeleteNum(num){
  let ItemNum = JSON.parse(localStorage.getItem('ItemNum'));
  ItemNum-=num; //原所有Item數量 - 已被刪除的Item數量
  localStorage.setItem("ItemNum",JSON.stringify(ItemNum));
}

// 計算目前"未完成"項目有多少，並存入localStorage(insert項目的時候會用到(function UseMouseadditem))
function countUndoItem() {
  let start = JSON.parse(localStorage.getItem('currTodoNum'));
  let result = 0;
  for (let i = start; i > 0; i--) {
    let item = JSON.parse(localStorage.getItem(`${i}`));
    // 確認目前item是否存在
    if (item == null) {
      continue;
    }else{
      let check = item.check;
      // 若存在，則確認check是否為false
      if (!check) {
        // 若為false，則將result+1
        result++;
      }
    }
  }
  localStorage.setItem('UndoItem',JSON.stringify(result));
  render();
}

// 渲染畫面
function render() {
  let start = JSON.parse(localStorage.getItem('currTodoNum'));
  let UndoItem = JSON.parse(localStorage.getItem('UndoItem'));
  sortByTime.options[0].selected = true; //將排序改為請選擇
  (UndoItem == null) ? countUnDone.innerText="0" :  countUnDone.innerText = `${UndoItem}`;
  tabContent.innerHTML = '' ; //將tabContent內的畫面清除
  for (let i = start; i > 0; i--) {
    let item = JSON.parse(localStorage.getItem(`${i}`));
    if (item == null) {
      continue;
    }else{
      let itemValue = {...item}; //展開item
      if (allItemTab.classList.contains("active")) {
        // 若active在全部則渲染以下程式
        tabContent.innerHTML += `
        <li class="row item mt-2">
          <div class="col-10">
              <input type="checkbox" id="todo${itemValue.id}" name="todo" value="todo" ${itemValue.check}>
              <label for="todo${itemValue.id}">${itemValue.ToDo}</label>
          </div>
          <div class="col-2 d-flex justify-content-end align-items-center">
            <button class="deleteBtn delete${itemValue.id}">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </button>
          </div>
          <div class="col-12 d-flex justify-content-end date mt-2">
            ${itemValue.Date}
          </div>
        </li>
        `
      }else if(DoneItemTab.classList.contains("active")){
        // 若active在已完成則渲染以下程式
        if (itemValue.check == "checked") {
          tabContent.innerHTML += `
          <li class="row item mt-2">
            <div class="col-10">
                <input type="checkbox" id="todo${itemValue.id}" name="todo" value="todo" ${itemValue.check}>
                <label for="todo${itemValue.id}">${itemValue.ToDo}</label>
            </div>
            <div class="col-2 d-flex justify-content-end align-items-center">
              <button class="deleteBtn delete${itemValue.id}">
                <i class="fa fa-trash-o" aria-hidden="true"></i>
              </button>
            </div>
            <div class="col-12 d-flex justify-content-end date mt-2">
              ${itemValue.Date}
            </div>
          </li>
          `
        }
      }else if(UnDoneItemTab.classList.contains("active")){
        // 若active在未完成則渲染以下程式
        if (itemValue.check == "") {
          tabContent.innerHTML += `
          <li class="row item mt-2">
            <div class="col-10">
                <input type="checkbox" id="todo${itemValue.id}" name="todo" value="todo" ${itemValue.check}>
                <label for="todo${itemValue.id}">${itemValue.ToDo}</label>
            </div>
            <div class="col-2 d-flex justify-content-end align-items-center">
              <button class="deleteBtn delete${itemValue.id}">
                <i class="fa fa-trash-o" aria-hidden="true"></i>
              </button>
            </div>
            <div class="col-12 d-flex justify-content-end date mt-2">
              ${itemValue.Date}
            </div>
          </li>
          `
        }
      }
    }
  }
}

// 點選排序後，渲染出來的畫面(無法使用function render()，因為要渲染的內容被拿出來暫存於function sortItemByTime()的result中，非直接從localStorage取出)
function render_sortItemByTime(arr){
  let len = arr.length;
  tabContent.innerHTML = '' ; //將tabContent內的畫面清除
  for (let i = 0; i < len; i++) {
    if (allItemTab.classList.contains("active")) {
      // 若active在全部則渲染以下程式
      tabContent.innerHTML += `
      <li class="row item mt-2">
        <div class="col-10">
            <input type="checkbox" id="todo${arr[i].id}" name="todo" value="todo" ${arr[i].check}>
            <label for="todo${arr[i].id}">${arr[i].ToDo}</label>
        </div>
        <div class="col-2 d-flex justify-content-end align-items-center">
          <button class="deleteBtn delete${arr[i].id}">
            <i class="fa fa-trash-o" aria-hidden="true"></i>
          </button>
        </div>
        <div class="col-12 d-flex justify-content-end date mt-2">
          ${arr[i].Date}
        </div>
      </li>
      `
    }else if(DoneItemTab.classList.contains("active")){
      // 若active在已完成則渲染以下程式
      if (arr[i].check == "checked") {
        tabContent.innerHTML += `
        <li class="row item mt-2">
          <div class="col-10">
              <input type="checkbox" id="todo${arr[i].id}" name="todo" value="todo" ${arr[i].check}>
              <label for="todo${arr[i].id}">${arr[i].ToDo}</label>
          </div>
          <div class="col-2 d-flex justify-content-end align-items-center">
            <button class="deleteBtn delete${arr[i].id}">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </button>
          </div>
          <div class="col-12 d-flex justify-content-end date mt-2">
            ${arr[i].Date}
          </div>
        </li>
        `
      }
    }else if(UnDoneItemTab.classList.contains("active")){
      // 若active在未完成則渲染以下程式
      if (arr[i].check == "") {
        tabContent.innerHTML += `
        <li class="row item mt-2">
          <div class="col-10">
              <input type="checkbox" id="todo${arr[i].id}" name="todo" value="todo" ${arr[i].check}>
              <label for="todo${arr[i].id}">${arr[i].ToDo}</label>
          </div>
          <div class="col-2 d-flex justify-content-end align-items-center">
            <button class="deleteBtn delete${arr[i].id}">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </button>
          </div>
          <div class="col-12 d-flex justify-content-end date mt-2">
            ${arr[i].Date}
          </div>
        </li>
        `
      }
    }
  }
}
