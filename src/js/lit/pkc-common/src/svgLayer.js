import { SvgBaseClass } from './svgBaseClass';
import { SvgCanvas } from './svgCanvas';

class SvgLayer extends SvgBaseClass {
    constructor(svg, name, optionsObj) {
        super();

        this.svgCanvas = svg;
        this.name = name;
        this.options = Object.assign({ height: 100, width: 100, columnWidth: 10, rowHeight: 10, showGrid: false, useGroupSelectionBlocker: false }, optionsObj);

        this.canvasColumnCount = Math.floor(this.width / this.columnWidth);
        this.canvasRowCount = Math.floor(this.height / this.rowHeight);

        this.layer;

        this._render();

    }

    get height() { return this.options.height; }
    get width() { return this.options.width; }
    get columnWidth() { return this.options.columnWidth; }
    get rowHeight() { return this.options.rowHeight; }
    get showGrid() { return this.options.showGrid; }
    get useGroupSelectionBlocker() { return this.options.useGroupSelectionBlocker; }

    _render() {
        var _self = this;
        _self.layer = _self.svgCanvas.group(null, this.name, {});
        if (_self.showGrid) {
            _self._renderGridLines();
        }
        if (_self.useGroupSelectionBlocker) {
            _self.drawBlock(_self.name + "-bgBlock", {
                col: 0, row: 0, colspan: _self.canvasColumnCount, rowspan: _self.canvasRowCount,
                colour: '#ffffff', crX: 0, crY: 0, opacity: 0
            });
        }
    }
    _renderGridLines() {
        var _self = this;
        var canvasWidthPx = this.width; var canvasHeightPx = this.height;
        //_self.gridLines = _self.svgCanvas.group(null, "gridLines", {});
        for (var i = 0; i <= _self.canvasColumnCount; i++) {
            if (i % 5 == 0) {
                var lineA = _self.drawLine(i * _self.columnWidth, 0, i * _self.columnWidth, canvasHeightPx, { stroke: "#dddddd", strokeWidth: "1px" });
                if (i > 0) {
                    _self.svgCanvas.text(_self.layer, i * _self.columnWidth, 12, i.toString(), { fill: "#dddddd", fontFamily: "verdana", fontSize: "1em", textAlign: 'center', textAnchor: 'middle' });
                }
            }
            else {
                var lineB = _self.drawLine(i * _self.columnWidth, 0, i * _self.columnWidth, canvasHeightPx, { stroke: "#eeeeee" });
            }
        }
        for (var i = 0; i <= _self.canvasRowCount; i++) {
            if (i % 5 == 0) {
                var lineC = _self.drawLine(0, i * _self.rowHeight, canvasWidthPx, i * _self.rowHeight, { stroke: "#dddddd", strokeWidth: "1px" });
                if (i > 0) {
                    _self.svgCanvas.text(_self.layer, 10, i * _self.rowHeight + 5, i.toString(), { fill: "#dddddd", fontFamily: "verdana", fontSize: "1em", textAlign: 'center', textAnchor: 'middle' });
                }
            }
            else {
                var lineD = _self.drawLine(0, i * _self.rowHeight, canvasWidthPx, i * _self.rowHeight, { stroke: "#eeeeee" });
            }
        }

    }


