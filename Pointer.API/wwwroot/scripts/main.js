$(document).ready(() => {
    const manager = new PointManager("#canvas-container", new ApiService("/api/points"));
    manager.init();
    $("#add-point").on("click", () => manager.addRandomPoint());
});