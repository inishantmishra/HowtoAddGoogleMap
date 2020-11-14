using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using POC.Services;
using POC.Web.Models;
using Microsoft.AspNetCore.Mvc;

namespace POC.Web.Controllers
{
    [Route("/poc/[controller]")]
    public class DistanceController : Controller
    {
        private readonly IDistanceService _distanceService;
        private readonly IMapper _mapper;

        public DistanceController(IDistanceService distanceService, IMapper mapper)
        {
            _distanceService = distanceService;
            _mapper = mapper;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet("GetAddresses")]
        public async Task<JsonResult> GetAddressesAsync()
        {
            var addressList = await _distanceService.GetAddresses().ConfigureAwait(false);
            List<AddressModel> addresses = _mapper.Map <List<AddressModel>>(addressList);
            return Json(addresses);
        }


    }
}
