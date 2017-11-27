var NODE = Object.create({}, {
    len: {
        enumerable: false,
        configurable: false,
        get: function(){
            return listReduceLeft(this, 0, (acc, i) => acc + 1);
        }
    },
    print: { // prints list contents as an Array
        enumerable: false,
        configurable: false,
        get: function(){
            return listReduceLeft(this, [], (acc, i) => acc.concat(i))
        }
    },
    map: {
        enumerable: false,
        configurable: false,
        value: function(fn){
            return listReduceRight(this, null, (acc, i) => cons(fn(i), acc));
        }
    },
    filter: {
        enumerable: false,
        configurable: false,
        value: function(fn){
            return listReduceRight(this, null, (acc, i) => fn(i) ? cons(i, acc) : acc);
        }
    },
    andMap: { // comparable to Array.every()
        enumerable: false,
        configurable: false,
        value: function(fn){
            return listReduceLeft(this, true, (acc, i) => acc && fn(i));
        }
    },
    orMap: { // comparable to Array.some()
        enumerable: false,
        configurable: false,
        value: function(fn){
            return listReduceLeft(this, false, (acc, i) => acc || fn(i));
        }
    },
    reduceL: { // traverses list from left -> right
        enumerable: false,
        configurable: false,
        value: function(acc, fn){
            return listReduceLeft(this, acc, fn);
        }
    },
    reduceR: { // traverses list from right -> left
        enumerable: false,
        configurable: false,
        value: function(acc, fn){
            return listReduceRight(this, acc, fn);
        }
    }
});


/* List, X, [X, Y] -> X -> X */
function listReduceLeft(list, acc, fn){
    if(isEmpty(list)){
        return acc;
    } else {
        return listReduceLeft(
            list.rest, 
            fn(acc, list.first),
            fn
        );
    }
}

/* List, X, [X, Y] -> X -> X */
function listReduceRight(list, acc, fn){
    const revList = List.apply(null, list.print.reverse());
    
    return listReduceLeft(revList, acc, fn);
}


/* List methods */
function isEmpty(list){
    return list === null;
}

function isList(list){
    return NODE.isPrototypeOf(list) || isEmpty(list);
}

/* Natural Number, [NN -> X] -> List
    builds a list of a given length, with the function
    applied to each element */
function from(n, fn){
    const buildList =  fn ? 
          (item, list) => cons(fn(item), list) : 
          (item, list) => cons(item, list);
    const start = n - 1;
    let newList = null;
    
    for(let i = start; i >= 0; i--){
        newList = buildList(i, newList);
    }

    return newList;
}


/*** list constructors ***/
/* X, null or List -> List
    adds a element to the front of the list */
function cons(first, rest){
    if(isList(rest) || isEmpty(rest)){
        let newList = Object.create(NODE);
        
        // freezes list to simulate immutability
        return Object.freeze(Object.assign(newList, { first, rest }));  
    } else {
        throw new Error('rest argument is not a list');
    }
}

/* ...X -> List */
function List(...items){
    const len = items.length;
    let index = len - 1;
    let newList = null;
    
    while(index >= 0){
        newList = cons(items[index], newList);
        index -= 1;
    }
    
    return newList;
}

/* assigning methods to List */
var assignments = (() => {
    Object.assign(List, { 
        prototype: NODE, 
        isEmpty,
        isList,
        from
    });
})();

/* testing */
(() => {
    var assert = console.assert;
    var l0 = null;
    var l1 = List('a');
    var l2 = List(3,5,7);
    var l3 = List(List(1,2,3), List(4,5,6), List(7,8,9));
    var l4 = List('b', 5, false, 'c', 7);
    
    /* List methods */
    assert(List.isList(l0) === true, 'null is list');
    assert(List.isList(l3.rest) === true, 'l3 is list');
    assert(List.isList(l1) === true, 'l1 is list');
    
    assert(List.isEmpty(l0) === true, 'null is empty');
    assert(List.isEmpty(l3.first) === false, 'l3 is list');
    assert(List.isEmpty(l1) === false, 'l1 is not empty');
    
    assert(List.from(10, n => n).len === 10, 'list from 10 has length of 10');
    assert(List.from(10, n => n).rest.first === 1, 'second element is 1');
    
    /* NODE methods */
    assert(cons(1, cons (2, null)).len === 2, '[1,2].len === 2');
    assert(l2.print[2] === 7, 'last element === 7');
    
    assert(l2.map(n => n*n).rest.first === 25, 'middle element is 25');
    assert(l3.map(l => l.first).first === 1, 'first of first === 1')
    
    assert(l2.reduceR(null, (acc, l) => cons(l*l, acc)).rest.first === 25, 'middle === 25');
    assert(l2.reduceL(null, (acc, l) => cons(l, acc)).first === 7, 'first is 7');
    
    assert(List(1,2,3,4,5,6).filter(n => n%2===0).len === 3, 'filtered out odds');
    
    assert(l3.andMap(l => List.isList(l)) === true, 'list of lists');
    assert(l4.orMap(i => typeof(i) === 'number') === true, 'list contains a number');
    
    assert(l4.filter(i => typeof(i) === 'number').andMap(n => n > 3) === true, 'nums > 3');
})();
