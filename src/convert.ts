import fs from 'fs'

const files = fs.readdirSync('./src')

files.forEach(fileName => {
    const file = fs.readFileSync(fileName).toString().replace(/_(\w)/, (substring: string) => {
        console.log(substring)
        return substring
    })
    fs.writeFileSync(fileName, file, 'utf-8')
})