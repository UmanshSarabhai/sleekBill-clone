const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { DBManager } = require("./utils/DBManager");
const { CompanyModel } = require("./models/Company");
const { Client } = require("./models/Client");
const { Address } = require("./models/Address");
const { Product } = require("./models/Product");
const { Category } = require("./models/Category");
const { SubCategory } = require("./models/SubCategory");
const { Tax } = require("./models/Tax");
const electronReload = require("electron-reload");
const chokidar = require("chokidar");
const ExcelJS = require("exceljs");
const XLSX = require("xlsx");
const { Invoice } = require("./models/Invoice");
const { CompanyDetails } = require("./models/CompanyDetails");
const { Quotation } = require("./models/Quotation");
const { Debit_Notes } = require("./models/DebitNotes");
const { Credit_Notes } = require("./models/CreditNotes");
const { PaymentDetails } = require("./models/PaymentDetails");
const { PurchaseOrder } = require("./models/PurchaseOrder");
const { ExpenseDetails } = require("./models/ExpenseDetails");
const { VendorDetails } = require("./models/VendorDetails");
const { Employee } = require("./models/Employee");
const { EmployeePaymentDetails } = require("./models/EmployeePaymentDetails");
const { Todo } = require("./models/Todo");
const { EmployeeLeaveDetails } = require("./models/EmployeeLeaveDetails");
const { ProductQuantities } = require("./models/ProductQuantities");
const {
  EmployeeAttendanceDetails,
} = require("./models/EmployeeAttendanceDetails");

// electronReload(__dirname);

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    title: "Billing System",
  });

  const startURL = "http://localhost:3000";

  const isDevelopment = false;

  if (!DBManager.isInitialized) {
    DBManager.initialize().then((v) => {
      // mainWindow.loadURL(startURL);
      mainWindow.loadFile(path.join(__dirname, "ui/build/index.html"));
    });
  }
  if (isDevelopment) {
    electronReload(__dirname);
  } else {
    const watcher = chokidar.watch("db/test.sqlite");
    watcher.on("change", () => {
      console.log("DB file changed. Reloading...");
      mainWindow.reload();
    });
  }

  mainWindow.on("closed", () => (mainWindow = null));
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Client module re-usable functions

async function getAllClientsList(args) {
  try {
    let skip = 0;
    const { page, limit } = args;

    let paginatedClients = [];
    let totalCountQuery;
    let totalCount;

    const clientRepo = DBManager.getRepository(Client);
    const addressRepo = DBManager.getRepository(Address);

    const queryBuilder = clientRepo.createQueryBuilder("client");

    // Add conditions for each field present in searchQuery
    if (args.searchQuery) {
      const { searchQuery } = args;
      if (searchQuery.clientId) {
        queryBuilder.andWhere("client.id = :id", { id: searchQuery.clientId });
      }
      if (searchQuery.email) {
        queryBuilder.andWhere("client.email LIKE :email", {
          email: `%${searchQuery.email}%`,
        });
      }
      if (searchQuery.phone) {
        queryBuilder.andWhere("client.phone LIKE :phone", {
          phone: `%${searchQuery.phone}%`,
        });
      }
      if (searchQuery.gstin) {
        queryBuilder.andWhere("client.gstin LIKE :gstin", {
          gstin: `%${searchQuery.gstin}%`,
        });
      }
      if (searchQuery.contactName) {
        queryBuilder.andWhere("client.contact_name LIKE :contact_name", {
          contact_name: `%${searchQuery.contactName}%`,
        });
      }
      totalCountQuery = queryBuilder.getCount();
    } else {
      totalCountQuery = clientRepo.count();
    }

    totalCount = await totalCountQuery;

    // Calculate skip value for pagination
    skip = (page - 1) * limit;

    // Find clients with pagination
    paginatedClients = await queryBuilder.skip(skip).take(limit).getMany();

    for (const client of paginatedClients) {
      const fullAddress = await addressRepo.find({
        where: { id: client.billing_address },
      });
      client.billing_address = fullAddress[0].address;
      client.billing_address_id = fullAddress[0].id;
      (client.address = fullAddress[0].address),
        (client.city = fullAddress[0].city);
      client.state = fullAddress[0].state;
      client.pincode = fullAddress[0].pincode;
      client.country = fullAddress[0].country;
    }
    console.log({
      data: paginatedClients,
      page: parseInt(page),
      total: totalCount,
    });

    return {
      data: paginatedClients,
      page: parseInt(page),
      total: totalCount,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
      page: parseInt(page),
      total: 0,
    };
  }
}

async function addNewClient(args) {
  try {
    const clientrepo = DBManager.getRepository(Client);
    const addressrepo = DBManager.getRepository(Address);

    // Create billing address entity
    const billingAddress = {
      address: args.billing_address,
      city: args.city,
      state: args.state,
      pincode: args.pincode,
      country: args.country,
    };

    // Insert billing address
    const billingAddressInsertResult = await addressrepo.insert(billingAddress);
    const billingAddressId = billingAddressInsertResult.identifiers[0].id;

    // Create client entity
    const client = {
      client_name: args.client_name,
      contact_name: args.contact_name || null,
      phone: args.phone || null,
      email: args.email || null,
      gstin: args.gstin || null,
      tin: args.tin || null,
      pan: args.pan || null,
      vat: args.vat || null,
      private_client_detail: args.private_detail || null,
      other_client_detail: args.other_detail || null,
      vendor: args.vendor || false,
      sez: args.sez || false,
      billing_address: billingAddressId,
      shipping_address: null,
      created_at: new Date(),
    };

    // If shipping address exists, insert and update client entity
    if (args.shipping_address) {
      const shippingAddress = {
        name: args.shipping_client_name,
        address: args.shipping_address,
        city: args.shipping_city,
        state: args.shipping_state,
        pincode: args.shipping_pincode,
        country: args.shipping_country,
      };

      const shippingAddressInsertResult = await addressrepo.insert(
        shippingAddress
      );
      const shippingAddressId = shippingAddressInsertResult.identifiers[0].id;

      client.shipping_address = shippingAddressId;
    }

    // Insert client entity
    await clientrepo.insert(client);

    return {
      success: true,
      message: "Client added successfully!",
    };
  } catch (error) {
    console.error("Error adding new client:", error);
    return {
      success: false,
      message: error,
    };
  }
}

// Product module re-usable functions]

async function addNewProduct(args) {
  try {
    const productRepo = DBManager.getRepository(Product);

    const product = {
      p_type: args.p_type,
      uom: args.uom,
      product_name: args.product_name,
      purchase_price: args.purchase_price,
      keyword: args.keyword,
      category: args.category,
      sub_category: args.sub_category,
      opening_balance: args.opening_balance,
      opening_value: args.opening_value,
      opening_rate: args.opening_rate,
      storage_location: args.storage_location,
      sub_location: args.sub_location,
      unit_price: args.unit_price,
      tax: args.tax,
      description: args.description,
      created_at: new Date(),
    };

    const result = await productRepo
      .createQueryBuilder()
      .insert()
      .values(product)
      .execute();
    if (result) {
      return { success: true, message: "Product added successfully" };
    }
  } catch (error) {
    console.log(error);
    return { success: false, message: "Error while adding new product" };
  }
}

async function getAllProductsList(args) {
  try {
    let skip = 0;
    const { page, limit } = args;

    let paginatedProducts = [];
    let totalCountQuery;
    let totalCount;

    const productRepo = DBManager.getRepository(Product);
    const queryBuilder = productRepo.createQueryBuilder("product");

    // Add conditions for each field present in searchQuery
    if (args.searchQuery) {
      const { searchQuery } = args;
      if (searchQuery.productId) {
        queryBuilder.andWhere("product.id = :id", {
          id: searchQuery.productId,
        });
      }
      if (searchQuery.sku) {
        queryBuilder.andWhere("product.sku LIKE :sku", {
          sku: `%${searchQuery.sku}%`,
        });
      }
      if (searchQuery.minUnitPrice && searchQuery.maxUnitPrice) {
        queryBuilder.andWhere(
          "product.unit_price >= :minUnitPrice AND product.unit_price <= :maxUnitPrice",
          {
            minUnitPrice: searchQuery.minUnitPrice,
            maxUnitPrice: searchQuery.maxUnitPrice,
          }
        );
      }
      if (searchQuery.minQuantity && searchQuery.maxQuantity) {
        queryBuilder.andWhere(
          "product.quantity >= :minQuantity AND product.quantity <= :maxQuantity",
          {
            minQuantity: searchQuery.minQuantity,
            maxQuantity: searchQuery.maxQuantity,
          }
        );
      }
      if (searchQuery.startingDate && searchQuery.endingDate) {
        queryBuilder.andWhere(
          "product.created_at >= :startingDate AND product.created_at <= :endingDate",
          {
            startingDate: searchQuery.startingDate,
            endingDate: searchQuery.endingDate,
          }
        );
      }
      if (searchQuery.contactName) {
        queryBuilder.andWhere("product.contact_name LIKE :contact_name", {
          contact_name: `%${searchQuery.contactName}%`,
        });
      }
      if (searchQuery.reportType) {
        queryBuilder.andWhere("product.p_type = :p_type", {
          p_type: `%${searchQuery.reportType}%`,
        });
      }

      totalCountQuery = queryBuilder.getCount();
    } else {
      totalCountQuery = productRepo.count();
    }

    totalCount = await totalCountQuery;

    // Calculate skip value for pagination
    skip = (page - 1) * limit;

    // Find clients with pagination
    paginatedProducts = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      success: true,
      data: paginatedProducts,
      page: parseInt(page),
      total: totalCount,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
      page: parseInt(page),
      total: 0,
    };
  }
}
// Company APIs

