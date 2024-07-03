// 計算tab以上(含)的高度，來決定tabContent的高度
const root = document.documentElement;
let header = document.querySelector('header');
let form = document.querySelector('form');
let sort = document.querySelector('.sort');
let check = document.querySelector('.checkUnDoneAndDeleteAll');
let tabBtn = document.querySelector('.tabBtn');
function minusheight() {
  const height = header.offsetHeight + form.offsetHeight + sort.offsetHeight + check.offsetHeight + tabBtn.offsetHeight + 100;
  root.style.setProperty('--minusheight', `${height}px`);
}
window.addEventListener('load', minusheight);
window.addEventListener('resize', minusheight);

// --------------------------------------------------------

// set today date
const date = new Date();
console.log(date);
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currYMD = {
  curr: '',
  today(){
    if (month>9 && day>9) {
      return this.curr = `${year}-${month}-${day}`;
    }else if(month>9 && day<=9){
      return this.curr = `${year}-${month}-0${day}`;
    }else if(month<=9 && day>9){
      return this.curr = `${year}-0${month}-${day}`;
    }else if(month<9 && day<=9){
      return this.curr = `${year}-0${month}-0${day}`;
    }
  }
}
document.querySelector('.curr').setAttribute('value',currYMD.today());