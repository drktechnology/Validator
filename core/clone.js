const fs = require("fs-extra");
const source = 'build'
const destination = {
    BE: '../back-end/build',
    FE: '../front-end/build'
}

async function clone() {
    console.log('START CLONING TO BACKEND AND FRONTEND')
    // firstly remove destinations
    await fs.remove(destination.BE)
    await fs.remove(destination.FE)

    // copy source folder to destination
    await fs.copy(source, destination.BE, function (err) {
        if (err){
            console.log('An error occured while copying the folder.')
            return console.error(err)
        }
        console.log('Copy to back-end completed!')
    });

    await fs.copy(source, destination.FE, function (err) {
        if (err){
            console.log('An error occured while copying the folder.')
            return console.error(err)
        }
        console.log('Copy to front-end completed!')
    });
}

clone()