using ConsumablesInventory.API.Data;
using ConsumablesInventory.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConsumablesInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryTransaction>>> GetTransactions(
            [FromQuery] int? materialId,
            [FromQuery] string? type,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] int limit = 100)
        {
            var query = _context.InventoryTransactions
                .Include(t => t.Material)
                .ThenInclude(m => m!.Category)
                .AsQueryable();

            if (materialId.HasValue && materialId.Value > 0)
            {
                query = query.Where(t => t.MaterialId == materialId.Value);
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                query = query.Where(t => t.TransactionType.ToUpper() == type.Trim().ToUpper());
            }

            if (startDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate <= endDate.Value);
            }

            var transactions = await query
                .OrderByDescending(t => t.TransactionDate)
                .ThenByDescending(t => t.Id)
                .Take(limit)
                .ToListAsync();

            return Ok(transactions);
        }

        [HttpPost("inward")]
        public async Task<ActionResult<InventoryTransaction>> RecordInward([FromBody] CreateInwardTransactionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.Quantity <= 0)
            {
                return BadRequest(new { message = "Quantity must be greater than zero." });
            }

            var material = await _context.Materials.FindAsync(dto.MaterialId);
            if (material == null)
            {
                return NotFound(new { message = $"Material with ID {dto.MaterialId} not found." });
            }

            var inwardUnitPrice = dto.UnitPrice ?? material.UnitPrice;
            if (!string.IsNullOrWhiteSpace(dto.StorageLocation))
            {
                material.StorageLocation = dto.StorageLocation.Trim();
            }

            bool priceChanged = dto.UnitPrice.HasValue && dto.UnitPrice.Value > 0 && dto.UnitPrice.Value != material.UnitPrice;

            if (priceChanged)
            {
                // Inward unit price is different from the current material unit price.
                // Move existing stock to PreviousCost bucket!
                int totalRemainingStock = material.CurrentStock;
                if (totalRemainingStock > 0)
                {
                    decimal totalRemainingValue = (material.PreviousCostStock * material.PreviousCost) + (material.CurrentCostStock * material.UnitPrice);
                    material.PreviousCost = Math.Round(totalRemainingValue / totalRemainingStock, 2);
                    material.PreviousCostStock = totalRemainingStock;
                }
                else
                {
                    material.PreviousCost = material.UnitPrice;
                    material.PreviousCostStock = 0;
                }

                var costHistory = new MaterialCostHistory
                {
                    MaterialId = material.Id,
                    PreviousCost = material.UnitPrice,
                    NewCost = dto.UnitPrice!.Value,
                    ChangeReason = $"Stock Inward ({dto.ReferenceNumber?.Trim() ?? "Receipt"})",
                    ChangedBy = dto.ReceivedBy?.Trim() ?? "Storekeeper",
                    EffectiveDate = dto.TransactionDate ?? DateTime.UtcNow,
                    Notes = $"Inward of {dto.Quantity} {material.UnitOfMeasure} at ₹{dto.UnitPrice.Value:F2}. Preserved {material.PreviousCostStock} {material.UnitOfMeasure} at ₹{material.PreviousCost:F2}."
                };
                _context.MaterialCostHistories.Add(costHistory);

                material.UnitPrice = dto.UnitPrice.Value;
                material.CurrentCostStock = dto.Quantity;
            }
            else
            {
                material.CurrentCostStock += dto.Quantity;
            }

            // Sync total stock from both buckets
            material.CurrentStock = material.PreviousCostStock + material.CurrentCostStock;
            material.UpdatedAt = DateTime.UtcNow;

            var transaction = new InventoryTransaction
            {
                MaterialId = material.Id,
                TransactionType = "INWARD",
                Quantity = dto.Quantity,
                UnitPrice = inwardUnitPrice,
                TotalAmount = dto.Quantity * inwardUnitPrice,
                BalanceAfter = material.CurrentStock,
                ReferenceNumber = dto.ReferenceNumber?.Trim(),
                PartyName = dto.SupplierName?.Trim() ?? "Vendor Direct",
                HandledBy = dto.ReceivedBy?.Trim() ?? "Storekeeper",
                Remarks = dto.Remarks?.Trim(),
                TransactionDate = dto.TransactionDate ?? DateTime.UtcNow
            };

            _context.InventoryTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            transaction.Material = material;
            return Ok(transaction);
        }

        [HttpPost("outward")]
        public async Task<ActionResult<InventoryTransaction>> RecordOutward([FromBody] CreateOutwardTransactionDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.Quantity <= 0)
            {
                return BadRequest(new { message = "Quantity must be greater than zero." });
            }

            var material = await _context.Materials.FindAsync(dto.MaterialId);
            if (material == null)
            {
                return NotFound(new { message = $"Material with ID {dto.MaterialId} not found." });
            }

            // Check available stock
            if (material.CurrentStock < dto.Quantity)
            {
                return BadRequest(new
                {
                    message = $"Insufficient stock for {material.Name}. Available stock: {material.CurrentStock} {material.UnitOfMeasure}, Requested: {dto.Quantity} {material.UnitOfMeasure}."
                });
            }

            // FIFO Outward Deduction: consume from PreviousCostStock first, then CurrentCostStock
            int remainingToDeduct = dto.Quantity;
            int deductedFromPrevious = 0;
            int deductedFromCurrent = 0;

            if (material.PreviousCostStock > 0)
            {
                if (material.PreviousCostStock >= remainingToDeduct)
                {
                    material.PreviousCostStock -= remainingToDeduct;
                    deductedFromPrevious = remainingToDeduct;
                    remainingToDeduct = 0;
                }
                else
                {
                    deductedFromPrevious = material.PreviousCostStock;
                    remainingToDeduct -= material.PreviousCostStock;
                    material.PreviousCostStock = 0;
                }
            }

            if (remainingToDeduct > 0)
            {
                deductedFromCurrent = remainingToDeduct;
                material.CurrentCostStock = Math.Max(0, material.CurrentCostStock - remainingToDeduct);
            }

            material.CurrentStock = material.PreviousCostStock + material.CurrentCostStock;
            material.UpdatedAt = DateTime.UtcNow;

            // Outward transaction valuation (weighted by consumed costs)
            decimal totalDeductedVal = (deductedFromPrevious * material.PreviousCost) + (deductedFromCurrent * material.UnitPrice);
            decimal outwardUnitPrice = dto.Quantity > 0 ? Math.Round(totalDeductedVal / dto.Quantity, 2) : material.UnitPrice;

            var transaction = new InventoryTransaction
            {
                MaterialId = material.Id,
                TransactionType = "OUTWARD",
                Quantity = dto.Quantity,
                UnitPrice = outwardUnitPrice,
                TotalAmount = totalDeductedVal,
                BalanceAfter = material.CurrentStock,
                ReferenceNumber = dto.ReferenceNumber?.Trim(),
                PartyName = dto.DepartmentOrEmployee.Trim(),
                HandledBy = dto.IssuedBy?.Trim() ?? "Storekeeper",
                Remarks = dto.Remarks?.Trim(),
                TransactionDate = dto.TransactionDate ?? DateTime.UtcNow
            };

            _context.InventoryTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            transaction.Material = material;
            return Ok(transaction);
        }
    }
}
