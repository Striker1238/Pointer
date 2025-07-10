namespace Application.DTO
{
    public class PointDto
    {
        public int Id { get; set; }
        public float X { get; set; }
        public float Y { get; set; }
        public float Radius { get; set; }
        public string Color { get; set; } = "#000000";
        public List<CommentDto> Comments { get; set; } = new();
    }
}