ipcMain.handle("add-new-company", (ev, args) => {
  var companyrepo = DBManager.getRepository(CompanyModel);
  var addressrepo = DBManager.getRepository(Address);
  var company = {
    companyname: args.company_name,
    companypan: args.pan,
    tin: args.tin,
    vat: args.vat,
    service_tax_no: args.service_tax,
    cst_no: args.cst_no,
    phone: args.phone,
    email: args.email,
    website: args.website,
    additional_detail: args["add_detail"],
  };
  var address = {
    address: args.address,
    city: args.city,
    state: args.state,
    pincode: args.pincode,
    country: args.country,
  };
  return addressrepo.insert(address).then(
    (v) => {
      company["addressid"] = v.identifiers[0].id;
      return companyrepo.insert(company).then(
        (ve) => {
          return "ok";
        },
        (e) => {
          console.log(err);
          return "error";
        }
      );
    },
    (err) => {
      console.log(err);
      return "error";
    }
  );
});

ipcMain.handle("company-sign-in", (ev, args) => {
  var companyrepo = DBManager.getRepository(CompanyModel);
  return companyrepo.findOneBy({ email: args.email, password: args.password });
});

// ----------------------------------------------------------------------------------------------------------------------------------------------

// Clients APIs

ipcMain.handle("add-new-client", async (ev, args) => {
  const result = await addNewClient(args);
  return result;
});

ipcMain.handle("get-client-by-id", async (ev, args) => {
  try {
    const { clientId } = args;
    const clientrepo = DBManager.getRepository(Client);
    const addressrepo = DBManager.getRepository(Address);

    const client = await clientrepo.findOne({ where: { id: clientId } });

    if (!client) {
      // Client with the provided ID does not exist
      return { success: false, message: "Client not found" };
    }

    if (client.billing_address) {
      const fullAddress = await addressrepo.find({
        where: { id: client.billing_address },
      });
      (client_billing_address_id = fullAddress[0].id),
        (client.billing_address = fullAddress[0].address);
      client.country = fullAddress[0].country;
      client.state = fullAddress[0].state;
      client.city = fullAddress[0].city;
      client.pincode = fullAddress[0].pincode;
    }

    if (client.shiping_address) {
      const fullAddress = await addressrepo.find({
        where: { id: client.shiping_address },
      });
      (client.shipping_address_id = fullAddress[0].id),
        (client.shipping_client_name = fullAddress[0].name);
      client.shiping_address = fullAddress[0].address;
      client.shipping_country = fullAddress[0].country;
      client.shipping_state = fullAddress[0].state;
      client.shipping_city = fullAddress[0].city;
      client.shipping_pincode = fullAddress[0].pincode;
    }

    // Return client details
    return { success: true, client };
  } catch (error) {
    console.error("Error retrieving client:", error);
    return { success: false, message: "Error retrieving client" };
  }
});

ipcMain.handle("update-client", async (ev, args) => {
  try {
    const { clientId, clientFields, billingAddress, shippingAddress } = args;

    const clientRepo = DBManager.getRepository(Client);
    const addressrepo = DBManager.getRepository(Address);

    if (billingAddress) {
      const updateBillingAddressResult = await addressrepo
        .createQueryBuilder()
        .update(Address)
        .set(billingAddress)
        .where("id = :id", { id: billingAddress.id })
        .execute();
      if (!updateBillingAddressResult) {
        return {
          success: false,
          message: "An error occurred while updating address.",
        };
      }
    }

    if (shippingAddress) {
      const updateShippingAddressResult = await addressrepo
        .createQueryBuilder()
        .update(Address)
        .set(shippingAddress)
        .where("id = :id", { id: shippingAddress.id })
        .execute();
      if (!updateShippingAddressResult) {
        return {
          success: false,
          message: "An error occurred while updating address.",
        };
      }
    }

    const updateClientResult = await clientRepo
      .createQueryBuilder()
      .update(Client)
      .set(clientFields)
      .where("id = :id", { id: clientId })
      .execute();

    if (updateClientResult && updateClientResult.affected) {
      return { success: true, message: "Client updated successfully." };
    }
  } catch (error) {
    return {
      success: false,
      message: "An error occurred while updating client.",
    };
  }
});

ipcMain.handle("delete-client-by-id", async (ev, args) => {
  try {
    const { clientId } = args;
    const clientRepo = DBManager.getRepository(Client);

    const deleteResult = await clientRepo
      .createQueryBuilder()
      .delete()
      .from(Client)
      .where("id = :id", { id: clientId })
      .execute();

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Client deleted successfully." };
    }
  } catch (error) {
    console.error("Error deleting client:", error);
    return { success: false, message: "Error while deleting client" };
  }
});

// Get all  clients for drop-down
ipcMain.handle("get-all-client", async (ev, args) => {
  const clientrepo = DBManager.getRepository(Client);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-todo-data", async (ev, args) => {
  const clientrepo = DBManager.getRepository(Todo);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-all-vendors", async (ev, args) => {
  const clientrepo = DBManager.getRepository(VendorDetails);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-all-expenses", async (ev, args) => {
  const clientrepo = DBManager.getRepository(ExpenseDetails);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-all-employee", async (ev, args) => {
  const clientrepo = DBManager.getRepository(Employee);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-all-employee-payments", async (ev, args) => {
  const clientrepo = DBManager.getRepository(EmployeePaymentDetails);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-all-employee-leaves", async (ev, args) => {
  const clientrepo = DBManager.getRepository(EmployeeLeaveDetails);
  const data = await clientrepo.find();
  return {
    data,
  };
});

ipcMain.handle("get-attendance", async (ev, args) => {
  const clientrepo = DBManager.getRepository(EmployeeAttendanceDetails);
  const data = await clientrepo.find();
  return {
    data,
  };
});

// Get all clients for clients list
ipcMain.handle("get-all-clients-list", async (ev, args) => {
  const result = await getAllClientsList(args);
  return result;
});

ipcMain.handle("export-clients-to-excel", async (ev, args) => {
  try {
    // Call the API to get all clients with pagination and search query
    const response = await getAllClientsList(args);
    const clients = response.data;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Clients");

    // Define the columns
    worksheet.columns = [
      { header: "Client Name", key: "client_name", width: 20 },
      { header: "Contact Name", key: "contact_name", width: 20 },
      { header: "Billing Address", key: "billing_address", width: 20 },
      { header: "Email", key: "email", width: 20 },
      { header: "Phone", key: "phone", width: 20 },
      {
        header: "Private Client Detail",
        key: "private_client_detail",
        width: 20,
      },
    ];
    const addressrepo = DBManager.getRepository(Address);
    for (const client of clients) {
      // Retrieve full billing address
      const fullAddress = await addressrepo.find({
        where: { id: client.billing_address_id },
      });

      // Add data to worksheet
      worksheet.addRow({
        client_name: client.client_name,
        contact_name: client.contact_name,
        billing_address: fullAddress[0].address,
        email: client.email,
        phone: client.phone,
        private_client_detail: client.private_client_detail,
      });
    }
    // Generate a buffer from the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      return { success: true, buffer: buffer };
    } else {
      console.error("Error: Buffer is null.");
      return { success: false, error: "Buffer is null." };
    }
  } catch (error) {
    console.error("Error exporting clients:", error);
    return null;
  }
});

ipcMain.handle("download-client-sample-import-file", async (ev, args) => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Demo");

    // Define headers
    const headers = [
      "Client Name",
      "Contact Name",
      "Client TIN",
      "Client VAT",
      "Email",
      "Phone",
      "Billing Address",
      "Billing Zip",
      "Billing City",
      "Billing State",
      "Billing Country",
      "Shipping Name",
      "Shipping Address",
      "Shipping Zip",
      "Shipping City",
      "Shipping State",
      "Shipping Country",
      "Private Details",
      "GSTIN",
      "PAN",
      "Balance",
    ];

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      // Return the buffer if it exists
      return { success: true, buffer: buffer };
    } else {
      // Log an error if buffer is null
      console.error("Error: Buffer is null.");
      return { success: false, error: "Buffer is null." };
    }
  } catch (error) {
    // Log any errors during the process
    console.error("Error generating sample import file:", error);
    return { error: error.message }; // Return the error message
  }
});

