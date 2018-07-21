class InheritanceTree {
    constructor() {
        this.rootNodeName = 'root'
        this.nodes = { [this.rootNodeName]: {} }
    }

    addChild(parentName, childName) {
        parentName = parentName === null ? this.rootNodeName : parentName

        const parentObj = this._getParentObj(parentName)

        // if child already exists then return immediately
        if (this._isDirectChild(parentObj, childName)) return

        const childObj = this._getChildObj(childName)

        parentObj[childName] = childObj
    }

    _getParentObj(nodeName) {
        let nodeParent = this._getNode(nodeName)

        // node was not present in tree
        if (nodeParent === null) {
            this.nodes[this.rootNodeName][nodeName] = {}
            return this.nodes[this.rootNodeName][nodeName]
        }

        return nodeParent[nodeName]
    }

    _getChildObj(nodeName) {
        const nodeParent = this._getNode(nodeName)

        // node was not present in tree so return an empty node/object
        if (nodeParent === null) return {}

        // child already has a parent so we need to remove the child
        // from its previous parent first and then return it
        else {
            const node = nodeParent[nodeName]
            delete nodeParent[nodeName]
            // node with all its children are returned
            return node
        }
    }

    _getNode(nodeName, nodes = this.nodes) {
        if (nodes.hasOwnProperty(nodeName)) return nodes

        else if (Object.keys(nodes).length > 0) {
            let result = null


            for (let child in nodes) {
                result = this._getNode(nodeName, nodes[child])
                if (result !== null) break;
            }

            return result
        }

        return null
    }

    _isDirectChild(parentNode, childName) {
        return parentNode.hasOwnProperty(childName)
    }

    getNodesObj() {
        // since there won't be any type of value except strings
        // in the nodes tree, this technique will work for deep cloning
        return JSON.parse(JSON.stringify(this.nodes))
    }
}

module.exports = InheritanceTree