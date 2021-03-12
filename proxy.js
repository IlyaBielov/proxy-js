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
