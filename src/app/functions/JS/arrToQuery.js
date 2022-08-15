module.exports = (arr) => {
  let trat = '(';
  for (let i = 0; i < arr.length; i++) {
    i === (arr.length - 1) ? trat += `'${arr[i]}'` : trat += `'${arr[i]}',`
  };
  trat += ')';
  return trat
} 