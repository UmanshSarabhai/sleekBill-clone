export default function adjustQuantities(
  purchaseData,
  invoiceData,
  product_option,
) {
  function mergeArrays(x, y) {
    // Create a map to store product details by product name
    let productMap = new Map();

    // Populate the map with items from array x
    x.forEach((item) => {
      productMap.set(item.Product, {
        Product: item.Product,
        Quantity: item.Quantity,
        Description: item.Description,
        Type: item.Type,
        Price: item.Price,
      });
    });

    // Merge in items from array y, updating or adding as necessary
    y.forEach((item) => {
      if (productMap.has(item.Product)) {
        // If product from y exists in x, update the properties
        let existingItem = productMap.get(item.Product);
        existingItem.Description = item.Description || existingItem.Description;
        existingItem.Type = item.Type || existingItem.Type;
        existingItem.Price = item.Price || existingItem.Price;
      } else {
        // If product from y does not exist in x, add it
        productMap.set(item.Product, {
          Product: item.Product,
          Quantity: item.Quantity,
          Description: item.Description,
          Type: item.Type,
          Price: item.Price,
        });
      }
    });

    // Convert the map back to an array
    return Array.from(productMap.values());
  }

  const soldQuantities = {};

  // Calculate sold quantities
  invoiceData.forEach((invoice) => {
    invoice.rowData.forEach((row) => {
      const productName = row.Product;
      const soldQuantity = parseInt(row.Qty);

      if (soldQuantities[productName]) {
        soldQuantities[productName] += soldQuantity;
      } else {
        soldQuantities[productName] = soldQuantity;
      }
    });
  });

  // Initialize a map to store combined data for each product
  const combinedDataMap = new Map();

  // Combine purchase data for the same product
  purchaseData.forEach((purchase) => {
    purchase.rowsData.forEach((row) => {
      const productName = row.Product;

      // Check if the product already exists in the combined data map
      if (combinedDataMap.has(productName)) {
        // If the product exists, update its quantity and location
        const existingData = combinedDataMap.get(productName);
        existingData.Quantity += parseInt(row.Qty);
        if (
          purchase.Location &&
          !existingData.Location?.includes(purchase.Location)
        ) {
          existingData.Location += `, ${purchase.Location}`;
        }
      } else {
        // If the product doesn't exist, add it to the combined data map
        combinedDataMap.set(productName, {
          Product: row.Product,
          Description: row.Description,
          Type: row.UoM, // Assuming UoM represents the type
          Price: row.UnitPrice, // Assuming UnitPrice represents the price
          Location: purchase.Location || null,
          Quantity: parseInt(row.Qty),
        });
      }
    });
  });

  // Adjust quantities based on sold quantities
  combinedDataMap.forEach((data) => {
    const productName = data.Product;
    if (soldQuantities[productName]) {
      data.Quantity -= soldQuantities[productName];
    }
  });

  // Convert combined data map to array
  const adjustedData = Array.from(combinedDataMap.values());
  const combinedData = mergeArrays(adjustedData, product_option);
  combinedData.sort((a, b) => b.Quantity - a.Quantity);

  return combinedData;
}
