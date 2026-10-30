using ConsumablesInventory.API.Data;
using ConsumablesInventory.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConsumablesInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);

            var materials = await _context.Materials
                .Include(m => m.Category)
                .ToListAsync();

            var categories = await _context.Categories.ToListAsync();

            var recentTransactions = await _context.InventoryTransactions
                .Include(t => t.Material)
                .ThenInclude(m => m!.Category)
                .OrderByDescending(t => t.TransactionDate)
                .Take(8)
                .ToListAsync();

            // Monthly Inward and Outward for current month
            var currentMonthTxs = await _context.InventoryTransactions
                .Where(t => t.TransactionDate >= startOfMonth)
                .ToListAsync();

            var inwardThisMonth = currentMonthTxs.Where(t => t.TransactionType == "INWARD").Sum(t => t.Quantity);
            var outwardThisMonth = currentMonthTxs.Where(t => t.TransactionType == "OUTWARD").Sum(t => t.Quantity);

            // Category breakdown
            var categoryBreakdown = categories.Select(cat =>
            {
                var catMaterials = materials.Where(m => m.CategoryId == cat.Id).ToList();
                return new CategoryStockSummaryDto
                {
                    CategoryId = cat.Id,
                    CategoryName = cat.Name,
                    TotalItems = catMaterials.Count,
                    TotalUnits = catMaterials.Sum(m => m.CurrentStock),
                    Valuation = catMaterials.Sum(m => (m.PreviousCostStock * m.PreviousCost) + (m.CurrentCostStock * m.UnitPrice)),
                    LowStockCount = catMaterials.Count(m => m.CurrentStock <= m.MinimumReorderLevel)
                };
            }).ToList();

            // Monthly Trend (Past 6 months)
            var monthlyTrend = new List<MonthlyMovementSummaryDto>();
            for (int i = 5; i >= 0; i--)
            {
                var monthDate = now.AddMonths(-i);
                var mStart = new DateTime(monthDate.Year, monthDate.Month, 1);
                var mEnd = mStart.AddMonths(1);

                var txs = await _context.InventoryTransactions
                    .Where(t => t.TransactionDate >= mStart && t.TransactionDate < mEnd)
                    .ToListAsync();

                var inQty = txs.Where(t => t.TransactionType == "INWARD").Sum(t => t.Quantity);
                var outQty = txs.Where(t => t.TransactionType == "OUTWARD").Sum(t => t.Quantity);
                var inVal = txs.Where(t => t.TransactionType == "INWARD").Sum(t => t.TotalAmount);
                var outVal = txs.Where(t => t.TransactionType == "OUTWARD").Sum(t => t.TotalAmount);

                monthlyTrend.Add(new MonthlyMovementSummaryDto
                {
                    Year = monthDate.Year,
                    Month = monthDate.Month,
                    MonthLabel = monthDate.ToString("MMM yyyy"),
                    InwardQuantity = inQty,
                    OutwardQuantity = outQty,
                    InwardValue = inVal,
                    OutwardValue = outVal,
                    NetMovement = inQty - outQty
                });
            }

            var lowStockAlerts = materials
                .Where(m => m.CurrentStock <= m.MinimumReorderLevel)
                .OrderBy(m => m.CurrentStock)
                .Take(10)
                .ToList();

            var summary = new DashboardSummaryDto
            {
                TotalItems = materials.Count,
                TotalStockUnits = materials.Sum(m => m.CurrentStock),
                LowStockItemsCount = materials.Count(m => m.CurrentStock <= m.MinimumReorderLevel && m.CurrentStock > 0),
                OutOfStockItemsCount = materials.Count(m => m.CurrentStock <= 0),
                TotalInventoryValue = materials.Sum(m => (m.PreviousCostStock * m.PreviousCost) + (m.CurrentCostStock * m.UnitPrice)),
                ThisMonthInwardQuantity = inwardThisMonth,
                ThisMonthOutwardQuantity = outwardThisMonth,
                CategoryBreakdown = categoryBreakdown,
                MonthlyTrend = monthlyTrend,
                LowStockAlerts = lowStockAlerts,
                RecentTransactions = recentTransactions
            };

            return Ok(summary);
        }
    }
}
