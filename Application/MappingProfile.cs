using Application.DTO;
using AutoMapper;
using Domain.Entities;

namespace Application
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Point, PointDto>().ReverseMap();
            CreateMap<Comment, CommentDto>().ReverseMap();
        }
    }

}
