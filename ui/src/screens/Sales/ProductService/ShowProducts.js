import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { Button, Typography, Input } from "@material-tailwind/react";
import SelectComp from "../components/SelectComp";
import { Table } from "../components/Table";
import { ImportModal } from "../components/ImportModal";
import { DeleteModal } from "../components/DeleteModal";
import { get_all_product_option } from "../../../utils/SelectOptions";
// import DatePicker from "../components/DatePicker";
import { AddEditViewProductModal } from "./AddEditViewProductModal";
import HomeButton from "../../../assets/Buttons/HomeButton";
import { showmessage } from "../../../utils/api";

const TABLE_HEAD = [
  "S.No",
  "Product/Service Name",
  "Description",
  "Unit Price",
  "Unit",
  "Quantity Sold",
  "Amount",
  "COGS",
  "Gross Margin",
  "Gross Margin %",
  "Keyword",
  "Category",
  "Sub Category",
  "Opening Balance",
  "Opening Value",
  "Opening Rate",
  "Storage Location",
  "Sub Location",
  "Action",
];

const dataDefault = {
  p_type: "Product",
  uom: "",
  product_name: "",
  keyword: "",
  description: "",
  category: "",
  sub_category: "",
  storage_location: "",
  sub_location: "",
  unit_price: "",
  tax: "",
  opening_balance: "",
  opening_value: "",
  opening_rate: "",
  purchase_price: "",
};

const type_options = [
  {
    text: "Product",
    value: "Product",
  },
  // {
  //   text: "Service",
  //   value: "Service",
  // },
];

const unit_options = [
  {
    text: "Boxes",
    value: "Boxes",
  },
  {
    text: "CFT",
    value: "CFT",
  },
  {
    text: "Centimeters",
    value: "Centimeters",
  },
  {
    text: "Gram",
    value: "Gram",
  },
  {
    text: "Inches",
    value: "Inches",
  },
  {
    text: "Hours",
    value: "Hours",
  },
];

const purchase_options = [
  {
    text: "INR",
    value: "INR",
  },
  {
    text: "USD",
    value: "USD",
  },
  {
    text: "CAD",
    value: "CAD",
  },
  {
    text: "LKR",
    value: "LKR",
  },
  {
    text: "CHF",
    value: "CHF",
  },
];

let product_option = [];

