import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";

export default function AddNewClientModal({ isOpen, handleOpen, handleClose }) {
  const [clientData, setClientData] = useState({
    client_name: "",
    contact_name: "",
    phone: "",
    email: "",
    gstin: "",
    tin: "",
    pan: "",
    billing_address: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Save client data logic here
    const res = await window.api.invoke("add-new-client", clientData);
    alert(res.message);
    handleClose();
  };
  const requiredFields = [
    "client_name",
    "contact_name",
    "phone",
    "email",
    "gstin",
    "billing_address",
    "address",
    "city",
    "state",
    "pincode",
    "country",
  ];

  const isFormIncomplete = requiredFields.some(
    (field) => clientData[field] === "",
  );

  return (
    <Dialog size="md" open={isOpen} handler={handleOpen}>
      <DialogHeader toggler={handleClose}>Add New Client</DialogHeader>
      <DialogBody>
        <div
          className="space-y-2"
          style={{ overflow: "auto", height: "75vh", padding: 10 }}
        >
          <Input
            variant="outlined"
            label="Client Name"
            name="client_name"
            value={clientData.client_name}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Contact Name"
            name="contact_name"
            value={clientData.contact_name}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Phone"
            name="phone"
            value={clientData.phone}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Email"
            name="email"
            value={clientData.email}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="GSTIN"
            name="gstin"
            value={clientData.gstin}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="TIN"
            name="tin"
            value={clientData.tin}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="PAN"
            name="pan"
            value={clientData.pan}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Billing Address"
            name="billing_address"
            value={clientData.billing_address}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Address"
            name="address"
            value={clientData.address}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="City"
            name="city"
            value={clientData.city}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="State"
            name="state"
            value={clientData.state}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Country"
            name="country"
            value={clientData.country}
            onChange={handleChange}
          />
          <Input
            variant="outlined"
            label="Pincode"
            name="pincode"
            value={clientData.pincode}
            onChange={handleChange}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={handleClose}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          style={{ marginRight: 5 }}
        >
          Close
        </Button>
        <Button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
          disabled={isFormIncomplete}
        >
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
