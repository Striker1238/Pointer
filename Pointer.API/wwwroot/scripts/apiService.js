class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async getPoints() {
        return $.getJSON(this.baseUrl);
    }

    async addPoint(point) {
        return $.ajax({
            url: this.baseUrl,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(point)
        });
    }

    async updatePoint(point) {
        return $.ajax({
            url: `${this.baseUrl}/${point.id}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(point)
        });
    }

    async deletePoint(id) {
        return $.ajax({
            url: `${this.baseUrl}/${id}`,
            method: "DELETE"
        });
    }
}