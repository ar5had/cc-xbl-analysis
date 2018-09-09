const fs = require('fs')
const xml2js = require('xml2js')
const json2md = require('json2md')
const inheritanceTree = require('./InheritanceTree')
const log = require('eyes').inspector({ maxLength: false })

const file = './files/files.txt'
const tree = new inheritanceTree()

const populateTree = (extendedBinding, childBinding, childNodeProps) => {
    let extendedBindingName = null

    // extended binding is either a xul element or another binding
    if (extendedBinding) {
        extendedBindingName =
            extendedBinding.startsWith('xul:') ? extendedBinding : extendedBinding.split('#')[1]
    }

    tree.addChild(extendedBindingName, childBinding, childNodeProps)
}

const writeBindingsMdFile = data => {
    let mdFormatData = data.map(e => ([
        { h3: `${e.name}` },
        {
            table: {
                headers: ['binding', 'extends'],
                rows: e.bindingArray
            }
        }
    ]))

    const markdownFileContent = json2md(mdFormatData);

    fs.writeFile("./files/bindings.md", markdownFileContent, err => {
        if (err)
            return console.error(err)
        log('Successfully written bindings data into bindings.md!')
    })
}

const convertTreeIntoD3Format = (tree, nodeProps, res = {}) => {
    const keys = Object.keys(tree)

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const childKeys = Object.keys(tree[key])

        // base case
        if (childKeys.length === 0)
            return { name: key, props: nodeProps[key] }

        else {
            res.name = key
            res.children = childKeys.map(e => convertTreeIntoD3Format({ [e]: tree[key][e] }, nodeProps))
        }
    }

    return res
}

const writeTreeJsonFile = (tree, nodeProps) => {
    const treeJson = JSON.stringify(convertTreeIntoD3Format(tree, nodeProps), null, 2)

    fs.writeFile("./files/tree.json", treeJson, err => {
        if (err)
            return console.error(err)
        log('Successfully written tree json into tree.json!')
    })
}

// promisified
const parseXmlFile = (path, i = '=>') =>
    new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err)
                return reject(err)

            const parser = new xml2js.Parser({ strict: false })
            const fileName = path.split('/').slice(-1)[0]

            parser.parseString(data, (err, result) => {
                if (err)
                    return reject(err)

                const bindingArray = result.BINDINGS.BINDING.map(e => {
                    const bindingName = e['$'].ID
                    const extendedBinding = e['$'].EXTENDS

                    const bindingElements = Object.keys(e).slice(1)
                    const link = `https://searchfox.org/comm-central/source/${path.slice(path.indexOf('comm/') + 5)}`
                    const hasContent = bindingElements.includes('CONTENT')
                    const hasImplementation = bindingElements.includes('IMPLEMENTATION')
                    const hasHandlers = bindingElements.includes('HANDLERS')

                    populateTree(extendedBinding, bindingName, {
                        link, hasContent, hasImplementation, hasHandlers
                    })

                    return ({
                        binding: bindingName,
                        extends: extendedBinding || 'does not extend any binding/element',
                        link, hasContent, hasImplementation, hasHandlers
                    })
                })
                const name = result.BINDINGS['$'].ID || fileName

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
            writeBindingsMdFile(data)
            writeTreeJsonFile(tree.getNodesObj(), tree.getNodesProps())
            // log(tree.getNodesProps());
        })
        .catch(reason => {
            console.error('Error occurred while handling one of the xmlFilePromises!')
            console.error(reason)
        })
})
