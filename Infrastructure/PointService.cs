using Application.DTO;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace Infrastructure
{
    public class PointService : IPointService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public PointService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<PointDto>> GetAllAsync()
        {
            var points = await _context.Points.Include(p => p.Comments).ToListAsync();
            return _mapper.Map<List<PointDto>>(points);
        }

        public async Task<PointDto> CreateAsync(PointDto dto)
        {
            var entity = _mapper.Map<Point>(dto);
            _context.Points.Add(entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<PointDto>(entity);
        }

        Task<PointDto> IPointService.GetAsync(int id)
        {
            throw new NotImplementedException();
        }

        Task IPointService.DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        Task<PointDto> IPointService.UpdateAsync(int id, PointDto dto)
        {
            throw new NotImplementedException();
        }

        Task<CommentDto> IPointService.AddCommentAsync(int pointId, CommentDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
