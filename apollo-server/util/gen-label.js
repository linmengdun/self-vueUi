function pad(num, n) {
  var len = num.toString().length;
  while (len < n) {
      num = "0" + num;
      len++;
  }
  return num;
}

module.exports = function () {
  const n = new Date()
  return `${n.getFullYear()}`.slice(2) + 
    pad(n.getMonth() + 1, 2) + 
    pad(n.getDate(), 2) + 
    pad(n.getHours(), 2) + 
    pad(n.getMinutes(), 2)
}
