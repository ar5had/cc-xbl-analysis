const draw = data => {
    const ww = window.innerWidth - 50

    let margin = { top: 40, right: 40, bottom: 40, left: 100 },
        width = (ww > 1500 ? ww : 1500) - margin.left - margin.right,
        height = 4000 - margin.top - margin.bottom

    let i = 0,
        duration = 100,
        root

    let tree = d3.layout.tree()
        .size([height, width])

    let diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x] })

    let svg = d3.select('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    d3.json('./files/tree.json', function (error, data) {
        if (error) throw error

        root = data
        root.x0 = height / 2
        root.y0 = 0

        function collapse(d) {
            if (d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
        }

        function open(d) {
            if (d._children) {
                d.children = d._children
                d.children.forEach(open)
                d._children = null
            }
        }

        window.root = root

        window.toggleAllNodes = (action) => {
            const closeAll = e => {
                if (e.children) {
                    e.children.forEach(j => closeAll(j))
                } else {
                    if (e.parent.name !== 'root') {
                        const parent = e.parent
                        collapse(parent)
                        closeAll(parent.parent)
                    }
                }
            }

            const openAll = e => {
                open(e)
                if (e.children)
                    e.children.forEach(j => openAll(j))
            }

            const cb = action === 'close' ?
                root.children.forEach(closeAll)
                : openAll(root)
            update(root)
        }

        root.children.forEach(collapse)
        update(root)
    })

    d3.select(self.frameElement).style('height', '1000px')

    function update(source) {

        // Compute the new tree layout.
        let nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes)

        // Normalize for fixed-depth.
        nodes.forEach(function (d) { d.y = d.depth * 250 })

        // Update the nodes…
        let node = svg.selectAll('g.node')
            .data(nodes, function (d) { return d.id || (d.id = ++i) })

        // Enter any new nodes at the parent's previous position.
        let nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) { return 'translate(' + source.y0 + ',' + source.x0 + ')' })
            .on('click', click)

        nodeEnter.append('circle')
            .attr('r', 1e-6)
            .style('fill', function (d) { return d._children ? 'lightsteelblue' : '#fff' })

        nodeEnter.append('text')
            .attr('x', function (d) { return d.children || d._children ? -10 : 10 })
            .attr('dy', '.35em')
            .attr('text-anchor', function (d) { return d.children || d._children ? 'end' : 'start' })
            .text(function (d) { return d.name })
            .style('fill-opacity', 1e-6)

        // Transition nodes to their new position.
        let nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', function (d) { return 'translate(' + d.y + ',' + d.x + ')' })

        nodeUpdate.select('circle')
            .attr('r', 4.5)
            .style('fill', function (d) { return d._children ? 'lightsteelblue' : '#fff' })

        nodeUpdate.select('text')
            .style('fill-opacity', 1)

        // Transition exiting nodes to the parent's new position.
        let nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', function (d) { return 'translate(' + source.y + ',' + source.x + ')' })
            .remove()

        nodeExit.select('circle')
            .attr('r', 1e-6)

        nodeExit.select('text')
            .style('fill-opacity', 1e-6)

        // Update the links…
        let link = svg.selectAll('path.link')
            .data(links, function (d) { return d.target.id })

        // Enter any new links at the parent's previous position.
        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', function (d) {
                let o = { x: source.x0, y: source.y0 }
                return diagonal({ source: o, target: o })
            })

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr('d', diagonal)

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr('d', function (d) {
                let o = { x: source.x, y: source.y }
                return diagonal({ source: o, target: o })
            })
            .remove()

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x
            d.y0 = d.y
        })
    }

    // Toggle children on click.
    window.click = function click(d) {
        if (d.children) {
            d._children = d.children
            d.children = null
        } else {
            d.children = d._children
            d._children = null
        }
        update(d)
    }

}

draw()