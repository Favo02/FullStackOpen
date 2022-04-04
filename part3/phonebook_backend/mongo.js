const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Usage for retreiving the full phonebook: node mongo.js <password>')
    console.log('Usage for adding a new person: node mongo.js <password> "<name>" <number>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstackopen:${password}@cluster0.6d9po.mongodb.net/phonebook?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Person = mongoose.model('Person', personSchema)

if (process.argv.length == 3) {
    Person.find({}).then(result => {
        result.forEach((person, i) => {
            if (i == 0) {
                console.log("phonebook:");
            }
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}
else if (process.argv.length == 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    
    person.save().then(result => {
        console.log(`added ${result.name} number ${result.number} to phonebook`)
        mongoose.connection.close()
    })
}
else {
    console.log('Usage for retreiving the full phonebook: node mongo.js <password>')
    console.log('Usage for adding a new person: node mongo.js <password> "<name>" <number>')
    process.exit(1)
}


