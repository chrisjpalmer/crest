var myArgs = process.argv.slice(2);
let obj = JSON.parse(myArgs[0]);
let key = myArgs[1];
let keynodes = key.split(".");
let target = obj;
keynodes.forEach(node => {
    target = target[node];
});
console.log(target)