ipcMain.handle("import-clients-from-excel", async (ev, args) => {
  try {
    const file = args.fileData;
    const filePath = file.path;
    const originalName = file.originalName;
    const array_of_allowed_files = ["xlsx"];
    const file_extension = originalName.slice(
      originalName.lastIndexOf(".") - 1 + 2
    );
    if (!array_of_allowed_files.includes(file_extension)) {
      return {
        success: false,
        message: "You can only upload excel file with extension .xlsx",
      };
    }

    const workbook = XLSX.readFile(filePath);

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const excelClientCount = data.length;
    let successClientCount = 0;

    for (const client of data) {
      const clientObj = {
        client_name: client["Client Name"],
        contact_name: client["Contact Name"],
        tin: client["Client TIN"],
        vat: client["Client VAT"],
        email: client["Email"],
        phone: client["Phone"],
        gstin: client["GSTIN"],
        pan: client["PAN"],
        billing_address: client["Billing Address"],
        pincode: client["Billing Zip"],
        city: client["Billing City"],
        state: client["Billing State"],
        country: client["Billing Country"],
        shipping_client_name: client["Shipping Name"],
        shipping_address: client["Shipping Address"],
        shipping_pincode: client["Shipping Zip"],
        shipping_city: client["Shipping City"],
        shipping_state: client["Shipping State"],
        shipping_country: client["Shipping Country"],
        privateDetails: client["Private Details"],
        balance: client["Balance"],
      };
      const response = await addNewClient(clientObj);
      if (response && response.success == true) {
        successClientCount++;
      }
    }
    if (excelClientCount == successClientCount) {
      return { success: true, message: "All clients imported successfully" };
    } else {
      return {
        success: false,
        message: `${successClientCount} clients added successfully  out of ${excelClientCount}`,
      };
    }
  } catch (error) {
    console.error("Error importing clients from Excel:", error);
    return { success: false, message: "Error importing clients from Excel" };
  }
});

// ----------------------------------------------------------------------------------------------------------------------------------------------

// Product APIs

ipcMain.handle("add-new-product", async (ev, args) => {
  try {
    const response = await addNewProduct(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add product",
    };
  }
});

ipcMain.handle("get-product-by-id", async (ev, args) => {
  try {
    const { productId } = args;

    // Retrieve the product from the database using the ID
    const productRepo = DBManager.getRepository(Product);
    const product = await productRepo.findOne({ where: { id: productId } });
    if (!product) {
      return { success: false, message: "Product not found" };
    }
    return { success: true, product };
  } catch (error) {
    console.error("Error retrieving product:", error);
    return { success: false, message: "Error retrieving product" };
  }
});

ipcMain.handle("update-product", async (ev, args) => {
  try {
    const { productId, updatedFields } = args;

    const productRepo = DBManager.getRepository(Product);
    const updateResult = await productRepo
      .createQueryBuilder()
      .update(Product)
      .set(updatedFields)
      .where("id = :id", { id: productId })
      .execute();

    if (updateResult) {
      return { success: true, message: "Product updated successfully." };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred while updating product.",
    };
  }
});

ipcMain.handle("delete-product-by-id", async (ev, args) => {
  try {
    const { productId } = args;
    const productRepo = DBManager.getRepository(Product);

    const deleteResult = await productRepo
      .createQueryBuilder()
      .delete()
      .from(Product)
      .where("id = :id", { id: productId })
      .execute();

    if (deleteResult) {
      return { success: true, message: "Product deleted successfully." };
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "An error occurred while deleting product.",
    };
  }
});

ipcMain.handle("get-all-product", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(Product);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-products-list", async (ev, args) => {
  const result = await getAllProductsList(args);
  return result;
});

ipcMain.handle("export-products-to-excel", async (ev, args) => {
  try {
    // Call the API to get all products with pagination and search query
    const response = await getAllProductsList(args);
    const products = response.data;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Products");

    // Define the columns
    worksheet.columns = [
      { header: "Product Name", key: "product_name", width: 20 },
      { header: "Unit Price", key: "unit_price", width: 20 },
      { header: "Uom", key: "uom", width: 20 },
      { header: "Description", key: "description", width: 20 },
      { header: "Type", key: "p_type", width: 20 },
      { header: "Purchase Rate", key: "purchase_price", width: 20 },
      { header: "Purchase Rate Currency", key: "currency", width: 20 },
      { header: "HSN", key: "hsn", width: 20 },
      { header: "SAC", key: "sac", width: 20 },
      { header: "SKU", key: "sku", width: 20 },
      { header: "Tax(%)", key: "tax", width: 20 },
      { header: "CESS", key: "cess", width: 20 },
    ];

    for (const product of products) {
      worksheet.addRow({
        product_name: product.product_name,
        unit_price: product.unit_price,
        uom: product.uom,
        description: product.description,
        p_type: product.p_type,
        purchase_price: product.purchase_price,
        currency: product.currency,
        hsn: product.hns,
        sac: product.sac,
        sku: product.sku,
        tax: product.tax,
        cess: product.cess,
      });
    }
    // Generate a buffer from the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      return { success: true, buffer: buffer };
    } else {
      console.error("Error: Buffer is null.");
      return { success: false, error: "Buffer is null." };
    }
  } catch (error) {
    console.error("Error exporting products:", error);
    return null;
  }
});

ipcMain.handle("download-product-sample-import-file", async (ev, args) => {
  try {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Demo");

    // Define headers
    const headers = [
      "Product Name",
      "Unit Price",
      "Uom",
      "Quantity",
      "Description",
      "Type",
      "Purchase Rate",
      "Purchase Rate Currency",
      "Alias",
      "Category",
      "Sub Category",
      "Opening Balance",
      "Opening Value",
      "Opening Rate",
      "Storage Location",
      "Sub Location",
      "HSN",
      "SAC",
      "SKU",
      "Tax(%)",
      "CESS",
    ];

    // Add headers to the worksheet
    worksheet.addRow(headers);

    // Write the workbook to a buffer
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      // Return the buffer if it exists
      return {
        success: true,
        buffer: buffer,
        message: "Sample product import file downloaded successfully.",
      };
    }
  } catch (error) {
    // Log any errors during the process
    console.error("Error generating sample product import file:", error);
    return { error: error.message }; // Return the error message
  }
});

ipcMain.handle("import-products-from-excel", async (ev, args) => {
  try {
    const file = args.fileData;
    const filePath = file.path;
    const originalName = file.originalName;
    const array_of_allowed_files = ["xlsx"];
    const file_extension = originalName.slice(
      originalName.lastIndexOf(".") - 1 + 2
    );
    if (!array_of_allowed_files.includes(file_extension)) {
      return {
        success: false,
        message: "You can only upload excel file with extension .xlsx",
      };
    }

    const workbook = XLSX.readFile(filePath);

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const excelProductCount = data.length;
    let successProductCount = 0;

    // 	additional: args.additional,
    for (const product of data) {
      const productObj = {
        product_name: product["Product Name"],
        unit_price: product["Unit Price"],
        uom: product["Uom"],
        qty: product["Quantity"],
        description: product["Description"],
        p_type: product["Type"],
        purchase_price: product["Purchase Rate"],
        currency: product["Purchase Rate Currency"],
        keyword: product["Alias"],
        category: product["Category"],
        sub_category: product["Sub Category"],
        opening_balance: product["Opening Balance"],
        opening_value: product["Opening Value"],
        opening_rate: product["Opening Rate"],
        storage_location: product["Storage Location"],
        sub_location: product["Sub Location"],
        hns: product["HSN"],
        sac: product["SAC"],
        sku: product["SKU"],
        tax: product["Tax(%)"],
        cess: product["CESS"],
      };
      console.log({ productObj });
      const response = await addNewProduct(productObj);
      if (response && response.success == true) {
        successProductCount++;
      }
    }
    if (excelProductCount == successProductCount) {
      return { success: true, message: "All products imported successfully" };
    } else {
      return {
        success: false,
        message: `${successProductCount} products added successfully  out of ${excelProductCount}`,
      };
    }
  } catch (error) {
    console.error("Error importing products from Excel:", error);
    return { success: false, message: "Error importing products from Excel" };
  }
});

// ----------------------------------------------------------------------------------------------------------------------------------------------

// Category and Sub-Category APIs

ipcMain.handle("add-new-category", async (ev, args) => {
  try {
    const categoryRepo = DBManager.getRepository(Category);
    const category = {
      name: args.name,
      is_default: args.is_default,
    };
    const result = await categoryRepo.insert(category);
    return {
      success: true,
      data: { category_id: result.raw },
      message: "Category added successfully",
    };
  } catch (error) {
    console.error("Error adding new category:", error);
    return { success: false, message: "Error adding new category" };
  }
});

