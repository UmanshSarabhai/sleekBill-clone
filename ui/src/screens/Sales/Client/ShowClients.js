import { Button, Typography, Input } from "@material-tailwind/react";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import SelectComp from "../components/SelectComp";
import { get_all_client_option } from "../../../utils/SelectOptions";
import { Table } from "../components/Table";
import { ImportModal } from "../components/ImportModal";
import { DeleteModal } from "../components/DeleteModal";
import { AddEditViewClientModal } from "./AddEditViewClientModal";
import {
  getAllCountry,
  getStates,
  getCities,
  getFilterCities,
} from "../../../utils/AddressDataApi";
import HomeButton from "../../../assets/Buttons/HomeButton";
import { showmessage } from "../../../utils/api";

const TABLE_HEAD = [
  "S.No",
  "Client Name",
  "Contact Name",
  "Billing Address",
  "Email",
  "Phone",
  "Private Detail",
  "Action",
];

const dataDefault = {
  client_name: "",
  contact_name: "",
  phone: "",
  email: "",
  gstin: "",
  tin: "",
  pan: "",
  vat: "",
  billing_address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  private_detail: "",
  other_detail: "",
  vendor: false,
  sez: false,
  shipping_client_name: "",
  shipping_address: "",
  shipping_country: "",
  shipping_state: "",
  shipping_city: "",
  shipping_pincode: "",
};

const currency_options = [
  {
    text: "Indian rupee(INR)",
    value: "Indian rupee(INR)",
  },
];

let client_option = [];

