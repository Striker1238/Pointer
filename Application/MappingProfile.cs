using Application.DTO;
using AutoMapper;
using Domain.Entities;

namespace Application
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Point, PointDto>().ReverseMap()
                .ForMember(p => p.Comments, opt => opt.Ignore()); ;
            CreateMap<Comment, CommentDto>().ReverseMap();
        }
    }

}
