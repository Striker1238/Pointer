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

        /// <summary>
        /// Получает список всех точек из базы данных с их комментариями и преобразует в DTO
        /// </summary>
        /// <returns>
        /// Список объектов <see cref="PointDto"/>, содержащих:
        /// <list type="bullet">
        ///   <item>Данные о точке</item>
        ///   <item>Связанные комментарии</item>
        /// </list>
        /// </returns>
        public async Task<List<PointDto>> GetAllAsync()
        {
            var points = await _context.Points
                .Include(p => p.Comments)
                .ToListAsync();
            return _mapper.Map<List<PointDto>>(points);
        }

        /// <summary>
        /// Создает новую точку в базе данных на основе предоставленных данных
        /// </summary>
        /// <param name="dto">DTO объект с данными для создания новой точки</param>
        /// <returns>
        /// DTO объект созданной точки с актуальными данными из базы,
        /// включая сгенерированный идентификатор
        /// </returns>
        /// <exception cref="ArgumentNullException">Возникает если dto равен null</exception>
        /// <exception cref="DbUpdateException">Возникает при ошибке сохранения в БД</exception>
        public async Task<PointDto> CreateAsync(PointDto dto)
        {
            if (dto is null) throw new ArgumentNullException(nameof(dto));

            var entity = _mapper.Map<Point>(dto);
            _context.Points.Add(entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<PointDto>(entity);
        }

        /// <summary>
        /// Получает точку по указанному идентификатору с загруженными комментариями
        /// </summary>
        /// <param name="id">Идентификатор точки</param>
        /// <returns>
        /// DTO объект точки с комментариями или null, если точка не найдена
        /// </returns>
        public async Task<PointDto> GetAsync(int id)
        {
            var point = await _context.Points
                .Where(p => p.Id == id)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync();

            return _mapper.Map<PointDto>(point);
        }

        /// <summary>
        /// Удаляет точку с указанным идентификатором
        /// </summary>
        /// <param name="id">Идентификатор точки для удаления</param>
        /// <remarks>
        /// Все связанные комментарии удаляются каскадно.
        /// </remarks>
        public async Task DeleteAsync(int id)
        {
            var point = await _context.Points
                .Where(p => p.Id == id)
                .FirstOrDefaultAsync();

            if (point is not null)
            {
                _context.Points.Remove(point);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Обновляет данные существующей точки
        /// </summary>
        /// <param name="id">Идентификатор обновляемой точки</param>
        /// <param name="dto">DTO объект с новыми данными точки</param>
        /// <returns>
        /// DTO объект с обновленными данными или null, если точка не найдена
        /// </returns>
        /// <exception cref="ArgumentNullException">Возникает если dto равен null</exception>
        public async Task<PointDto> UpdateAsync(int id, PointDto dto)
        {
            if (dto is null) throw new ArgumentNullException(nameof(dto));

            var point = await _context.Points
                .Where(p => p.Id == id)
                .Include(p => p.Comments)
                .FirstOrDefaultAsync();

            if (point is not null)
            {
                _mapper.Map(dto, point);
                _context.Points.Update(point);
                await _context.SaveChangesAsync();
                return _mapper.Map<PointDto>(point);
            }

            return null;
        }

        /// <summary>
        /// Добавляет новый комментарий к указанной точке
        /// </summary>
        /// <param name="pointId">Идентификатор точки для добавления комментария</param>
        /// <param name="dto">DTO объект с данными комментария</param>
        /// <returns>
        /// DTO объект добавленного комментария или null, если точка не найдена
        /// </returns>
        /// <exception cref="ArgumentNullException">Возникает если dto равен null</exception>
        public async Task<CommentDto> AddCommentAsync(int pointId, CommentDto dto)
        {
            var point = await _context.Points
                .Where(p => p.Id == pointId)
                .FirstOrDefaultAsync();

            if (point is null)
                throw new KeyNotFoundException($"Point with id {pointId} not found");


            var comment = _mapper.Map<Comment>(dto);
            point.Comments.Add(comment);

            await _context.SaveChangesAsync();
            return _mapper.Map<CommentDto>(comment);
        }
    }
}
