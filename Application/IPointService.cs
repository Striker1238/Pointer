using Application.DTO;

namespace Application.Interfaces
{
    public interface IPointService
    {
        Task<List<PointDto>> GetAllAsync();
        Task<PointDto> GetAsync(int id);
        Task<PointDto> CreateAsync(PointDto dto);
        Task DeleteAsync(int id);
        Task<PointDto> UpdateAsync(int id, PointDto dto);
        Task<CommentDto> AddCommentAsync(int pointId, CommentDto dto);
    }
}
