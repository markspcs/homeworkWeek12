const array = [{myId: 42, name: 'John', color: 'red'}, {myId: 1337, name: 'Jane', color: 'blue'}]

const transformed = array.reduce((acc, {myId, ...x}) => { acc[myId] = x; return acc}, {})

console.table(transformed);