    // 'public' methods
    clear() {
        var _self = this;
        $(_self.svgCanvas._svg).find(new fstr("g#{0} > g").format([_self.name])).remove();
    }
    drawLine(fromX, fromY, toX, toY, stroke) {
        var _self = this;
        var _stroke = Object.assign({ stroke: "#cccccc", strokeWidth: "1px" }, stroke);
        _self.svgCanvas.line(_self.layer, fromX, fromY, toX, toY, _stroke);
    }
    drawPoint(col, row) {
        var _self = this;

        var locX = col * _self.columnWidth;
        var locY = row * _self.rowHeight;
        var numpoints = $(_self.layer).find("g[id*='ptGroup_']").length;
        var grp = _self.svgCanvas.group(_self.layer, "ptGroup_" + (numpoints + 1));
        _self.svgCanvas.circle(grp, locX, locY, 3);

        return grp;
    }
    drawBlock(blockname, dimObj = null, attrObj = null) {
        var _self = this;

        var dim = Object.assign({
            col: 1, row: 1, colspan: 5, rowspan: 5,
            colour: '#cccccc', crX: 0, crY: 0, opacity: 1
        }, dimObj);

        var attr = Object.assign({ col: dim.col, row: dim.row }, attrObj);

        var locX = dim.col * _self.columnWidth;
        var locY = dim.row * _self.rowHeight;
        var grp = _self.svgCanvas.group(_self.layer, blockname, { transform: "translate(" + locX + "," + locY + ")", opacity: dim.opacity });
        _self.svgCanvas.rect(grp, 0, 0, dim.colspan * _self.columnWidth, dim.rowspan * _self.rowHeight, dim.crX, dim.crY, { fill: dim.colour, stroke: "#999", strokeWidth: "1" });

        // if (typeof attr === 'object') {
        //     for (var key of Object.keys(attr)) {
        //         $(grp).attr(key, attr[key]);
        //     }
        // }
    }
    drawCustomShape(shapename, dimObj, polyFrameObj, attrObj) {
        var _self = this;

        var dim = Object.assign({
            col: 1, row: 1, colspan: 5, rowspan: 5,
            colour: '#cccccc', strokecolour: '#cccccc', crX: 0, crY: 0, opacity: 1,
            rotateByDegrees: 0
        }, dimObj);

        var attr = Object.assign({ col: dim.col, row: dim.row }, attrObj);

        var polyFrame = Object.assign({
            uX: 12, uY: 12, showOutline: false,
            points: [
                new Point(0, 10),
                new Point(0, 7),
                new Point(1, 7),
                new Point(1, 1),
                new Point(5, 1),
                new Point(5, 0),
                new Point(8, 0),
                new Point(8, 4),
                new Point(12, 4),
                new Point(12, 12),
                new Point(1, 12),
                new Point(1, 10)
            ]
        }, polyFrameObj);

        var rW = dim.colspan * _self.columnWidth;
        var rH = dim.rowspan * _self.rowHeight;
        var rW_Divs = polyFrame.uX;
        var rH_Divs = polyFrame.uY;
        var dX = rW / rW_Divs;
        var dY = rH / rH_Divs;

        var scaledPolyPoints = [];
        $.each(polyFrame.points, function (index, item) {
            var scaledPoint = new Point(item.X * dX, item.Y * dY);
            scaledPolyPoints.push(scaledPoint);
        });

        var xmap = $.map(scaledPolyPoints, function (point) { return point.X; });
        var ymap = $.map(scaledPolyPoints, function (point) { return point.Y; });
        var minX = Math.min.apply(null, xmap);
        var minY = Math.min.apply(null, ymap);
        var locX = minX * _self.columnWidth;
        var locY = minY * _self.rowHeight;
        var bgColour = new ColourSet(dim.colour);

        var actualPolyPoints = [];
        $.each(scaledPolyPoints, function (index, item) {
            var arrNewPoint = [xmap[index] - locX, ymap[index] - locY];
            actualPolyPoints.push(arrNewPoint);
        });

        var grp = _self.svgCanvas.group(_self.layer, shapename, { transform: new fstr("translate({0},{1}) rotate({2},{3},{4})").format([locX + dim.col * _self.columnWidth, locY + dim.row * _self.rowHeight, dim.rotateByDegrees, dim.colspan * _self.columnWidth / 2, dim.rowspan * _self.rowHeight / 2]), opacity: new fstr("{0}").format([dim.opacity]) });
        if (polyFrame.showOutline) {
            _self.svgCanvas.rect(grp, -5, -5, rW + 10, rH + 10, 3, 3, { fill: new fstr("#{0}").format(["dddddd"]), stroke: "dddddd", strokeWidth: "1" });
        }
        _self.svgCanvas.polygon(grp, actualPolyPoints,
            { fill: new fstr("{0}").format([dim.colour]), stroke: new fstr("{0}").format([dim.strokeColour]), strokeWidth: "1" });

        if (typeof attr === 'object') {
            for (var key of Object.keys(attr)) {
                $(grp).attr(key, attr[key]);
            }
        }

        return grp;

    }
    drawSvg(SvgGroupElementAssetObject, dimObj, attrObj) {
        var _self = this;

        var dim = Object.assign({
            col: 1, row: 1, colspan: 5, rowspan: 5,
            colour: '#cccccc', strokecolour: '#cccccc', crX: 0, crY: 0, opacity: 1,
            rotateByDegrees: 0, preserveAspect: false
        }, dimObj);

        var attr = Object.assign({ col: dim.col, row: dim.row }, attrObj);

        var rW = dim.colspan * _self.columnWidth;
        var rH = dim.rowspan * _self.rowHeight;

        var locX = dim.col * _self.columnWidth;
        var locY = dim.row * _self.rowHeight;
        var svgData = null;
        if (SvgGroupElementAssetObject instanceof SvgGroupElement) {
            var grp = _self.svgCanvas.group(_self.layer, SvgGroupElementAssetObject.name, { opacity: new fstr("{0}").format([dim.opacity]) });
            var transform = new fstr("translate({0},{1}) rotate({2},{3},{4})").format([locX, locY, dim.rotateByDegrees, dim.colspan * _self.columnWidth / 2, dim.rowspan * _self.rowHeight / 2]);
            $(grp).attr("transform", transform);
            svgData = $(SvgGroupElementAssetObject.elementCopy);
            if (svgData) {
                _self.svgCanvas.rect(grp, 0, 0, rW, rH, 3, 3, { fill: new fstr("#{0}").format(["dddddd"]), stroke: "dddddd", strokeWidth: "1" });
                var boundingGroup = _self.svgCanvas.group(grp, null, { opacity: new fstr("{0}").format([dim.opacity]) });
                $(boundingGroup).append(svgData);
                var bb = JSON.parse(JSON.stringify({ width: svgData[0].getBBox().width, height: svgData[0].getBBox().height }));
                var minScale = Math.min(...[rW / bb.width, rH / bb.height]);
                var newtransform = (dim.preserveAspect) ? new fstr("scale({0})").format([minScale]) : new fstr("scale({0},{1})").format([rW / bb.width, rH / bb.height]);
                $(boundingGroup).attr("transform", newtransform);
            }

            if (typeof attr === 'object') {
                for (var key of Object.keys(attr)) {
                    $(grp).attr(key, attr[key]);
                }
            }
        }
    }
    drawSvgRaw(SvgGroupElementAssetObject, attrObj) {
        var _self = this;

        var attr = Object.assign({}, attrObj);

        var svgData = null;
        if (SvgGroupElementAssetObject instanceof SvgGroupElement) {
            var grp = _self.svgCanvas.group(_self.layer, SvgGroupElementAssetObject.name, { opacity: "1" });
            svgData = $(SvgGroupElementAssetObject.elementCopy);
            if (svgData) {
                $(grp).append(svgData);
            }
            if (typeof attr === 'object') {
                for (var key of Object.keys(attr)) {
                    $(grp).attr(key, attr[key]);
                }
            }
        }
    }
    drawSvgRawAtCoords(SvgGroupElementAssetObject, dimObj, attrObj, cbOnClick) {
        var _self = this;

        var dim = Object.assign({
            col: 1, row: 1, opacity: "1"
        }, dimObj);

        var attr = Object.assign({ col: dim.col, row: dim.row, useDropElement: false }, attrObj);

        var locX = dim.col * _self.columnWidth;
        var locY = dim.row * _self.rowHeight;
        var svgData = null;
        if (SvgGroupElementAssetObject instanceof SvgGroupElement) {
            var grp = _self.svgCanvas.group(_self.layer, SvgGroupElementAssetObject.name, { transform: new fstr("translate({0},{1})").format([locX, locY]), opacity: dimObj.opacity });
            svgData = (attr.useDropElement) ? $(SvgGroupElementAssetObject.dropelement) : $(SvgGroupElementAssetObject.selectableelement);
            if (svgData) {
                if (typeof cbOnClick === 'function') {
                    $(svgData).unbind('click').bind('click', svgData => { cbOnClick(svgData); });
                }
                $(grp).append(svgData);
            }
            if (typeof attr === 'object') {
                for (var key of Object.keys(attr)) {
                    $(grp).attr(key, attr[key]);
                }
            }
            SvgGroupElementAssetObject.onPostRender(dimObj);
        }
    }
    drawQuadrantCurve(pt1, pt2, attrObj) {
        var _self = this;

        var _pt1 = Object.assign({ col: 0, row: 0, quadrant: 1 }, pt1);
        var _pt2 = Object.assign({ col: 0, row: 0, quadrant: 3 }, pt2);
        if (_pt1.col === _pt2.col && _pt1.row === _pt2.row) return; // nothing to draw

        var source = { x: _pt1.col * _self.columnWidth, y: _pt1.row * _self.rowHeight, q: _pt1.quadrant },
            target = { x: _pt2.col * _self.columnWidth, y: _pt2.row * _self.rowHeight, q: _pt2.quadrant };

        var attr = Object.assign({ col1: _pt1.col, row1: _pt1.row, col2: _pt2.col, row2: _pt2.row }, attrObj);
        var name = "c3__" + (new Uuid()).value;
        var grp = _self.svgCanvas.group(_self.layer, name, {});

        var curve = function (s, d) {
            var path = `M ${s.x} ${s.y} C ${(s.x + d.x) / 2} ${s.y}, ${(s.x + d.x) / 2} ${d.y}, ${d.x} ${d.y}`;
            switch (new fstr("{0}->{1}").format([s.q, d.q])) {
                case "1->1":
                    path = `M ${s.x} ${s.y} C ${(s.x + 0.1 * Math.abs(s.y - d.y))} ${s.y}, ${(d.x + 0.1 * Math.abs(s.y - d.y))} ${d.y}, ${d.x} ${d.y}`;
                    break;
                case "1->2":
                case "1->4":
                    path = `M ${s.x} ${s.y} C ${(s.x + d.x) / 2} ${s.y}, ${d.x} ${(d.y + s.y) / 2}, ${d.x} ${d.y}`;
                    break;
                case "2->1":
                case "2->3":
                    path = `M ${d.x} ${d.y} C ${(d.x + s.x) / 2} ${d.y}, ${s.x} ${(s.y + d.y) / 2}, ${s.x} ${s.y}`;
                    break;
                case "2->2":
                    path = `M ${s.x} ${s.y} C ${s.x} ${(s.y - 0.1 * Math.abs(s.x - d.x))}, ${d.x} ${d.y - 0.1 * Math.abs(s.x - d.x)}, ${d.x} ${d.y}`;
                    break;
                case "2->4":
                case "4->2":
                    path = `M ${s.x} ${s.y} C ${s.x} ${(s.y + d.y) / 2}, ${d.x} ${(s.y + d.y) / 2}, ${d.x} ${d.y}`;
                    break;
                case "3->2":
                case "3->4":
                    path = `M ${d.x} ${d.y} C ${d.x} ${(d.y + s.y) / 2}, ${(s.x + d.x) / 2} ${s.y}, ${s.x} ${s.y}`;
                    break;
                case "3->3":
                    path = `M ${s.x} ${s.y} C ${(s.x - 0.1 * Math.abs(s.y - d.y))} ${s.y}, ${(d.x - 0.1 * Math.abs(s.y - d.y))} ${d.y}, ${d.x} ${d.y}`;
                    break;
                case "4->1":
                    path = `M ${d.x} ${d.y} C ${(s.x + d.x) / 2} ${d.y}, ${s.x} ${(d.y + s.y) / 2}, ${s.x} ${s.y}`;
                    break;
                case "4->3":
                    path = `M ${s.x} ${s.y} C ${s.x} ${(d.y + s.y) / 2}, ${(s.x + d.x) / 2} ${d.y}, ${d.x} ${d.y}`;
                    break;
                case "4->4":
                    path = `M ${s.x} ${s.y} C ${s.x} ${(s.y + 0.1 * Math.abs(s.x - d.x))}, ${d.x} ${d.y + 0.1 * Math.abs(s.x - d.x)}, ${d.x} ${d.y}`;
                    break;
                case "3->1":
                default: // 1->3
                    break;
            }
            return path;
        }

        if (typeof attr === 'object') {
            for (var key of Object.keys(attr)) {
                $(grp).attr(key, attr[key]);
            }
        }

        var path = _self._createElement("path", { d: curve(source, target), fill: "none", stroke: "#444", "stroke-width": 2 });
        $(grp).append(path);

    }
    drawRoute(routeAsset, attrObj, cbOnClick) {
        var _self = this;

        var attr = Object.assign({}, attrObj);

        var svgData = null;
        if (routeAsset instanceof PxaAnchorRouteBase ||
            routeAsset instanceof PxaDraggableRouteBase) {
            var grp = _self.svgCanvas.group(_self.layer, routeAsset.name);
            svgData = $(routeAsset.elementCopy);
            if (svgData) {
                if (typeof cbOnClick === 'function') {
                    $(svgData).unbind('click').bind('click', svgData => { cbOnClick(svgData); });
                }
                $(grp).append(svgData);
            }
            if (typeof attrObj === 'object') {
                for (var key of Object.keys(attr)) {
                    $(grp).attr(key, attr[key]);
                }
            }
        }
    }

}

export { SvgLayer };
