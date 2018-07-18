const fs = require('fs')
const xml2js = require('xml2js')
const json2md = require('json2md')
const log = require('eyes').inspector({ maxLength: false })

const file = './files.txt'

// promisified
const parseXmlFile = (path, i = '=>') =>
    new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err)
                return reject(err)

            const parser = new xml2js.Parser({ strict: false })

            parser.parseString(data, (err, result) => {
                if (err)
                    return reject(err)

                // use inspect instead of console.log for nice colored output
                // inspect(result)

                const bindingArray = result.BINDINGS.BINDING.map(e => (
                    {
                        id: e['$'].ID,
                        extends: e['$'].EXTENDS || 'does not extend any binding/element'
                    }
                ))
                const name = result.BINDINGS['$'].ID || path.split('/').slice(-1)[0]

                log(`${i === '=>' ? i : (i + 1) + '.'} Parsed ${path}`)

                resolve({ name, bindingArray })
            })
        })
    })


fs.readFile(file, (err, content) => {
    if (err) {
        return console.error('Error occurred while reading files.txt!')
    }

    const filePaths = content.toString().split('\n').filter(e => e !== '')
    const xmlFilePromises = filePaths.map(parseXmlFile)

    Promise.all(xmlFilePromises)
        .then(data => {
            // log(data)
            const mdFormatData = data.map(e => {
                // const bindings = e.bindingArray.map(f => ({h3: f.id, });

                return ([
                    { h1: `${e.name}` },
                    { h2: 'Bindings' },
                    {
                        table: {
                            headers: ['id', 'extends'],
                            rows: e.bindingArray
                        }
                    }
                ]);
            })

            const markdownFileContent = json2md(mdFormatData);

            fs.writeFile("./bindings.md", markdownFileContent, err => {
                if (err)
                    return console.error(err)
                log('Successfully written bindings data into bindings.md!')
            })
        })
        .catch(reason => {
            console.error('Error occurred while handling one of the xmlFilePromises!')
            console.error(reason)
        });
})