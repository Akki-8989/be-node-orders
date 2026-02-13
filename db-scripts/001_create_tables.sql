-- Node Orders Service Tables
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NodeOrders')
BEGIN
    CREATE TABLE NodeOrders (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        ProductName NVARCHAR(200) NOT NULL,
        Quantity INT NOT NULL,
        TotalAmount DECIMAL(18,2) NOT NULL,
        Status NVARCHAR(50) DEFAULT 'Processing',
        OrderDate DATETIME2 DEFAULT GETDATE()
    );

    INSERT INTO NodeOrders (ProductName, Quantity, TotalAmount, Status) VALUES
    ('iPhone 15', 1, 89999.00, 'Delivered'),
    ('MacBook Pro', 1, 199999.00, 'Shipped'),
    ('iPad Air', 2, 119998.00, 'Processing');
END
GO
