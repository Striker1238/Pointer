namespace Domain.Entities
{
    public class Comment
    {
        public int Id { get; set; }
        public int PointId { get; set; }
        public string Text { get; set; } = "";
        public string BackgroundColor { get; set; } = "#ffffff";
    }
}
