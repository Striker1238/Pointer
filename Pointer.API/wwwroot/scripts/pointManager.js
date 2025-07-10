class PointManager {
    constructor(containerSelector, api) {
        this.api = api;
        this.stage = new Konva.Stage({ container: containerSelector.slice(1), width: 1000, height: 600 });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);
    }

    async init() {
        const points = await this.api.getPoints();
        this.layer.destroyChildren();
        points.forEach(p => this.drawPoint(p));
    }

    drawPoint(p) {
        const circle = new Konva.Circle({
            x: p.x, y: p.y, radius: p.radius,
            fill: p.color, draggable: true
        });

        circle.on("dblclick", async () => {
            await this.api.deletePoint(p.id);
            this.init();
        });

        circle.on("dragend", async () => {
            const updated = { ...p, x: circle.x(), y: circle.y() };
            await this.api.updatePoint(updated);
        });

        this.layer.add(circle);
        this.layer.draw();
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