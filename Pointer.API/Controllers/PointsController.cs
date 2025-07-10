using Application.DTO;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PointsController : ControllerBase
{
    private readonly IPointService _service;

    public PointsController(IPointService service)
    {
        _service = service;
    }

    /// <summary>
    /// Получить все точки
    /// </summary>
    /// <returns>Список всех точек с комментариями</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

    /// <summary>
    /// Получить точку по ID
    /// </summary>
    /// <param name="id">Идентификатор точки</param>
    /// <returns>Данные точки с комментариями</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id)
    {
        var point = await _service.GetAsync(id);
        return point is not null ? Ok(point) : NotFound();
    }

    /// <summary>
    /// Создать новую точку
    /// </summary>
    /// <param name="dto">Данные для создания точки</param>
    /// <returns>Созданная точка</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Post([FromBody] PointDto dto)
        => Ok(await _service.CreateAsync(dto));

    /// <summary>
    /// Обновить данные точки
    /// </summary>
    /// <param name="id">Идентификатор точки</param>
    /// <param name="dto">Новые данные точки</param>
    /// <returns>Обновленные данные точки</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Put(int id, [FromBody] PointDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return result is not null ? Ok(result) : NotFound();
    }

    /// <summary>
    /// Удалить точку
    /// </summary>
    /// <param name="id">Идентификатор точки</param>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    /// <summary>
    /// Добавить комментарий к точке
    /// </summary>
    /// <param name="pointId">Идентификатор точки</param>
    /// <param name="dto">Данные комментария</param>
    /// <returns>Добавленный комментарий</returns>
    [HttpPost("{pointId}/comments")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddComment(int pointId, [FromBody] CommentDto dto)
    {
        var result = await _service.AddCommentAsync(pointId, dto);
        return result is not null ? Ok(result) : NotFound();
    }
}
