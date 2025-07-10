using Application;
using Application.DTO;
using Application.Interfaces;
using AutoMapper;
using Domain.Entities;
using Infrastructure;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;



namespace Tests
{
    public class PointServiceTests
    {
        private readonly IPointService _service;

        public PointServiceTests()
        {
            var db = new AppDbContext();

            ILoggerFactory loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());

            var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>(), loggerFactory);
            var mapper = config.CreateMapper();

            _service = new PointService(db, mapper);
        }

        [Fact]
        public async Task Can_Add_Point()
        {
            var point = new PointDto { X = 100, Y = 200, Radius = 10, Color = "#123456" };
            var result = await _service.CreateAsync(point);
            Assert.NotNull(result);
            Assert.Equal(100, result.X);
        }
    }
}