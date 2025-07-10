namespace Domain.Entities
{
    public class Point
    {
        public int Id { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Radius { get; set; }
        public string Color { get; set; } = "#000000";
        public List<Comment> Comments { get; set; } = new();
    }
}
