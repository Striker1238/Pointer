class PointManager {
    constructor(containerSelector, api) {
        this.api = api;
        this.stage = new Konva.Stage({
            container: containerSelector.slice(1),
            width: 1000,
            height: 600
        });

        this.commentsLayer = new Konva.Layer();
        this.pointsLayer = new Konva.Layer();

        this.stage.add(this.commentsLayer);
        this.stage.add(this.pointsLayer);

        this.commentGroups = {};
    }

    async init() {
        const points = await this.api.getPoints();

        this.commentsLayer.destroyChildren();
        this.pointsLayer.destroyChildren();

        points.forEach(p => {
            if (p.comments && p.comments.length > 0) {
                this.drawComments(p);
            }
        });

        points.forEach(p => this.drawPoint(p));

        this.pointsLayer.batchDraw();
        this.commentsLayer.batchDraw();
    }

    drawPoint(p) {
        const circle = new Konva.Circle({
            x: p.x,
            y: p.y,
            radius: p.radius,
            fill: p.color,
            draggable: true,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOpacity: 0.3,
            stroke: 'black',
            strokeWidth: 0.5
        });

        circle.on("dblclick", async () => {
            await this.api.deletePoint(p.id);
            this.init();
        });
        circle.on("dragmove", () => {
            this.updateCommentPosition(p.id, circle.x(), circle.y());
        });

        circle.on("dragend", async () => {
            const updated = { ...p, x: circle.x(), y: circle.y() };
            await this.api.updatePoint(updated);
        });

        this.pointsLayer.add(circle);
        this.pointsLayer.batchDraw();
    }

    drawComments(point) {
        if (this.commentGroups[point.id]) {
            this.commentGroups[point.id].destroy();
        }

        const group = new Konva.Group({
            x: point.x - 100,
            y: point.y + point.radius + 15,
            draggable: false,
            listening: false
        });

        const commentHeight = 30;
        const padding = 10;
        const totalHeight = point.comments.length * commentHeight + padding * 2;

        const bg = new Konva.Rect({
            width: 200,
            height: totalHeight,
            fill: 'rgba(255,255,255,0.9)',
            stroke: '#ddd',
            strokeWidth: 1,
            cornerRadius: 5,
            listening: false
        });

        group.add(bg);

        point.comments.forEach((comment, index) => {
            const text = new Konva.Text({
                x: 10,
                y: padding + index * commentHeight,
                width: 180,
                text: this.truncateComment(comment.text),
                fontSize: 12,
                fill: '#333',
                align: 'left',
                wrap: 'word',
                ellipsis: true,
                listening: false
            });
            group.add(text);
        });


        const button = new Konva.button();

        this.commentsLayer.add(group);
        this.commentGroups[point.id] = group;
    }

    updateCommentPosition(pointId, x, y) {
        const group = this.commentGroups[pointId];
        if (group) {
            group.position({
                x: x - 100,
                y: y + 45
            });
            this.commentsLayer.batchDraw();
        }
    }

    truncateComment(text, maxLength = 70) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    async addRandomPoint() {
        const point = {
            x: Math.random() * 800 + 50,
            y: Math.random() * 500 + 50,
            radius: 30,
            color: this.randomColor(),
            comments: []
        };
        await this.api.addPoint(point);
        this.init();
    }

    randomColor() {
        return getRandomColor();
    }
}
