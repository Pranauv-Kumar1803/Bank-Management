// const d = new Date(10).getMilliseconds();
// console.log(d);

// const d = new Date();
const d1 = new Date();
d1.setDate(d1.getDate()-7);
console.log(d1.toDateString());
// console.log(new Date(Date.parse(d1)).toDateString());
