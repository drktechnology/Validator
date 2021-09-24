require('dotenv').config()
// const flattener = require('truffle-flattener')
const exec = require('child_process').exec;

const filenames_string = process.env.FLATTENER_FILENAMES.replace(/\s/g, '')
const filenames= filenames_string.split(',')

const filetype='.sol'

const path= {
    input: process.env.FLATTENER_INPUT,
    output: process.env.FLATTENER_OUTPUT
}

filenames.forEach(filename => {
    const file = {
        input: path.input + filename + filetype,
        output: path.output + filename + filetype
    }
    const cmd = 'truffle-flattener ' + file.input +' --output ' + file.output
    exec(cmd)
})