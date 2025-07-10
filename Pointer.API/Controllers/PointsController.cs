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

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] PointDto dto)
        => Ok(await _service.CreateAsync(dto));

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

}