export default function ShowProductsPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState({});
  const [deleteModal, setDeleteModal] = useState(false);
  const [addEditModal, setAddEditModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [productIdDelete, setProductIdDelete] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [editId, setEditId] = useState("");
  const [isView, setIsView] = useState(false);

  const [productData, setProductData] = useState(dataDefault);
  const errorDefault = {
    p_type: false,
    product_name: false,
    unit_price: false,
  };
  const [fieldErrors, setFieldErrors] = useState(errorDefault);

  const fieldsToValidate = ["p_type", "product_name", "unit_price"];

  useEffect(() => {
    document.title = "Show Product";
    getAllProduct().then((v) => setProducts(v));
  }, [page]);

  useEffect(() => {
    getCategories();
    getTaxes();
  }, []);

  //Getting categories and Sub categories
  useEffect(() => {
    const getSubCategories = async () => {
      const subCategoriesData = await window.api.invoke(
        "get-sub-categories-by-category-id",
        { category_id: categoryId },
      );
      const subCategoriesArray = subCategoriesData?.data?.map((cat) => ({
        text: cat.name,
        value: cat.name,
      }));
      // //console.log({subCategoriesArray});
      setSubCategories(subCategoriesArray);
    };
    getSubCategories();
  }, [categoryId]);

  const getCategories = async () => {
    const category = await window.api.invoke("get-all-categories");
    let category_option = [{ text: "Add New Category", value: "*" }];

    category.data.map((cat) => {
      category_option.push({ text: cat.name, value: cat.id });
    });
    setCategories(category_option);
  };

  const getTaxes = async () => {
    const taxes = await window.api.invoke("get-all-taxes");
    const taxArray = taxes.data.map((tax) => ({
      text: tax.name,
      value: tax.tax_rate,
    }));
    setTaxes(taxArray);
  };

  // Fetching all products for grid
  const getAllProduct = async () => {
    var res = await window.api.invoke("get-all-products-list", {
      page,
      limit,
    });
    setTotalRows(res.total);
    let temp = res.data.map((c, idx) => ({
      id: c.id,
      product_name: c.product_name,
      description: c.description,
      unit_price: c.unit_price,
      uom: c.uom,
      quantity_sold: c.quantity_sold,
      amount: c.amount,
      cogs: c.cogs,
      gross_margin: c.gross_margin,
      gross_margin_per: c.gross_margin_per,
      keyword: c.keyword,
      category: c.category,
      sub_category: c.sub_category,
      opening_balance: c.opening_balance,
      opening_value: c.opening_value,
      opening_rate: c.opening_rate,
      storage_location: c.storage_location,
      sub_location: c.sub_location,
    }));
    product_option = await get_all_product_option();

    return temp;
  };

  //Pagination
  const paginationDetails = (page, limit) => {
    setPageCount(Math.ceil(totalRows / limit));
    setPage(page);
    setLimit(limit);
  };

  // For search Filters
  const searchByQuery = async () => {
    const filteredSearchQuery = Object.fromEntries(
      Object.entries(searchQuery).filter(([key, value]) => value !== ""),
    );
    const res = await window.api.invoke("get-all-products-list", {
      page,
      limit,
      searchQuery: filteredSearchQuery,
    });

    const temp = res.data.map((c) => ({
      id: c.id,
      product_name: c.product_name,
      description: c.description,
      unit_price: c.unit_price,
      uom: c.uom,
      quantity_sold: c.quantity_sold,
      amount: c.amount,
      cogs: c.cogs,
      gross_margin: c.gross_margin,
      gross_margin_per: c.gross_margin_per,
      keyword: c.keyword,
      category: c.category,
      sub_category: c.sub_category,
      opening_balance: c.opening_balance,
      opening_value: c.opening_value,
      opening_rate: c.opening_rate,
      storage_location: c.storage_location,
      sub_location: c.sub_location,
    }));
    setProducts(temp);
  };

  // Import Products
  const handleImportExcel = async () => {
    setImportModal(true);
  };

  const handleImportModalOpen = () => {
    setImportModal(!importModal);
  };

  const downloadSampleFile = async () => {
    try {
      const response = await window.api.invoke(
        "download-product-sample-import-file",
      );
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "sample_products.xlsx"); // Using FileSaver.js to prompt download
      } else {
        //console.error("Error:", response?.error);
      }
    } catch (error) {
      //console.error("Error invoking IPC:", error);
    }
  };

  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const fileData = {
        originalName: file.name,
        path: file.path,
      };
      const response = await window.api.invoke("import-products-from-excel", {
        fileData,
      });
      if (response && response.success === true) {
        showmessage(response.message);
        setImportModal(false);
      } else {
        showmessage(response.message);
      }
    }
  };

  //Export Products
  const exportClientsToExcel = async () => {
    try {
      const response = await window.api.invoke("export-products-to-excel", {
        page,
        limit,
        searchQuery,
      });
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "export_products.xlsx");
      } else {
        //console.error("Error:", response?.error);
      }
      //console.log("Export response:", response);
    } catch (error) {
      //console.error("Export error:", error);
    }
  };

  // Delete Product
  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const onDeletePopUp = (values) => {
    setDeleteModal(true);
    setProductIdDelete(values);
  };

  const deleteClient = async () => {
    const response = await window.api.invoke("delete-product-by-id", {
      productId: productIdDelete.id,
    });
  };

  // Add and Edit Product
  const handleAddEditOpen = () => {
    setAddEditModal(!addEditModal);
  };

  const openAddEditModal = async (values) => {
    if (values) {
      setEditId(values?.id);
      const productDataForEdit = await window.api.invoke("get-product-by-id", {
        productId: values?.id,
      });
      const prodData = productDataForEdit.product;
      setProductData({
        ...productData,
        id: prodData.id,
        p_type: prodData.p_type,
        product_name: prodData.product_name,
        uom: prodData.uom,
        purchase_price: prodData.purchase_price,
        keyword: prodData.keyword,
        category: prodData.category,
        sub_category: prodData.sub_category,
        opening_balance: prodData.opening_balance,
        opening_rate: prodData.opening_rate,
        opening_value: prodData.opening_value,
        storage_location: prodData.storage_location,
        sub_location: prodData.sub_location,
        unit_price: prodData.unit_price,
        tax: prodData.tax,
        quantity_sold: prodData.quantity_sold,
        description: prodData.description,
      });
    } else {
      setEditId("");
      setProductData(dataDefault);
    }
    setAddEditModal(true);
  };

  const validateFields = () => {
    let isValid = true;
    fieldsToValidate.forEach((fieldName) => {
      if (!productData[fieldName]) {
        setFieldErrors((prevErrors) => ({ ...prevErrors, [fieldName]: true }));
        isValid = false;
      }
    });
    return isValid;
  };

  const saveProducts = async () => {
    if (isView) {
      setIsView(false);
      return;
    }
    if (!validateFields()) {
      return;
    }
    const nonEmptyProductFields = Object.fromEntries(
      Object.entries(productData).filter(([key, value]) => value !== ""),
    );
    if (productData.id) {
      const res = await window.api.invoke("update-product", {
        productId: nonEmptyProductFields.id,
        updatedFields: nonEmptyProductFields,
      });
      if (res && res.success === true) {
        showmessage(res.message);
      } else {
        showmessage(res.message);
      }
    } else {
      const res = await window.api.invoke(
        "add-new-product",
        nonEmptyProductFields,
      );
      if (res && res.success === true) {
        showmessage(res.message);
      } else {
        showmessage(res.message);
      }
    }
  };

  // View Product
  const handleViewOpen = () => {
    setIsView(!isView);
  };

  const openViewModal = async (values) => {
    setIsView(true);
    if (values) {
      setEditId(values?.id);
      const productDataForEdit = await window.api.invoke("get-product-by-id", {
        productId: values?.id,
      });
      const prodData = productDataForEdit.product;
      setProductData({
        ...productData,
        id: prodData.id,
        p_type: prodData.p_type,
        product_name: prodData.product_name,
        uom: prodData.uom,
        purchase_price: prodData.purchase_price,
        keyword: prodData.keyword,
        category: prodData.category,
        sub_category: prodData.sub_category,
        opening_balance: prodData.opening_balance,
        opening_rate: prodData.opening_rate,
        opening_value: prodData.opening_value,
        storage_location: prodData.storage_location,
        sub_location: prodData.sub_location,
        unit_price: prodData.unit_price,
        tax: prodData.tax,
        quantity_sold: prodData.quantity_sold,
        description: prodData.description,
      });
    }
  };

  return (
    <div className="flex flex-col w-full h-full px-5">
      <div className="flex flex-col border border-gray-400 mb-3">
        <div
          className="flex-1 py-3 px-4 border-b border-gray-400"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          <h6>Search Product/Services</h6>
          <HomeButton />
        </div>
        <div className="px-3 py-4">
          <div className="flex flex-row w-full max-w-screen-xl m-auto justify-between my-2">
            <div className="w-1/3 mr-6">
              <SelectComp
                label="Product/Service Name"
                options={product_option}
                isinput={false}
                handle={(values) => {
                  if (values === "*") {
                    openAddEditModal();
                    return;
                  }
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    productId: values.select,
                  }));
                }}
              />
            </div>
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Unit Price From"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    minUnitPrice: v.target.value,
                  }))
                }
              />
            </div>
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Unit Price To"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    maxUnitPrice: v.target.value,
                  }))
                }
                placeholder="Unit Price To"
              />
            </div>
          </div>

          <div className="flex flex-row w-full max-w-screen-xl m-auto justify-between my-2">
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Quantity From"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    minQuantity: v.target.value,
                  }))
                }
              />
            </div>
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Quantity To"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    maxQuantity: v.target.value,
                  }))
                }
                placeholder="Quantity To"
              />
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-4">
            <div className="">
              <Button
                color="blue"
                variant="outlined"
                size="sm"
                onClick={searchByQuery}
              >
                Search
              </Button>
            </div>
            <div className="">
              <Button
                color="blue"
                variant="outlined"
                size="sm"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="border border-gray-400">
        <div className="flex justify-between items-center py-3 px-4 w-full border-b border-gray-400">
          <h6>Results</h6>
          <div className="flex gap-3 my-2 flex-row-reverse">
            <div className="">
              <Button color="blue" size="sm" onClick={exportClientsToExcel}>
                Export
              </Button>
            </div>
            <div className="">
              <Button color="blue" size="sm" onClick={handleImportExcel}>
                Import
              </Button>
            </div>
            <div className="">
              <Button color="blue" size="sm" onClick={() => openAddEditModal()}>
                New Product/Service
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-1 mb-2">
          <Table
            isProduct
            TABLE_HEAD={TABLE_HEAD}
            TABLE_ROWS={products}
            handleEdit={openAddEditModal}
            handleDelete={onDeletePopUp}
            handleView={openViewModal}
            totalCount={totalRows} // to check data exist
            pageCount={pageCount}
            page={page}
            limit={limit}
            paginationDetails={paginationDetails}
          />
        </div>
        {importModal && (
          <div className="flex flex-1 mb-2">
            <ImportModal
              isProduct
              open={importModal}
              handleOpen={handleImportModalOpen}
              downloadSampleFile={downloadSampleFile}
              uploadFile={uploadFile}
            />
          </div>
        )}
        {deleteModal && (
          <DeleteModal
            isDeleteModalOpen={deleteModal}
            setIsDeleteModalOpen={setDeleteModal}
            closeDeleteModal={closeDeleteModal}
            handleDelete={deleteClient}
            module="rule"
          />
        )}
        {addEditModal && (
          <div>
            <AddEditViewProductModal
              isModalOpen={addEditModal}
              handleOpen={handleAddEditOpen}
              typeOptions={type_options}
              unitOptions={unit_options}
              purchaseOptions={purchase_options}
              data={productData}
              setData={setProductData}
              error={fieldErrors}
              setError={setFieldErrors}
              onSave={saveProducts}
              categories={categories}
              setCategoryId={setCategoryId}
              subCategories={subCategories}
              editId={editId}
              taxes={taxes}
            />
          </div>
        )}
        {isView && (
          <div>
            <AddEditViewProductModal
              isModalOpen={isView}
              handleOpen={handleViewOpen}
              typeOptions={type_options}
              unitOptions={unit_options}
              purchaseOptions={purchase_options}
              data={productData}
              setData={setProductData}
              error={fieldErrors}
              setError={setFieldErrors}
              onSave={saveProducts}
              categories={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              subCategories={subCategories}
              editId={editId}
              isView={isView}
              taxes={taxes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
