// Objects
const person = {
    name: 'Ilya',
    age: 25,
    job: 'Frontend'
}

const proxy = new Proxy(person, {
    get(target, prop) {
        console.log('Target: ', target)
        console.log('Property: ', prop)

        if (!(prop in target)) {
            return prop.split('_').map(p => target[p]).join(' ')
        }
        return target[prop]
    },

    set(target, prop, value) {
        if (prop in target)  {
            target[prop] = value
        } else {
            throw new Error(`No ${prop} field in target`)
        }
    },

    // age in proxy
    has(target, prop) {
        return ['age', 'name', 'job'].includes(prop)
    },

    // delete proxy.age
    deleteProperty(target, prop) {
        console.log('Deleting...', prop)
        delete target[prop]
        return true
    }
})

//Functions
const log = text => `Log: ${text}`

const fnProxy = new Proxy(log, {
    apply(target, thisArg, argArray) {
        console.log('Target: ', target)
        console.log('Context: ', thisArg)
        console.log('Args: ', argArray)

        return target.apply(thisArg, argArray).toUpperCase()
    }
})

// Classes
class Person {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
}

const PersonProxy = new Proxy(Person, {
    construct(target, argArray) {
        console.log('Construct...')

        // return new target(...argArray)
        return new Proxy(new target(...argArray), {
            get(t, p) {
                console.log(`Getting prop "${p}"`)
                return t[p]
            }
        })
    }
})

const personProxy = new PersonProxy('Vlad', 30)

//Examples
//Wrapper
const withDefaultValue = (target, defaultValue = 0)  =>  new Proxy(target, {
    get: (obj, prop) => (prop in obj ? obj[prop] : defaultValue)
})

const position = withDefaultValue({
    x: 24,
    y: 42
}, 0)

// Hidden properties
const  withHiddenProps = (target, prefix = '_')  => new Proxy(target, {
    has: (obj, prop) => (prop in obj) && (!prop.startsWith(prefix)),
    ownKeys: (obj) => Reflect.ownKeys(obj).filter(p => !p.startsWith(prefix)),
    get: (obj, prop, receiver) => (prop in receiver) ? obj[prop] : void 0
})

const data = withHiddenProps({
    name: 'Vasya',
    age: 99,
    _uid: '9379992'
})

// Optimization
const userData = [
    { id: 1,  name: 'Ilya', age: 25, job: 'Frontend' },
    { id: 2,  name: 'Vasya', age: 99, job: 'Undefined' },
    { id: 3,  name: 'No Name', age: 0, job: 'Hacker' },
]

const IndexArray = new Proxy(Array, {
    construct(target, [argArray]) {
        const index = {}
        argArray.forEach((value) => index[value.id] = value)

        return new Proxy(new target(...argArray), {
            get(arr, prop) {
                switch (prop) {
                    case 'push': return item => {
                        index[item.id] = item
                        arr[prop].call(arr, item)
                    }
                    case 'findById': return id => index[id]
                    default: return arr[prop]
                }
            }
        })
    }
})

const users = new IndexArray([
    { id: 1,  name: 'Ilya', age: 25, job: 'Frontend' },
    { id: 2,  name: 'Vasya', age: 99, job: 'Undefined' },
    { id: 3,  name: 'No Name', age: 0, job: 'Hacker' },
])
