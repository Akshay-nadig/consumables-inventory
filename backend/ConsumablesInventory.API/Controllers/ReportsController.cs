using ConsumablesInventory.API.Data;
using ConsumablesInventory.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace ConsumablesInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("monthly-movement")]
        public async Task<ActionResult<MonthlyMovementReportDto>> GetMonthlyMovementReport(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] int? categoryId)
        {
            var now = DateTime.UtcNow;
            var reportYear = year ?? now.Year;
            var reportMonth = month ?? now.Month;

            var startDate = new DateTime(reportYear, reportMonth, 1, 0, 0, 0, DateTimeKind.Utc);
            var endDate = startDate.AddMonths(1);

            var materialsQuery = _context.Materials
                .Include(m => m.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                materialsQuery = materialsQuery.Where(m => m.CategoryId == categoryId.Value);
            }

            var materials = await materialsQuery.OrderBy(m => m.CategoryId).ThenBy(m => m.Name).ToListAsync();

            // Fetch transactions for the target month
            var monthTransactions = await _context.InventoryTransactions
                .Where(t => t.TransactionDate >= startDate && t.TransactionDate < endDate)
                .ToListAsync();

            // Fetch transactions after this month (to accurately back-calculate opening/closing balances if needed)
            var laterTransactions = await _context.InventoryTransactions
                .Where(t => t.TransactionDate >= endDate)
                .ToListAsync();

            var itemReports = new List<ItemMonthlyMovementDto>();

            foreach (var material in materials)
            {
                var matMonthTxs = monthTransactions.Where(t => t.MaterialId == material.Id).ToList();
                var inQty = matMonthTxs.Where(t => t.TransactionType == "INWARD").Sum(t => t.Quantity);
                var outQty = matMonthTxs.Where(t => t.TransactionType == "OUTWARD").Sum(t => t.Quantity);

                // Closing stock calculation
                var netMovementAfterMonth = laterTransactions
                    .Where(t => t.MaterialId == material.Id)
                    .Sum(t => t.TransactionType == "INWARD" ? t.Quantity : -t.Quantity);

                var closingStockAtMonthEnd = material.CurrentStock - netMovementAfterMonth;
                var openingStockAtMonthStart = closingStockAtMonthEnd - inQty + outQty;

                itemReports.Add(new ItemMonthlyMovementDto
                {
                    MaterialId = material.Id,
                    ItemCode = material.ItemCode,
                    Name = material.Name,
                    CategoryName = material.Category?.Name ?? "Uncategorized",
                    UnitOfMeasure = material.UnitOfMeasure,
                    OpeningStock = Math.Max(0, openingStockAtMonthStart),
                    InwardQuantity = inQty,
                    OutwardQuantity = outQty,
                    ClosingStock = Math.Max(0, closingStockAtMonthEnd),
                    UnitPrice = material.UnitPrice,
                    TotalInwardValue = matMonthTxs.Where(t => t.TransactionType == "INWARD").Sum(t => t.TotalAmount),
                    TotalOutwardValue = matMonthTxs.Where(t => t.TransactionType == "OUTWARD").Sum(t => t.TotalAmount)
                });
            }

            var totalInwardUnits = itemReports.Sum(i => i.InwardQuantity);
            var totalOutwardUnits = itemReports.Sum(i => i.OutwardQuantity);
            var totalInwardAmount = itemReports.Sum(i => i.TotalInwardValue);
            var totalOutwardAmount = itemReports.Sum(i => i.TotalOutwardValue);

            var report = new MonthlyMovementReportDto
            {
                Year = reportYear,
                Month = reportMonth,
                MonthName = startDate.ToString("MMMM yyyy"),
                TotalInwardUnits = totalInwardUnits,
                TotalOutwardUnits = totalOutwardUnits,
                TotalInwardAmount = totalInwardAmount,
                TotalOutwardAmount = totalOutwardAmount,
                NetStockChange = totalInwardUnits - totalOutwardUnits,
                Items = itemReports
            };

            return Ok(report);
        }

        [HttpGet("monthly-movement/export-csv")]
        public async Task<IActionResult> ExportMonthlyMovementCsv(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] int? categoryId)
        {
            var result = await GetMonthlyMovementReport(year, month, categoryId);
            if (result.Result is not OkObjectResult okResult || okResult.Value is not MonthlyMovementReportDto report)
            {
                return BadRequest("Unable to generate CSV report.");
            }

            var csv = new StringBuilder();
            csv.AppendLine($"Monthly Stock Movement Report - {report.MonthName}");
            csv.AppendLine($"Generated on: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            csv.AppendLine($"Summary: Total Inward Units: {report.TotalInwardUnits}, Total Outward Units: {report.TotalOutwardUnits}, Net Change: {report.NetStockChange}");
            csv.AppendLine();
            csv.AppendLine("Item Code,Material Name,Category,Unit,Opening Stock,Inward Qty,Outward Qty,Closing Stock,Unit Price,Inward Value,Outward Value");

            foreach (var item in report.Items)
            {
                var safeName = $"\"{item.Name.Replace("\"", "\"\"")}\"";
                var safeCat = $"\"{item.CategoryName.Replace("\"", "\"\"")}\"";
                csv.AppendLine($"{item.ItemCode},{safeName},{safeCat},{item.UnitOfMeasure},{item.OpeningStock},{item.InwardQuantity},{item.OutwardQuantity},{item.ClosingStock},{item.UnitPrice:F2},{item.TotalInwardValue:F2},{item.TotalOutwardValue:F2}");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            var fileName = $"StockMovementReport_{report.Year}_{report.Month:D2}.csv";
            return File(bytes, "text/csv", fileName);
        }
    }
}