export default function ShowClientPage() {
  const [clients, setClients] = useState([]); //for table
  const [searchQuery, setSearchQuery] = useState({});
  const [importModal, setImportModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [clientIdDelete, setClientIdDelete] = useState("");
  const [addEditModal, setAddEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const [clientData, setClientData] = useState(dataDefault);
  const [fieldErrors, setFieldErrors] = useState({
    client_name: false,
    phone: false,
    billing_address: false,
    country: false,
    state: false,
    city: false,
    pincode: false,
  });
  const [editId, setEditId] = useState("");
  const [countries, setCountries] = useState(getAllCountry());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [filterCitiesData, setFilterCitiesData] = useState(getFilterCities());

  //console.log("data", clientData);

  const fieldsToValidate = [
    "client_name",
    "phone",
    "billing_address",
    "country",
    "state",
    "city",
    "pincode",
  ];

  useEffect(() => {
    document.title = "Show Clients";
    getAllClients().then((v) => setClients(v));
  }, [page]);

  // Fetching all clients for grid
  const getAllClients = async () => {
    let res = await window.api.invoke("get-all-clients-list", {
      page,
      limit,
    });
    setTotalRows(res.total);
    let temp = res.data.map((c) => ({
      id: c.id,
      client_name: c.client_name,
      contact_name: c.contact_name,
      billing_address: c.billing_address,
      email: c.email,
      phone: c.phone,
      private_client_detail: c.private_client_detail,
    }));
    client_option = await get_all_client_option();
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
    const res = await window.api.invoke("get-all-clients-list", {
      page,
      limit,
      searchQuery: filteredSearchQuery,
    });
    const temp = res.data.map((c) => ({
      id: c.id,
      client_name: c.client_name,
      contact_name: c.contact_name,
      billing_address: c.billing_address,
      email: c.email,
      phone: c.phone,
      private_client_detail: c.private_client_detail,
    }));
    setClients(temp);
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
        "download-client-sample-import-file",
      );
      if (response?.success) {
        // Handle successful response, e.g., prompt download
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "sample_clients.xlsx"); // Using FileSaver.js to prompt download
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
      const response = await window.api.invoke("import-clients-from-excel", {
        fileData,
      });
    }
  };

  //Export Products
  const exportClientsToExcel = async () => {
    try {
      const response = await window.api.invoke("export-clients-to-excel", {
        page,
        limit,
        searchQuery,
      });
      if (response?.success) {
        const buffer = response.buffer;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "export_clients.xlsx");
      } else {
        //console.error("Error:", response?.error);
      }
      //console.log("Export response:", response);
    } catch (error) {
      //console.error("Export error:", error);
    }
  };

  //Delete Client
  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const onDeletePopUp = (values) => {
    setDeleteModal(true);
    setClientIdDelete(values);
  };

  const deleteClient = async () => {
    const response = await window.api.invoke("delete-client-by-id", {
      clientId: clientIdDelete.id,
    });
  };

  // Add and Edit Product
  const handleAddEditViewOpen = () => {
    setAddEditModal(!addEditModal);
  };

  const openAddEditModal = async (values) => {
    if (values) {
      setEditId(values?.id);
      const clientDataForEdit = await window.api.invoke("get-client-by-id", {
        clientId: values?.id,
      });
      const clientData = clientDataForEdit.client;
      setClientData({
        ...clientData,
        id: clientData.id,
        client_name: clientData.client_name,
        contact_name: clientData.contact_name,
        phone: clientData.phone,
        email: clientData.email,
        gstin: clientData.gstin,
        tin: clientData.tin,
        pan: clientData.pan,
        vat: clientData.vat,
        billing_address: clientData.billing_address,
        country: clientData.country,
        state: clientData.state,
        city: clientData.city,
        pincode: clientData.pincode,
        billing_address_id: clientData.billing_address_id,
        shipping_address_id: clientData.shipping_address_id,
        shipping_client_name: clientData.shipping_client_name,
        shipping_address: clientData.shipping_address,
        shipping_country: clientData.shipping_country,
        shipping_state: clientData.shipping_state,
        shipping_city: clientData.shipping_city,
        shipping_pincode: clientData.shipping_pincode,
      });
    } else {
      setEditId("");
      setClientData(dataDefault);
    }
    setAddEditModal(true);
  };

  const validateFields = () => {
    let isValid = true;
    fieldsToValidate.forEach((fieldName) => {
      if (!clientData[fieldName]) {
        setFieldErrors((prevErrors) => ({ ...prevErrors, [fieldName]: true }));
        isValid = false;
      }
    });
    return isValid;
  };

  const saveClients = async () => {
    if (viewModal) {
      setViewModal(false);
      return;
    }
    if (!validateFields()) {
      return;
    }
    const nonEmptyProductFields = Object.fromEntries(
      Object.entries(clientData).filter(([key, value]) => value !== ""),
    );

    const updateClientObj = {
      client_name: nonEmptyProductFields?.client_name,
      contact_name: nonEmptyProductFields?.contact_name,
      phone: nonEmptyProductFields?.phone,
      email: nonEmptyProductFields?.email,
      gstin: nonEmptyProductFields?.gstin,
      tin: nonEmptyProductFields?.tin,
      pan: nonEmptyProductFields?.pan,
      vat: nonEmptyProductFields?.vat,
      private_client_detail: nonEmptyProductFields?.private_client_detail,
      other_client_detail: nonEmptyProductFields?.other_client_detail,
      vendor: nonEmptyProductFields?.vendor,
      sez: nonEmptyProductFields?.sez,
    };

    const updateBillingObj = {
      id: nonEmptyProductFields?.billing_address_id,
      address: nonEmptyProductFields?.billing_address,
      city: nonEmptyProductFields?.city,
      state: nonEmptyProductFields?.state,
      country: nonEmptyProductFields?.country,
      pincode: nonEmptyProductFields?.pincode,
    };

    const updateShippingObj = {
      id: nonEmptyProductFields?.shipping_address_id,
      address: nonEmptyProductFields?.shipping_address,
      city: nonEmptyProductFields?.shipping_city,
      state: nonEmptyProductFields?.shipping_state,
      country: nonEmptyProductFields?.shippinng_country,
      pincode: nonEmptyProductFields?.shipping_pincode,
    };

    const isShippingObjDefined = Object.values(updateShippingObj).every(
      (value) => value !== undefined,
    );

    if (clientData.id) {
      const res = await window.api.invoke("update-client", {
        clientId: nonEmptyProductFields.id,
        clientFields: updateClientObj,
        billingAddress: updateBillingObj,
        ...(isShippingObjDefined && { shippingAddress: updateShippingObj }),
      });
      if (res && res.success === true) {
        showmessage(res.message);
      } else {
        showmessage(res.message);
      }
    } else {
      const res = await window.api.invoke(
        "add-new-client",
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
    setViewModal(!viewModal);
  };

  const openViewModal = async (values) => {
    setViewModal(true);
    if (values) {
      setEditId(values?.id);
      const clientDataForEdit = await window.api.invoke("get-client-by-id", {
        clientId: values?.id,
      });
      const clientData = clientDataForEdit.client;
      setClientData({
        ...clientData,
        id: clientData.id,
        client_name: clientData.client_name,
        contact_name: clientData.contact_name,
        phone: clientData.phone,
        email: clientData.email,
        gstin: clientData.gstin,
        tin: clientData.tin,
        pan: clientData.pan,
        vat: clientData.vat,
        billing_address: clientData.billing_address,
        country: clientData.country,
        state: clientData.state,
        city: clientData.city,
        pincode: clientData.pincode,
        billing_address_id: clientData.billing_address_id,
        shipping_address_id: clientData.shipping_address_id,
        shipping_client_name: clientData.shipping_client_name,
        shipping_address: clientData.shipping_address,
        shipping_country: clientData.shipping_country,
        shipping_state: clientData.shipping_state,
        shipping_city: clientData.shipping_city,
        shipping_pincode: clientData.shipping_pincode,
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
          <h6>Search Clients</h6>
          <HomeButton />
        </div>
        <div className="px-3 py-4">
          <div className="flex flex-row w-full max-w-screen-xl m-auto justify-between my-2">
            <div className="w-1/3 mr-6">
              <SelectComp
                label="Client"
                options={client_option}
                isinput={false}
                handle={(values) => {
                  if (values === "Add new Client") {
                    openAddEditModal();
                    return;
                  }
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    clientId: values.select,
                  }));
                }}
              />
            </div>
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Email"
                placeholder="Email"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    email: v.target.value,
                  }))
                }
              />
            </div>
            <div className="w-1/3 mr-6"></div>
          </div>

          <div className="flex flex-row w-full max-w-screen-xl m-auto justify-between my-2">
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Contact Name"
                placeholder="Contact Name"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    contactName: v.target.value,
                  }))
                }
              />
            </div>
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="Phone"
                placeholder="Phone"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    phone: v.target.value,
                  }))
                }
              />
            </div>
            <div className="w-1/3 mr-6">
              <Input
                variant="outlined"
                label="GSTIN"
                onChange={(v) =>
                  setSearchQuery((prevSearchQuery) => ({
                    ...prevSearchQuery,
                    gstin: v.target.value,
                  }))
                }
                placeholder="GSTIN"
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
        <div className=" flex justify-between items-center py-3 px-4 w-full border-b border-gray-400">
          <Typography variant="h6">Results</Typography>
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
                New Client
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-1 mb-2">
          <Table
            isClient
            TABLE_HEAD={TABLE_HEAD}
            TABLE_ROWS={clients}
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
              isClient
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
            <AddEditViewClientModal
              isModalOpen={addEditModal}
              handleOpen={handleAddEditViewOpen}
              data={clientData}
              setData={setClientData}
              error={fieldErrors}
              setError={setFieldErrors}
              onSave={saveClients}
              editId={editId}
              isView={viewModal}
              countries={countries}
              states={states}
              setStates={setStates}
              cities={cities}
              setCities={setCities}
              getStates={getStates}
              getCities={getCities}
              currencyOptions={currency_options}
            />
          </div>
        )}
        {viewModal && (
          <div>
            <AddEditViewClientModal
              isModalOpen={viewModal}
              handleOpen={handleViewOpen}
              data={clientData}
              setData={setClientData}
              error={fieldErrors}
              setError={setFieldErrors}
              onSave={saveClients}
              editId={editId}
              isView={viewModal}
              countries={countries}
              states={states}
              setStates={setStates}
              cities={cities}
              setCities={setCities}
              getStates={getStates}
              getCities={getCities}
              currencyOptions={currency_options}
            />
          </div>
        )}
      </div>
    </div>
  );
}
