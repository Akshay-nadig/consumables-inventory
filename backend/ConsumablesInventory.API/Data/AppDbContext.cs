using ConsumablesInventory.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ConsumablesInventory.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Material> Materials => Set<Material>();
        public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
        public DbSet<MaterialCostHistory> MaterialCostHistories => Set<MaterialCostHistory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(20);
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<Material>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ItemCode).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.UnitOfMeasure).IsRequired().HasMaxLength(50);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.PreviousCost).HasPrecision(18, 2);
                entity.HasIndex(e => e.ItemCode).IsUnique();

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Materials)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<InventoryTransaction>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TransactionType).IsRequired().HasMaxLength(20);
                entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
                entity.Property(e => e.TotalAmount).HasPrecision(18, 2);

                entity.HasOne(e => e.Material)
                      .WithMany(m => m.Transactions)
                      .HasForeignKey(e => e.MaterialId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TransactionDate);
                entity.HasIndex(e => e.TransactionType);
            });

            modelBuilder.Entity<MaterialCostHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PreviousCost).HasPrecision(18, 2);
                entity.Property(e => e.NewCost).HasPrecision(18, 2);
                entity.Property(e => e.ChangeReason).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ChangedBy).HasMaxLength(100);
                entity.Property(e => e.Notes).HasMaxLength(500);

                entity.HasOne(e => e.Material)
                      .WithMany(m => m.CostHistories)
                      .HasForeignKey(e => e.MaterialId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.MaterialId);
                entity.HasIndex(e => e.EffectiveDate);
            });
        }
    }
}