ipcMain.handle("add-new-sub-category", async (ev, args) => {
  try {
    const { category_id, name } = args;
    const subCategoryRepo = DBManager.getRepository(SubCategory);

    const subCategory = {
      category_id,
      name,
    };
    const result = await subCategoryRepo
      .createQueryBuilder()
      .insert()
      .values(subCategory)
      .execute();
    if (result && result.raw && result.raw.affectedRows > 0) {
      return {
        success: true,
        data: { sub_category_id: result.raw.insertId },
        message: "Sub Category added successfully",
      };
    } else {
      return { success: false, message: "Failed to add sub-category" };
    }
  } catch (error) {
    console.error("Error adding new sub-category:", error);
    return { success: false, message: "Error adding new sub-category" };
  }
});

ipcMain.handle("get-sub-categories-by-category-id", async (ev, args) => {
  try {
    const { category_id } = args;
    const subCategoryRepo = DBManager.getRepository(SubCategory);

    const subCategories = await subCategoryRepo
      .createQueryBuilder()
      .select()
      .where("category_id = :category_id", { category_id })
      .getMany();

    if (subCategories.length) {
      return {
        success: true,
        data: subCategories,
        message: "Sub-categories fetched successfully",
      };
    }
  } catch (error) {
    console.error(`Error fetching sub-categories by category ID`, error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-categories", async () => {
  try {
    const categoryRepo = DBManager.getRepository(Category);

    const categories = await categoryRepo
      .createQueryBuilder("category")
      .getMany();

    if (categories.length) {
      return {
        success: true,
        data: categories,
        message: "Categories fetched successfully",
      };
    } else {
      return {
        success: true,
        data: [],
        message: "Categories fetched successfully",
      };
    }
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-category-by-id", async (ev, args) => {
  try {
    const { id } = args;
    const categoryRepo = DBManager.getRepository(Category);

    // Find category by ID
    const category = await categoryRepo.findOne({ where: { id } });

    // Check if category exists
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Return the found category
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return {
      success: false,
      message: "Error occurred while fetching category by id",
    };
  }
});

ipcMain.handle("delete-category-by-id", async (ev, args) => {
  try {
    const { category_id } = args;

    const categoryRepo = DBManager.getRepository(Category);
    const subCategoryRepo = DBManager.getRepository(SubCategory);

    // Find the category by ID
    const category = await categoryRepo.findOne({ where: { id: category_id } });

    // Check if category exists
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Delete all the sub categories associated with category
    await subCategoryRepo
      .createQueryBuilder()
      .delete()
      .where("category_id = :category_id", { category_id })
      .execute();

    // Delete the category
    await categoryRepo
      .createQueryBuilder()
      .delete()
      .from(Category)
      .where("id = :id", { id: category_id })
      .execute();

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Error deleting category" };
  }
});

ipcMain.handle("delete-sub-category-by-id", async (ev, args) => {
  try {
    const { id } = args;
    const subCategoryRepo = DBManager.getRepository(SubCategory);

    // Find the category by ID
    const category = await subCategoryRepo.findOne({ where: { id } });

    // Check if category exists
    if (!category) {
      return { success: false, message: "Category not found" };
    }

    // Delete the category
    await subCategoryRepo
      .createQueryBuilder()
      .delete()
      .from(SubCategory)
      .where("id = :id", { id })
      .execute();

    return { success: true, message: "Sub Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Error deleting category" };
  }
});

// ----------------------------------------------------------------------------------------------------------------------------------------------

// Tax APIs

ipcMain.handle("add-new-tax", async (ev, args) => {
  try {
    const { name, tax_rate, is_default } = args;
    const taxRepo = DBManager.getRepository(Tax);

    const tax = {
      name,
      tax_rate,
      is_default,
    };
    const result = await taxRepo
      .createQueryBuilder()
      .insert()
      .values(tax)
      .execute();

    return {
      success: true,
      data: { tax_id: result.raw },
      message: "New tax added successfully!",
    };
  } catch (error) {
    console.error("Error adding new tax:", error);
    return { success: false, message: "Error adding new tax" };
  }
});

ipcMain.handle("get-all-taxes", async () => {
  try {
    const taxRepo = DBManager.getRepository(Tax);

    const taxes = await taxRepo.find();

    return {
      success: true,
      data: taxes,
      message: "Taxes fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching all taxes:", error);
    return {
      success: false,
      data: [],
      message: "Error fetching all taxes",
    };
  }
});

ipcMain.handle("update-tax", async (ev, args) => {
  try {
    const { id, name, tax_rate, is_default } = args;
    const taxRepo = DBManager.getRepository(Tax);

    // Check if the updated name already exists in the table
    const existingTax = await taxRepo.findOne({ where: { id } });
    if (existingTax && existingTax.id !== id) {
      return {
        success: false,
        message: "Tax with this tax rate already exists",
      };
    }

    const result = await taxRepo
      .createQueryBuilder()
      .update()
      .set({ name, tax_rate, is_default })
      .where("id = :id", { id })
      .execute();

    return { success: true, message: "Tax updated successfully" };
  } catch (error) {
    console.error("Error updating tax:", error);
    return { success: false, message: "Error updating tax" };
  }
});

ipcMain.handle("delete-tax-by-id", async (ev, args) => {
  try {
    const { id } = args;
    const taxRepo = DBManager.getRepository(Tax);

    // Check if tax exists
    const existingTax = await taxRepo.findOne({ where: { id } });
    if (!existingTax) {
      return { success: false, message: "Tax not found" };
    }

    // Delete tax
    await taxRepo
      .createQueryBuilder()
      .delete()
      .from(Tax)
      .where("id = :id", { id })
      .execute();

    return { success: true, message: "Tax deleted successfully" };
  } catch (error) {
    console.error("Error deleting tax:", error);
    return { success: false, message: "Error deleting tax" };
  }
});

ipcMain.handle("get-tax-by-id", async (ev, args) => {
  try {
    const { id } = args;
    const taxRepo = DBManager.getRepository(Tax);

    // Find tax by ID
    const tax = await taxRepo.findOne({ where: { id } });

    // Check if tax exists
    if (!tax) {
      return { success: false, message: "Tax not found" };
    }

    // Return the found tax
    return {
      success: true,
      data: tax,
    };
  } catch (error) {
    console.error("Error fetching tax by ID:", error);
    return { success: false, message: `Error fetching tax by ID: ${args.id}` };
  }
});

// -----------------------------------------------------------------------------------------------------------------------------------------------

ipcMain.handle("add-new-invoice", async (ev, args) => {
  try {
    const response = await addNewInvoice(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add invoice",
    };
  }
});

ipcMain.handle("get-invoice-count", async () => {
  try {
    const response = await getCountOfInvoices();
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to fetch invoice count",
    };
  }
});

ipcMain.handle("add-new-purchase-order", async (ev, args) => {
  try {
    const response = await addNewPurchaseOrder(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add purchase order",
    };
  }
});

ipcMain.handle("add-new-debit-note", async (ev, args) => {
  try {
    const response = await addNewDebitNote(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add debit note",
    };
  }
});

ipcMain.handle("add-new-vendor", async (ev, args) => {
  try {
    const response = await addNewVendor(args);
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add vendor",
    };
  }
});

ipcMain.handle("save-todo", async (ev, args) => {
  try {
    const response = await addOrUpdateTodo(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add todo",
    };
  }
});

ipcMain.handle("add-new-expense", async (ev, args) => {
  try {
    const response = await addNewExpense(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add expense",
    };
  }
});

ipcMain.handle("add-new-employee", async (ev, args) => {
  try {
    const response = await addNewEmployee(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add expense",
    };
  }
});

ipcMain.handle("add-new-employee-payment", async (ev, args) => {
  try {
    const response = await addNewEmployeePayment(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add employee payment",
    };
  }
});

ipcMain.handle("add-employee-leave", async (ev, args) => {
  try {
    const response = await addNewEmployeeLeave(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add employee payment",
    };
  }
});

ipcMain.handle("add-employee-attendance", async (ev, args) => {
  try {
    const response = await addEmployeeAttendance(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add employee payment",
    };
  }
});

ipcMain.handle("add-new-credit-note", async (ev, args) => {
  try {
    const response = await addNewCreditNote(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add credit note",
    };
  }
});

ipcMain.handle("add-new-payment-data", async (ev, args) => {
  try {
    const response = await addNewPaymentData(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add credit note",
    };
  }
});

ipcMain.handle("add-new-quotation", async (ev, args) => {
  try {
    const response = await addNewQuotation(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add quotation",
    };
  }
});

ipcMain.handle("get-all-invoice", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(Invoice);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-purchase-orders", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(PurchaseOrder);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-payment-receipts", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(PaymentDetails);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-debit-notes", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(Debit_Notes);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-credit-notes", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(Credit_Notes);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("get-all-quotation", async (ev, args) => {
  try {
    const productRepo = DBManager.getRepository(Quotation);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

async function addNewInvoice(invoiceData) {
  try {
    const productRepo = DBManager.getRepository(Invoice);

    const invoiceDataObj = {
      rowData: invoiceData.rowData,
      Client: invoiceData.Client,
      Document_No: invoiceData.Document_No,
      Issue_Date: invoiceData.Issue_Date,
      Ship_To: invoiceData.Ship_To,
      PO_Number: invoiceData.PO_Number,
      Payment_Term: invoiceData.Payment_Term,
      PO_Date: invoiceData.PO_Date,
      Due_Date: invoiceData.Due_Date,
      Place_Of_Supply: invoiceData.Place_Of_Supply,
      Notes: invoiceData.Notes,
      Private_Notes: invoiceData.Private_Notes,
      Shipping_Charges: invoiceData.Shipping_Charges,
      Discount_on_all: invoiceData.Discount_on_all,
      Total_BeforeTax: invoiceData.Total_BeforeTax,
      Total_Tax: invoiceData.Total_Tax,
    };
    // Save the new invoice entity to the database
    const result = await productRepo
      .createQueryBuilder()
      .insert()
      .values(invoiceDataObj)
      .execute();
    if (result) {
      return { success: true, message: "New invoice added successfully!" };
    }
  } catch (error) {
    console.error("Error adding new invoice:", error);
  }
}

async function addNewPurchaseOrder(invoiceData) {
  try {
    const productRepo = DBManager.getRepository(PurchaseOrder);
    const invoiceDataObj = {
      rowsData: invoiceData.rowData,
      Vendor: invoiceData.Vendor,
      Document_No: invoiceData.Document_No,
      Issue_Date: invoiceData.Issue_Date,
      Project: invoiceData.Project,
      Payment_Term: invoiceData.Payment_Term,
      Due_Date: invoiceData.Due_Date,
      Place_Of_Supply: invoiceData.Place_Of_Supply,
      Notes: invoiceData.Notes,
      Private_Notes: invoiceData.Private_Notes,
      Shipping_Charges: invoiceData.Shipping_Charges,
      Discount_on_all: invoiceData.Discount_on_all,
      Total_BeforeTax: invoiceData.Total_BeforeTax,
      Total_Tax: invoiceData.Total_Tax,
    };
    // Save the new invoice entity to the database
    const result = await productRepo
      .createQueryBuilder()
      .insert()
      .values(invoiceDataObj)
      .execute();
    if (result) {
      return {
        success: true,
        message: "New Purchase Order added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new purchase order:", error);
  }
}

async function getCountOfInvoices() {
  try {
    const invoiceRepository = DBManager.getRepository(Invoice);
    const count = await invoiceRepository.count();
    return count;
  } catch (error) {
    console.error("Error getting count of invoices:", error);
    return null;
  }
}

async function addOrUpdateTodo(todoData) {
  try {
    const todoRepo = DBManager.getRepository(Todo);
    // Check if a todo already exists
    let existingTodo = await todoRepo.find();

    // If a todo exists, update it; otherwise, create a new todo
    if (existingTodo.length > 0) {
      // Assuming you only want to update the first found todo
      existingTodo[0].todo = todoData;
      await todoRepo.save(existingTodo[0]);
      return { success: true, message: "Todo updated successfully!" };
    } else {
      const newTodo = todoRepo.create({ todo: todoData });
      await todoRepo.save(newTodo);
      return { success: true, message: "Todo added successfully!" };
    }
  } catch (error) {
    console.error("Error adding or updating todo:", error);
    return { success: false, message: "Error adding or updating todo" };
  }
}

async function addNewVendor(vendorData) {
  try {
    // Validate vendorData here if necessary

    const vendorRepo = DBManager.getRepository(VendorDetails);

    // Map vendorData to match the schema of VendorDetails entity
    const vendorDetailsObj = {
      Vendor: vendorData.Vendor,
      Vendor_email: vendorData.Vendor_email,
      Contact_number: vendorData.Contact_number,
      Address: vendorData.Address,
      City: vendorData.City,
      State: vendorData.State,
      GSTIN: vendorData.GSTIN,
    };

    // Save the new vendor details entity to the database
    const result = await vendorRepo
      .createQueryBuilder()
      .insert()
      .values(vendorDetailsObj)
      .execute();

    if (result) {
      return {
        success: true,
        message: "New vendor details added successfully!",
      };
    } else {
      return { success: false, message: "Failed to add new vendor details." };
    }
  } catch (error) {
    console.error("Error adding new vendor details:", error);
    // Throw the error so that calling code can handle it
    throw error;
  }
}

async function addNewExpense(expenseData) {
  try {
    const expenseRepo = DBManager.getRepository(ExpenseDetails);
    const expenseDetailsObj = {
      Person_name: expenseData.Person_name,
      Expense_type: expenseData.Expense_type,
      Amount: expenseData.Amount,
      Date: expenseData.Date,
      Notes: expenseData.Notes,
    };

    // Save the new expense details entity to the database
    const result = await expenseRepo
      .createQueryBuilder()
      .insert()
      .values(expenseDetailsObj)
      .execute();
    if (result) {
      return {
        success: true,
        message: "New expense details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new expense details:", error);
    // Throw the error so that calling code can handle it
    throw error;
  }
}

async function addNewEmployee(employeeData) {
  try {
    const employeeRepo = DBManager.getRepository(Employee);
    const employeeDetailsObj = {
      Employee_name: employeeData.Employee_name,
      Age: employeeData.Age,
      Contact_No: employeeData.Contact_No,
      Address: employeeData.Address,
      Joining_Date: employeeData.Joining_Date,
      Notes: employeeData.Notes,
      Employee_email: employeeData.Employee_email,
      Employee_title: employeeData.Employee_title,
      Salary: employeeData.Salary,
    };

    // Save the new employee details entity to the database
    const result = await employeeRepo
      .createQueryBuilder()
      .insert()
      .values(employeeDetailsObj)
      .execute();
    if (result) {
      return {
        success: true,
        message: "New employee details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new employee details:", error);
    // Throw the error so that calling code can handle it
    throw error;
  }
}

async function addNewEmployeePayment(paymentData) {
  function isLastDayOfMonth(dateString) {
    // Convert the input string to a Date object
    const date = new Date(dateString);

    // Get the next day's date
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    // Compare the months of the input date and the next day's date
    // If the months are different, then the input date is the last day of the month
    return date.getMonth() !== nextDay.getMonth();
  }
  try {
    const paymentRepo = DBManager.getRepository(EmployeePaymentDetails);
    const paymentDetailsObj = {
      Employee_name: paymentData.Employee_name,
      Payment_date: paymentData.Payment_date,
      Amount: paymentData.Amount,
      Payment_type: paymentData.Payment_type,
      Payment_notes: paymentData.Payment_notes,
      Is_Payment_Salary: isLastDayOfMonth(paymentData.Payment_date)
        ? true
        : false,
    };

    // Save the new payment details entity to the database
    const result = await paymentRepo
      .createQueryBuilder()
      .insert()
      .values(paymentDetailsObj)
      .execute();

    if (result) {
      return {
        success: true,
        message: "New payment details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new payment details:", error);
    // Throw the error so that calling code can handle it
    throw error;
  }
}

// Function to add new employee leave details
async function addNewEmployeeLeave(leaveData) {
  try {
    // Get the repository for employee leave details
    const leaveRepo = DBManager.getRepository(EmployeeLeaveDetails);

    // Create the leave details object
    const leaveDetailsObj = {
      employeeName: leaveData.employeeName,
      leaveDate: leaveData.leaveDate,
      leaveReason: leaveData.leaveReason,
    };

    // Save the new leave details entity to the database
    const result = await leaveRepo
      .createQueryBuilder()
      .insert()
      .values(leaveDetailsObj)
      .execute();

    if (result) {
      return {
        success: true,
        message: "New leave details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new leave details:", error);
    // Throw the error so that calling code can handle it
    throw error;
  }
}

// Function to add new employee attendance details
async function addEmployeeAttendance(attendanceData) {
  try {
    // Get the repository for employee attendance details
    const attendanceRepo = DBManager.getRepository(EmployeeAttendanceDetails);

    // Create the attendance details object
    const attendanceDetailsObj = {
      employeeName: attendanceData.employeeName,
      todayDate: attendanceData.todayDate,
      inTime: attendanceData.inTime,
      outTime: attendanceData.outTime,
    };

    // Save the new attendance details entity to the database
    const result = await attendanceRepo
      .createQueryBuilder()
      .insert()
      .values(attendanceDetailsObj)
      .execute();

    if (result) {
      return {
        success: true,
        message: "New attendance details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new attendance details:", error);
    // Throw the error so that calling code can handle it
    throw error;
  }
}

async function addNewDebitNote(invoiceData) {
  try {
    const productRepo = DBManager.getRepository(Debit_Notes);

    const invoiceDataObj = {
      rowData: invoiceData.rowData,
      Client: invoiceData.Client,
      Document_No: invoiceData.Document_No,
      Reason: invoiceData.Reason,
      Invoice_No: invoiceData.Invoice_No,
      Issue_Date: invoiceData.Issue_Date,
      Ship_To: invoiceData.Ship_To,
      PO_Number: invoiceData.PO_Number,
      Payment_Term: invoiceData.Payment_Term,
      PO_Date: invoiceData.PO_Date,
      Due_Date: invoiceData.Due_Date,
      Place_Of_Supply: invoiceData.Place_Of_Supply,
      Notes: invoiceData.Notes,
      Private_Notes: invoiceData.Private_Notes,
      Shipping_Charges: invoiceData.Shipping_Charges,
      Discount_on_all: invoiceData.Discount_on_all,
      Total_BeforeTax: invoiceData.Total_BeforeTax,
      Total_Tax: invoiceData.Total_Tax,
    };
    // Save the new invoice entity to the database
    const result = await productRepo
      .createQueryBuilder()
      .insert()
      .values(invoiceDataObj)
      .execute();
    if (result) {
      return { success: true, message: "New Debit Note added successfully!" };
    }
  } catch (error) {
    console.error("Error adding new Debit Note:", error);
  }
}

async function addNewCreditNote(invoiceData) {
  try {
    const productRepo = DBManager.getRepository(Credit_Notes);

    const invoiceDataObj = {
      rowData: invoiceData.rowData,
      Client: invoiceData.Client,
      Document_No: invoiceData.Document_No,
      Reason: invoiceData.Reason,
      Invoice_No: invoiceData.Invoice_No,
      Issue_Date: invoiceData.Issue_Date,
      Ship_To: invoiceData.Ship_To,
      PO_Number: invoiceData.PO_Number,
      Payment_Term: invoiceData.Payment_Term,
      PO_Date: invoiceData.PO_Date,
      Due_Date: invoiceData.Due_Date,
      Place_Of_Supply: invoiceData.Place_Of_Supply,
      Notes: invoiceData.Notes,
      Private_Notes: invoiceData.Private_Notes,
      Shipping_Charges: invoiceData.Shipping_Charges,
      Discount_on_all: invoiceData.Discount_on_all,
      Total_BeforeTax: invoiceData.Total_BeforeTax,
      Total_Tax: invoiceData.Total_Tax,
    };

    // Save the new invoice entity to the database
    const result = await productRepo
      .createQueryBuilder()
      .insert()
      .values(invoiceDataObj)
      .execute();
    if (result) {
      return { success: true, message: "New Credit Note added successfully!" };
    }
  } catch (error) {
    console.error("Error adding new Credit Note:", error);
  }
}

async function addNewPaymentData(paymentData) {
  try {
    const paymentRepo = DBManager.getRepository(PaymentDetails);

    const paymentDataObj = {
      rowData: paymentData.rowData,
      Client: paymentData.Client,
      Document_Date: paymentData.Document_Date,
      Document_No: paymentData.Document_No,
      Pay_Date: paymentData.Pay_Date,
      Bank_Charges: paymentData.Bank_Charges,
      Payment_Type: paymentData.Payment_Type,
      Payment_Mode: paymentData.Payment_Mode,
      Amount_Received: paymentData.Amount_Received,
    };

    // Save the new payment details entity to the database
    const result = await paymentRepo
      .createQueryBuilder()
      .insert()
      .values(paymentDataObj)
      .execute();

    if (result) {
      return {
        success: true,
        message: "New payment details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding new payment details:", error);
    return { success: false, message: "Failed to add new payment details" };
  }
}

async function addNewQuotation(invoiceData) {
  try {
    const productRepo = DBManager.getRepository(Quotation);

    const invoiceDataObj = {
      rowData: invoiceData.rowData,
      Client: invoiceData.Client,
      Quotation_No: invoiceData.Quotation_No,
      Issue_Date: invoiceData.Issue_Date,
      Ship_To: invoiceData.Ship_To,
      PO_Number: invoiceData.PO_Number,
      Payment_Term: invoiceData.Payment_Term,
      PO_Date: invoiceData.PO_Date,
      Due_Date: invoiceData.Due_Date,
      Place_Of_Supply: invoiceData.Place_Of_Supply,
      Notes: invoiceData.Notes,
      Private_Notes: invoiceData.Private_Notes,
      Shipping_Charges: invoiceData.Shipping_Charges,
      Discount_on_all: invoiceData.Discount_on_all,
      Total_BeforeTax: invoiceData.Total_BeforeTax,
      Total_Tax: invoiceData.Total_Tax,
    };
    // Save the new invoice entity to the database
    const result = await productRepo
      .createQueryBuilder()
      .insert()
      .values(invoiceDataObj)
      .execute();
    if (result) {
      return { success: true, message: "New quotation added successfully!" };
    }
  } catch (error) {
    console.error("Error adding new quotation:", error);
  }
}

ipcMain.handle("delete-invoice-by-Document-no", async (ev, args) => {
  try {
    const documentNo = args;
    const invoiceRepo = DBManager.getRepository(Invoice);
    console.log(`${ev}-${args}`);
    console.log(`Deleting invoice with Document_No: ${documentNo}`);

    const deleteResult = await invoiceRepo
      .createQueryBuilder()
      .delete()
      .from(Invoice)
      .where("Document_No = :documentNo", { documentNo })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Invoice deleted successfully." };
    } else {
      return {
        success: false,
        message: "Invoice with provided Document_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting Invoice:", error);
    return { success: false, message: "Error while deleting invoice" };
  }
});

ipcMain.handle("delete-purchase-by-Document-no", async (ev, args) => {
  try {
    const documentNo = args;
    const invoiceRepo = DBManager.getRepository(PurchaseOrder);
    console.log(`${ev}-${args}`);
    console.log(`Deleting purchase order with Document_No: ${documentNo}`);

    const deleteResult = await invoiceRepo
      .createQueryBuilder()
      .delete()
      .from(PurchaseOrder)
      .where("Document_No = :documentNo", { documentNo })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "purchase order deleted successfully." };
    } else {
      return {
        success: false,
        message: "purchase order with provided Document_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    return { success: false, message: "Error while deleting purchase order" };
  }
});

ipcMain.handle("delete-payment-by-Document-no", async (ev, args) => {
  try {
    const documentNo = args;
    const invoiceRepo = DBManager.getRepository(PaymentDetails);
    console.log(`${ev}-${args}`);
    console.log(`Deleting payment document with Document_No: ${documentNo}`);

    const deleteResult = await invoiceRepo
      .createQueryBuilder()
      .delete()
      .from(PaymentDetails)
      .where("Document_No = :documentNo", { documentNo })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return {
        success: true,
        message: "Payment Details deleted successfully.",
      };
    } else {
      return {
        success: false,
        message: "Payment Details with provided Document_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting Payment Details:", error);
    return { success: false, message: "Error while deleting Payment Details" };
  }
});

ipcMain.handle("delete-debit-note-by-Document-no", async (ev, args) => {
  try {
    const documentNo = args;
    const invoiceRepo = DBManager.getRepository(Debit_Notes);
    console.log(`${ev}-${args}`);
    console.log(`Deleting debit-note with Document_No: ${documentNo}`);

    const deleteResult = await invoiceRepo
      .createQueryBuilder()
      .delete()
      .from(Debit_Notes)
      .where("Document_No = :documentNo", { documentNo })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Debit Note deleted successfully." };
    } else {
      return {
        success: false,
        message: "Debit Note  with provided Document_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting Debit Note :", error);
    return { success: false, message: "Error while deleting Debit Note " };
  }
});

ipcMain.handle("delete-credit-note-by-Document-no", async (ev, args) => {
  try {
    const documentNo = args;
    const invoiceRepo = DBManager.getRepository(Credit_Notes);
    console.log(`${ev}-${args}`);
    console.log(`Deleting credit-note with Document_No: ${documentNo}`);

    const deleteResult = await invoiceRepo
      .createQueryBuilder()
      .delete()
      .from(Debit_Notes)
      .where("Document_No = :documentNo", { documentNo })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Credit Note deleted successfully." };
    } else {
      return {
        success: false,
        message: "credit Note  with provided Document_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting credit Note :", error);
    return { success: false, message: "Error while deleting credit Note " };
  }
});

ipcMain.handle("delete-employee-by-contact-no", async (ev, args) => {
  try {
    const contactNo = args;
    const employeeRepo = DBManager.getRepository(Employee);
    console.log(`Deleting employee with Contact_No: ${contactNo}`);

    const deleteResult = await employeeRepo
      .createQueryBuilder()
      .delete()
      .where("Contact_No = :contactNo", { contactNo })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Employee deleted successfully." };
    } else {
      return {
        success: false,
        message: "Employee with provided Contact_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, message: "Error while deleting employee." };
  }
});

ipcMain.handle("delete-vendor-by-contact-number", async (ev, args) => {
  try {
    const contactNumber = args;
    const vendorRepo = DBManager.getRepository(VendorDetails);
    console.log(`Deleting vendor with Contact_number: ${contactNumber}`);

    const deleteResult = await vendorRepo
      .createQueryBuilder()
      .delete()
      .where("Contact_number = :contactNumber", { contactNumber })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Vendor deleted successfully." };
    } else {
      return {
        success: false,
        message: "Vendor with provided Contact_number not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting vendor:", error);
    return { success: false, message: "Error while deleting vendor." };
  }
});

ipcMain.handle("delete-expense-by-id", async (ev, args) => {
  try {
    const expenseId = args;
    const expenseRepo = DBManager.getRepository(ExpenseDetails);
    console.log(`Deleting expense with id: ${expenseId}`);

    const deleteResult = await expenseRepo
      .createQueryBuilder()
      .delete()
      .where("id = :expenseId", { expenseId })
      .execute();

    console.log("Delete result:", deleteResult);

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Expense deleted successfully." };
    } else {
      return {
        success: false,
        message: "Expense with provided id not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, message: "Error while deleting expense." };
  }
});

ipcMain.handle("delete-quotation-by-quotation-no", async (ev, args) => {
  try {
    const documentNo = args;
    const invoiceRepo = DBManager.getRepository(Quotation);
    console.log(`${ev}-${args}`);
    console.log(`Deleting Quotation with Quotation_No: ${documentNo}`);

    const deleteResult = await invoiceRepo
      .createQueryBuilder()
      .delete()
      .from(Quotation)
      .where("Quotation_No = :documentNo", { documentNo })
      .execute();

    if (deleteResult && deleteResult.affected) {
      return { success: true, message: "Quotation deleted successfully." };
    } else {
      return {
        success: false,
        message: "Quotation with provided Quotation_No not found.",
      };
    }
  } catch (error) {
    console.error("Error deleting Quotation:", error);
    return { success: false, message: "Error while deleting Quotation" };
  }
});

ipcMain.handle("update-invoice", async (ev, args) => {
  try {
    const response = await updateInvoice(args);
    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update invoice",
    };
  }
});

ipcMain.handle("update-debit-note", async (ev, args) => {
  try {
    console.log(JSON.stringify(args));
    const response = await updateDebitNote(args);
    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update invoice",
    };
  }
});

ipcMain.handle("update-credit-note", async (ev, args) => {
  try {
    console.log(JSON.stringify(args));
    const response = await updateCreditNote(args);
    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to update invoice",
    };
  }
});

async function updateInvoice(invoiceData) {
  try {
    const { Document_No, Amount_Paid, Date_of_payment, Transaction_type } =
      invoiceData;

    // Ensure Document_No is provided
    if (!Document_No) {
      return {
        success: false,
        message: "Document_No is required to update the invoice",
      };
    }

    // Set Date_of_payment to today's date if not provided
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const updatedDateOfPayment = Date_of_payment || today;

    // Update the invoice entity in the database
    const invoiceRepo = DBManager.getRepository(Invoice);
    const updateInvoiceResult = await invoiceRepo
      .createQueryBuilder()
      .update(Invoice)
      .set({
        Amount_Paid,
        Date_of_payment: updatedDateOfPayment,
        Transaction_type,
      })
      .where("Document_No = :Document_No", { Document_No })
      .execute();

    // Check if the update was successful
    if (updateInvoiceResult.affected === 1) {
      return { success: true, message: "Invoice updated successfully" };
    } else {
      return { success: false, message: "Invoice not found or not updated" };
    }
  } catch (error) {
    console.error("Error updating invoice:", error);
    return {
      success: false,
      message: "Failed to update invoice",
    };
  }
}

async function updateDebitNote(invoiceData) {
  try {
    const { Document_No, Amount_Paid, Date_of_payment, Transaction_type } =
      invoiceData;

    // Ensure Document_No is provided
    if (!Document_No) {
      return {
        success: false,
        message: "Document_No is required to update the invoice",
      };
    }

    // Set Date_of_payment to today's date if not provided
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const updatedDateOfPayment = Date_of_payment || today;

    // Update the invoice entity in the database
    const invoiceRepo = DBManager.getRepository(Debit_Notes);
    const updateInvoiceResult = await invoiceRepo
      .createQueryBuilder()
      .update(Debit_Notes)
      .set({
        Amount_Paid,
        Date_of_payment: updatedDateOfPayment,
        Transaction_type,
      })
      .where("Document_No = :Document_No", { Document_No })
      .execute();

    // Check if the update was successful
    if (updateInvoiceResult.affected === 1) {
      return { success: true, message: "Invoice updated successfully" };
    } else {
      return { success: false, message: "Invoice not found or not updated" };
    }
  } catch (error) {
    console.error("Error updating invoice:", error);
    return {
      success: false,
      message: "Failed to update invoice",
    };
  }
}
async function updateCreditNote(invoiceData) {
  try {
    const { Document_No, Amount_Paid, Date_of_payment, Transaction_type } =
      invoiceData;

    // Ensure Document_No is provided
    if (!Document_No) {
      return {
        success: false,
        message: "Document_No is required to update the credit note",
      };
    }

    // Set Date_of_payment to today's date if not provided
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    const updatedDateOfPayment = Date_of_payment || today;

    // Update the invoice entity in the database
    const invoiceRepo = DBManager.getRepository(Credit_Notes);
    const updateInvoiceResult = await invoiceRepo
      .createQueryBuilder()
      .update(Credit_Notes)
      .set({
        Amount_Paid,
        Date_of_payment: updatedDateOfPayment,
        Transaction_type,
      })
      .where("Document_No = :Document_No", { Document_No })
      .execute();

    // Check if the update was successful
    if (updateInvoiceResult.affected === 1) {
      return { success: true, message: "Credit Note updated successfully" };
    } else {
      return {
        success: false,
        message: "Credit Note not found or not updated",
      };
    }
  } catch (error) {
    console.error("Error updating Credit Note:", error);
    return {
      success: false,
      message: "Failed to update Credit Note",
    };
  }
}

ipcMain.handle("export-invoices-to-excel", async (ev, args) => {
  try {
    // Call the API to get all products with pagination and search query
    const invoices = args;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Invoices");

    // Define the columns
    worksheet.columns = [
      { header: "Client Name", key: "client_name", width: 20 },
      { header: "Invoice No", key: "invoice_no", width: 20 },
      { header: "Issue Date", key: "issue_date", width: 20 },
      { header: "Due Date", key: "due_date", width: 20 },
      { header: "Amount", key: "amount", width: 20 },
      { header: "Tax", key: "tax", width: 20 },
      { header: "Shipping Cost", key: "shipping_cost", width: 20 },
      { header: "Total", key: "total", width: 20 },
      { header: "Amount Paid", key: "amount_paid", width: 20 },
      { header: "Balance", key: "balance", width: 20 },
      { header: "Date of Payment", key: "date_of_payment", width: 20 },
      { header: "Type", key: "type", width: 20 },
      { header: "Private Notes", key: "private_notes", width: 20 },
    ];

    for (const invoice of invoices) {
      worksheet.addRow({
        client_name: invoice["Client Name"],
        invoice_no: invoice["Invoice No"],
        issue_date: invoice["Issue Date"],
        due_date: invoice["Due Date"],
        amount: invoice["Amount"],
        tax: invoice["Tax"],
        shipping_cost: invoice["Shipping Cost"],
        total: invoice["Total"],
        amount_paid: invoice["Amount Paid"],
        balance: invoice["Balance"],
        date_of_payment: invoice["Date of payment"],
        type: invoice["Type"],
        private_notes: invoice["Private Notes"],
      });
    }
    // Generate a buffer from the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      return { success: true, buffer: buffer };
    } else {
      console.error("Error: Buffer is null.");
      return { success: false, error: "Buffer is null." };
    }
  } catch (error) {
    console.error("Error exporting products:", error);
    return null;
  }
});

ipcMain.handle("export-credit-to-excel", async (ev, args) => {
  console.log("ev", ev);
  console.log("args", args);
  // try {
  //   // Call the API to get all products with pagination and search query
  //   const invoices = args;

  //   // Create a new workbook
  //   const workbook = new ExcelJS.Workbook();

  //   // Add a worksheet
  //   const worksheet = workbook.addWorksheet("Quotation");

  //   // Define the columns
  //   worksheet.columns = [
  //     { header: "Client Name", key: "client_name", width: 20 },
  //     { header: "Quotation No", key: "invoice_no", width: 20 },
  //     { header: "Issue Date", key: "issue_date", width: 20 },
  //     { header: "Valid Until", key: "due_date", width: 20 },
  //     { header: "Amount", key: "amount", width: 20 },
  //     { header: "Tax", key: "tax", width: 20 },
  //     { header: "Shipping Cost", key: "shipping_cost", width: 20 },
  //     { header: "Total", key: "total", width: 20 },
  //     { header: "Type", key: "type", width: 20 },
  //     { header: "Private Notes", key: "private_notes", width: 20 },
  //   ];

  //   for (const invoice of invoices) {
  //     worksheet.addRow({
  //       client_name: invoice["Client Name"],
  //       invoice_no: invoice["Invoice No"],
  //       issue_date: invoice["Issue Date"],
  //       due_date: invoice["Valid Until"],
  //       amount: invoice["Amount"],
  //       tax: invoice["Tax"],
  //       shipping_cost: invoice["Shipping Cost"],
  //       total: invoice["Total"],
  //       type: invoice["Type"],
  //       private_notes: invoice["Private Notes"],
  //     });
  //   }
  //   // Generate a buffer from the workbook
  //   const buffer = await workbook.xlsx.writeBuffer();

  //   if (buffer) {
  //     return { success: true, buffer: buffer };
  //   } else {
  //     console.error("Error: Buffer is null.");
  //     return { success: false, error: "Buffer is null." };
  //   }
  // } catch (error) {
  //   console.error("Error exporting products:", error);
  //   return null;
  // }
});

ipcMain.handle("export-quotation-to-excel", async (ev, args) => {
  console.log("ev", ev);
  console.log("args", args);
  try {
    // Call the API to get all products with pagination and search query
    const invoices = args;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Quotation");

    // Define the columns
    worksheet.columns = [
      { header: "Client Name", key: "client_name", width: 20 },
      { header: "Quotation No", key: "invoice_no", width: 20 },
      { header: "Issue Date", key: "issue_date", width: 20 },
      { header: "Valid Until", key: "due_date", width: 20 },
      { header: "Amount", key: "amount", width: 20 },
      { header: "Tax", key: "tax", width: 20 },
      { header: "Shipping Cost", key: "shipping_cost", width: 20 },
      { header: "Total", key: "total", width: 20 },
      { header: "Type", key: "type", width: 20 },
      { header: "Private Notes", key: "private_notes", width: 20 },
    ];

    for (const invoice of invoices) {
      worksheet.addRow({
        client_name: invoice["Client Name"],
        invoice_no: invoice["Invoice No"],
        issue_date: invoice["Issue Date"],
        due_date: invoice["Valid Until"],
        amount: invoice["Amount"],
        tax: invoice["Tax"],
        shipping_cost: invoice["Shipping Cost"],
        total: invoice["Total"],
        type: invoice["Type"],
        private_notes: invoice["Private Notes"],
      });
    }
    // Generate a buffer from the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      return { success: true, buffer: buffer };
    } else {
      console.error("Error: Buffer is null.");
      return { success: false, error: "Buffer is null." };
    }
  } catch (error) {
    console.error("Error exporting products:", error);
    return null;
  }
});

ipcMain.handle("export-payment_report-to-excel", async (ev, args) => {
  console.log("ev", ev);
  console.log("args", args);
  try {
    // Call the API to get all products with pagination and search query
    const invoices = args;

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();

    // Add a worksheet
    const worksheet = workbook.addWorksheet("Quotation");

    // Define the columns
    worksheet.columns = [
      { header: "Client Name", key: "client_name", width: 20 },
      { header: "Invoice No", key: "invoice_no", width: 20 },
      { header: "Pay Date", key: "issue_date", width: 20 },
      { header: "Type", key: "type", width: 20 },
      { header: "Amount Payment", key: "amount_payment", width: 20 },
      { header: "Amount Used", key: "amount_used", width: 20 },
      { header: "Available Credit", key: "available_credit", width: 20 },
      { header: "Payment Type", key: "payment_type", width: 20 },
    ];

    for (const invoice of invoices) {
      worksheet.addRow({
        client_name: invoice["Client Name"],
        invoice_no: invoice["Invoice No"],
        issue_date: invoice["Pay Date"],
        type: invoice["Type"],
        amount_payment: invoice["Amount Payment"],
        amount_used: invoice["Amount Used"],
        available_credit: invoice["Available Credit"],
        payment_type: invoice["Payment Type"],
      });
    }
    // Generate a buffer from the workbook
    const buffer = await workbook.xlsx.writeBuffer();

    if (buffer) {
      return { success: true, buffer: buffer };
    } else {
      console.error("Error: Buffer is null.");
      return { success: false, error: "Buffer is null." };
    }
  } catch (error) {
    console.error("Error exporting products:", error);
    return null;
  }
});

ipcMain.handle("add-company-details", async (ev, args) => {
  try {
    const response = await addCompanyDetails(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to add product",
    };
  }
});

async function addCompanyDetails(companyDetailsData) {
  try {
    const companyDetailsRepo = DBManager.getRepository(CompanyDetails);

    // Check if company details already exist (assuming there is only one record or a unique key to identify the record)
    let existingCompanyDetails = await companyDetailsRepo.find();

    const companyDetailsObj = {
      companyName: companyDetailsData.companyName,
      address: companyDetailsData.address,
      pincode: companyDetailsData.pincode,
      city: companyDetailsData.city,
      state: companyDetailsData.state,
      country: companyDetailsData.country,
      phone: companyDetailsData.phone,
      email: companyDetailsData.email,
      website: companyDetailsData.website,
      PAN: companyDetailsData.PAN,
      GSTNO: companyDetailsData.GSTNO,
      TIN: companyDetailsData.TIN,
      KEY: companyDetailsData.KEY,
      updated_at: new Date(), // Assuming current timestamp for update
    };

    if (existingCompanyDetails.length > 0) {
      // Update the existing company details (assuming only one record exists)
      const companyDetails = existingCompanyDetails[0];
      Object.assign(companyDetails, companyDetailsObj);
      await companyDetailsRepo.save(companyDetails);
      return {
        success: true,
        message: "Company details updated successfully!",
      };
    } else {
      // Create new company details
      companyDetailsObj.created_at = new Date(); // Adding created_at timestamp for new record
      const newCompanyDetails = companyDetailsRepo.create(companyDetailsObj);
      await companyDetailsRepo.save(newCompanyDetails);
      return {
        success: true,
        message: "New company details added successfully!",
      };
    }
  } catch (error) {
    console.error("Error adding or updating company details:", error);
    return {
      success: false,
      message: "Error adding or updating company details",
    };
  }
}

ipcMain.handle("get-company-details", async (event, args) => {
  try {
    const productRepo = DBManager.getRepository(CompanyDetails);
    const data = await productRepo.find();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.log(error);
    return {
      success: true,
      data: [],
    };
  }
});

ipcMain.handle("create-invoice-from-quotation", async (event, quotationNo) => {
  try {
    // Retrieve the quotation data based on the Quotation_No
    const quotationRepo = DBManager.getRepository(Quotation);
    const quotationData = await quotationRepo.findOne({
      where: { Quotation_No: quotationNo },
    });

    if (!quotationData) {
      return { success: false, message: "Quotation not found" };
    }

    // Remove the Quotation_No from the quotation data and use it for Document_No
    const { Quotation_No, ...invoiceData } = quotationData;

    // Assign Quotation_No to Document_No for the invoice
    invoiceData.Document_No = quotationNo;

    // Convert null or undefined fields to appropriate values
    Object.keys(invoiceData).forEach((key) => {
      if (invoiceData[key] === null || invoiceData[key] === undefined) {
        invoiceData[key] = ""; // or any appropriate default value
      } else if (
        typeof invoiceData[key] === "number" &&
        isNaN(invoiceData[key])
      ) {
        invoiceData[key] = null; // Set NaN to null for number fields
      }
    });

    // Save the invoice data into the Invoice table
    const invoiceRepo = DBManager.getRepository(Invoice);
    await invoiceRepo.save(invoiceData);

    // Update the Quotation entity to mark it as invoiced
    await quotationRepo.update(
      { Quotation_No: quotationNo },
      { Invoiced: true }
    );

    return {
      success: true,
      message: "Invoice created from quotation successfully",
    };
  } catch (error) {
    console.error("Error creating invoice from quotation:", error);
    return { success: false, message: "Error creating invoice from quotation" };
  }
});

ipcMain.handle("update-product-quantity", async (ev, args) => {
  try {
    const response = await updateProductDetails(args);
    return response;
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to update product quantity",
    };
  }
});

ipcMain.handle("get-product-quantity", async (ev, args) => {
  const clientrepo = DBManager.getRepository(ProductQuantities);
  const data = await clientrepo.find();
  return {
    data,
  };
});

async function updateProductDetails(productDetailsData) {
  try {
    const productDetailsRepo = DBManager.getRepository(ProductQuantities);

    for (const data of productDetailsData) {
      // Check if the product already exists
      let existingProductDetails = await productDetailsRepo.findOne({
        where: { Product: data.Product },
      });

      if (existingProductDetails) {
        // Update the existing product's quantity
        existingProductDetails.Quantity = data.Quantity; // Update the quantity
        existingProductDetails.updated_at = new Date();
        await productDetailsRepo.save(existingProductDetails);
        console.log(
          `Product details for ${data.Product} updated successfully!`
        );
      } else {
        // Create new product details
        const newProductDetails = productDetailsRepo.create({
          Product: data.Product,
          Quantity: data.Quantity, // Set the quantity
          created_at: new Date(),
          updated_at: new Date(),
        });
        await productDetailsRepo.save(newProductDetails);
        console.log(
          `New product details for ${data.Product} added successfully!`
        );
      }
    }

    return {
      success: true,
      message: "Product details processed successfully!",
    };
  } catch (error) {
    console.error("Error adding or updating product details:", error);
    return {
      success: false,
      message: "Error adding or updating product details",
    };
  }
}
