namespace ConsumablesInventory.API.Models
{
    public class InventoryTransaction
    {
        public int Id { get; set; }
        public int MaterialId { get; set; }
        public Material? Material { get; set; }

        /// <summary>
        /// 'INWARD' or 'OUTWARD'
        /// </summary>
        public string TransactionType { get; set; } = "INWARD";
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; } = 0.00m;
        public decimal TotalAmount { get; set; } = 0.00m;
        public int BalanceAfter { get; set; }

        public string? ReferenceNumber { get; set; } // PO # or Req #
        public string? PartyName { get; set; }       // Supplier Name or Department/Employee
        public string? HandledBy { get; set; }       // Receiver or Issuer
        public string? Remarks { get; set; }
        public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    }
}
