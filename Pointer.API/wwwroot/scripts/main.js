$(document).ready(() => {
    const manager = new PointManager("#canvas-container", new ApiService("/api/points"));
    manager.init();

    $("#add-point-btn").on("click", () => {
        console.log("Кнопка нажата!");
        manager.showAddPointDialog();
    });

});