using ConsumablesInventory.API.Data;
using ConsumablesInventory.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConsumablesInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MaterialsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Material>>> GetMaterials(
            [FromQuery] int? categoryId,
            [FromQuery] string? search,
            [FromQuery] string? status)
        {
            var query = _context.Materials
                .Include(m => m.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId.Value > 0)
            {
                query = query.Where(m => m.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(m => m.Name.ToLower().Contains(term)
                                      || m.ItemCode.ToLower().Contains(term)
                                      || (m.StorageLocation != null && m.StorageLocation.ToLower().Contains(term))
                                      || (m.Description != null && m.Description.ToLower().Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var st = status.Trim().ToLower();
                if (st == "low")
                {
                    query = query.Where(m => m.CurrentStock > 0 && m.CurrentStock <= m.MinimumReorderLevel);
                }
                else if (st == "out")
                {
                    query = query.Where(m => m.CurrentStock <= 0);
                }
                else if (st == "healthy")
                {
                    query = query.Where(m => m.CurrentStock > m.MinimumReorderLevel);
                }
            }

            var results = await query
                .OrderBy(m => m.CategoryId)
                .ThenBy(m => m.Name)
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Material>> GetMaterial(int id)
        {
            var material = await _context.Materials
                .Include(m => m.Category)
                .Include(m => m.Transactions.OrderByDescending(t => t.TransactionDate).Take(10))
                .FirstOrDefaultAsync(m => m.Id == id);

            if (material == null)
            {
                return NotFound(new { message = $"Material with ID {id} not found." });
            }

            return Ok(material);
        }

        [HttpPost]
        public async Task<ActionResult<Material>> CreateMaterial([FromBody] CreateMaterialDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if ItemCode already exists
            if (await _context.Materials.AnyAsync(m => m.ItemCode.ToLower() == dto.ItemCode.ToLower()))
            {
                return BadRequest(new { message = $"Material code '{dto.ItemCode}' already exists." });
            }

            // Check if Category exists
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
            {
                return BadRequest(new { message = $"Invalid CategoryId {dto.CategoryId}." });
            }

            var material = new Material
            {
                ItemCode = dto.ItemCode.Trim().ToUpper(),
                Name = dto.Name.Trim(),
                CategoryId = dto.CategoryId,
                Description = dto.Description?.Trim(),
                UnitOfMeasure = dto.UnitOfMeasure.Trim(),
                CurrentStock = dto.InitialStock,
                MinimumReorderLevel = dto.MinimumReorderLevel,
                UnitPrice = dto.UnitPrice,
                PreviousCost = 0.00m,
                PreviousCostStock = 0,
                CurrentCostStock = dto.InitialStock,
                StorageLocation = dto.StorageLocation?.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.Materials.Add(material);
            await _context.SaveChangesAsync();

            // Record initial cost history entry
            var costHistory = new MaterialCostHistory
            {
                MaterialId = material.Id,
                PreviousCost = 0.00m,
                NewCost = dto.UnitPrice,
                ChangeReason = "Initial Item Registration",
                ChangedBy = "System Administrator",
                EffectiveDate = DateTime.UtcNow,
                Notes = $"Initial standard unit cost recorded at ₹{dto.UnitPrice:F2}"
            };
            _context.MaterialCostHistories.Add(costHistory);

            // If initial stock was entered, log an opening INWARD transaction
            if (dto.InitialStock > 0)
            {
                var initialTx = new InventoryTransaction
                {
                    MaterialId = material.Id,
                    TransactionType = "INWARD",
                    Quantity = dto.InitialStock,
                    UnitPrice = dto.UnitPrice,
                    TotalAmount = dto.InitialStock * dto.UnitPrice,
                    BalanceAfter = dto.InitialStock,
                    ReferenceNumber = "INIT-STOCK",
                    PartyName = "Initial Stock Audit",
                    HandledBy = "System Administrator",
                    Remarks = "Opening balance entry during material registration",
                    TransactionDate = DateTime.UtcNow
                };

                _context.InventoryTransactions.Add(initialTx);
            }

            await _context.SaveChangesAsync();

            // Return created material with category populated
            material.Category = category;
            return CreatedAtAction(nameof(GetMaterial), new { id = material.Id }, material);
        }

        [HttpGet("{id}/cost-history")]
        public async Task<ActionResult<IEnumerable<MaterialCostHistoryDto>>> GetCostHistory(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = $"Material with ID {id} not found." });
            }

            var history = await _context.MaterialCostHistories
                .Where(h => h.MaterialId == id)
                .OrderByDescending(h => h.EffectiveDate)
                .ThenByDescending(h => h.Id)
                .Select(h => new MaterialCostHistoryDto
                {
                    Id = h.Id,
                    MaterialId = h.MaterialId,
                    MaterialName = material.Name,
                    ItemCode = material.ItemCode,
                    PreviousCost = h.PreviousCost,
                    NewCost = h.NewCost,
                    ChangeReason = h.ChangeReason,
                    ChangedBy = h.ChangedBy,
                    EffectiveDate = h.EffectiveDate,
                    Notes = h.Notes
                })
                .ToListAsync();

            return Ok(history);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMaterial(int id, [FromBody] UpdateMaterialDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var material = await _context.Materials.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = $"Material with ID {id} not found." });
            }

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null)
            {
                return BadRequest(new { message = $"Invalid CategoryId {dto.CategoryId}." });
            }

            // Check if Unit Cost has changed
            bool priceChanged = material.UnitPrice != dto.UnitPrice;
            if (priceChanged)
            {
                // Preserve existing stock in PreviousCost bucket!
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
                material.CurrentCostStock = 0; // ready for newly inwarded stock at the new unit cost

                var history = new MaterialCostHistory
                {
                    MaterialId = material.Id,
                    PreviousCost = material.UnitPrice,
                    NewCost = dto.UnitPrice,
                    ChangeReason = string.IsNullOrWhiteSpace(dto.ChangeReason) ? "Manual Cost Adjustment" : dto.ChangeReason.Trim(),
                    ChangedBy = string.IsNullOrWhiteSpace(dto.ChangedBy) ? "Store Manager" : dto.ChangedBy.Trim(),
                    EffectiveDate = DateTime.UtcNow,
                    Notes = $"Unit cost adjusted from ₹{material.UnitPrice:F2} to ₹{dto.UnitPrice:F2}. Existing {material.PreviousCostStock} {material.UnitOfMeasure} held at ₹{material.PreviousCost:F2}."
                };
                _context.MaterialCostHistories.Add(history);

                material.UnitPrice = dto.UnitPrice;
            }

            material.Name = dto.Name.Trim();
            material.CategoryId = dto.CategoryId;
            material.Description = dto.Description?.Trim();
            material.UnitOfMeasure = dto.UnitOfMeasure.Trim();
            material.MinimumReorderLevel = dto.MinimumReorderLevel;
            material.StorageLocation = dto.StorageLocation?.Trim();
            material.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            material.Category = category;
            return Ok(material);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
            {
                return NotFound(new { message = $"Material with ID {id} not found." });
            }

            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Material {material.Name} ({material.ItemCode}) removed successfully." });
        }
    }
}
