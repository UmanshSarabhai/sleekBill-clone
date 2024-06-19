import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Typography,
  Checkbox,
} from "@material-tailwind/react";
import SelectComp from "../components/SelectComp";

export function AddEditViewClientModal({
  isModalOpen,
  handleOpen,
  data,
  setData,
  error,
  setError,
  onSave,
  editId,
  isView = false,
  countries,
  states,
  setStates,
  cities,
  setCities,
  getStates,
  getCities,
  currencyOptions,
}) {
  //console.log({ isView });
  const [shippingAddress, setShippingAddress] = useState(false);
  const title = isView
    ? "View Client"
    : editId
      ? "Edit Client"
      : "Add New Client";
  const subTitle = isView
    ? "View Client"
    : editId
      ? "Edit Client"
      : "Add Client";

  const renderErrorMessage = (fieldName, message) => {
    return (
      error[fieldName] && <p className="text-red-500 text-sm mt-1">{message}</p>
    );
  };

  useEffect(() => {
    if (data.shipping_address) {
      setShippingAddress(true);
      setStates(getStates(data.country));
      setCities(getCities(data.state));
    }
  }, [data]);

  return (
    <>
      <Dialog open={isModalOpen} handler={handleOpen} className=" ModalPopup">
        <div className="flex items-center justify-between">
          <DialogHeader className="flex flex-col items-start">
            <Typography className="mb-1" variant="h4">
              {title}
            </Typography>
          </DialogHeader>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="mr-3 h-5 w-5"
            onClick={handleOpen}
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <DialogBody>
          <Typography className="mb-10 -mt-7 " color="gray" variant="lead">
            {subTitle}
          </Typography>
          <div className="grid gap-6 ">
            <div className="grid gap-6">
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="Client Name"
                  value={data.client_name}
                  disabled={isView}
                  onChange={(v) => {
                    const nameValue = v.target.value;
                    setData({ ...data, client_name: nameValue });
                    setError((prevErrors) => ({
                      ...prevErrors,
                      client_name: !nameValue.trim(),
                    }));
                  }}
                />
                {renderErrorMessage("client_name", "Client name is required.")}
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="Contact Name"
                  value={data.contact_name}
                  disabled={isView}
                  onChange={(v) => {
                    const nameValue = v.target.value;
                    setData({ ...data, contact_name: nameValue });
                  }}
                />
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="Phone"
                  value={data.phone}
                  disabled={isView}
                  onChange={(v) => {
                    const phoneValue = v.target.value;
                    setData({ ...data, phone: phoneValue });
                    setError((prevErrors) => ({
                      ...prevErrors,
                      phone: !phoneValue.trim(),
                    }));
                  }}
                />
                {renderErrorMessage("phone", "Phone is required.")}
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="Email"
                  value={data.email}
                  disabled={isView}
                  onChange={(v) => {
                    const emailValue = v.target.value;
                    setData({ ...data, email: emailValue });
                  }}
                />
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="GSTIN"
                  value={data.gstin}
                  disabled={isView}
                  onChange={(v) => {
                    const gstinValue = v.target.value;
                    setData({ ...data, gstin: gstinValue });
                  }}
                />
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="TIN"
                  placeholder="Like: 14123456789"
                  value={data.tin}
                  disabled={isView}
                  onChange={(v) => {
                    const tinValue = v.target.value;
                    setData({ ...data, tin: tinValue });
                  }}
                />
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="PAN"
                  value={data.pan}
                  disabled={isView}
                  onChange={(v) => {
                    const panValue = v.target.value;
                    setData({ ...data, pan: panValue });
                  }}
                />
              </div>
              <div className="mb-5">
                <Input
                  variant="outlined"
                  label="VAT No"
                  value={data.vat}
                  disabled={isView}
                  onChange={(v) => {
                    const vatValue = v.target.value;
                    setData({ ...data, vat: vatValue });
                  }}
                />
              </div>
              <div className="mb-3.5">
                <Textarea
                  variant="outlined"
                  label="Billing Address"
                  value={data.billing_address}
                  disabled={isView}
                  onChange={(v) => {
                    const addressValue = v.target.value;
                    setData({ ...data, billing_address: addressValue });
                    setError((prevErrors) => ({
                      ...prevErrors,
                      billing_address: !addressValue.trim(),
                    }));
                  }}
                />
                {renderErrorMessage("billing_address", "Address is required.")}
              </div>
              <div className="mb-5">
                <SelectComp
                  label="Country"
                  isinput={false}
                  options={countries}
                  defaultValue={data.country}
                  disabled={isView}
                  handle={(values) => {
                    const value = values;
                    setError((prevErrors) => ({
                      ...prevErrors,
                      country: !value,
                    }));
                    setData({ ...data, country: value });
                    setStates(getStates(value));
                  }}
                />
                {renderErrorMessage("country", "Country is required.")}
              </div>

              <div className="mb-5">
                <SelectComp
                  label="State"
                  isinput={false}
                  options={states}
                  defaultValue={data.state}
                  disabled={isView}
                  handle={(values) => {
                    const value = values;
                    setError((prevErrors) => ({
                      ...prevErrors,
                      state: !value,
                    }));
                    setData({ ...data, state: value });
                    setCities(getCities(value));
                  }}
                />
                {renderErrorMessage("state", "State is required.")}
              </div>
              <div className="mb-5">
                <SelectComp
                  label="City"
                  isinput={false}
                  options={cities}
                  defaultValue={data.city}
                  disabled={isView}
                  handle={(values) => {
                    const value = values;
                    setError((prevErrors) => ({
                      ...prevErrors,
                      city: !value,
                    }));
                    setData({ ...data, city: values });
                  }}
                />
                {renderErrorMessage("city", "City is required.")}
              </div>
              <div className="mb-5">
                <div>
                  <Input
                    variant="outlined"
                    label="Pincode"
                    value={data.pincode}
                    disabled={isView}
                    onChange={(v) => {
                      const pinValue = v.target.value;
                      setData({ ...data, pincode: pinValue });
                      setError((prevErrors) => ({
                        ...prevErrors,
                        pincode: !pinValue.trim(),
                      }));
                    }}
                  />
                  {renderErrorMessage("pincode", "Pincode is required.")}
                </div>
              </div>
            </div>
            <div>
              {shippingAddress ? (
                <div>
                  <div className="mb-5">
                    <Input
                      variant="outlined"
                      label="Client Name"
                      value={data.shipping_client_name}
                      disabled={isView}
                      onChange={(v) => {
                        const nameValue = v.target.value;
                        setData({ ...data, shipping_client_name: nameValue });
                      }}
                    />
                  </div>
                  <div className="mb-5">
                    <Textarea
                      variant="outlined"
                      label="Shipping Address"
                      value={data.shipping_address}
                      disabled={isView}
                      onChange={(v) => {
                        const addressValue = v.target.value;
                        setData({ ...data, shipping_address: addressValue });
                      }}
                    />
                  </div>
                  <div className="mb-5">
                    <SelectComp
                      label="Country"
                      isinput={false}
                      options={countries}
                      defaultValue={data.shipping_country}
                      disabled={isView}
                      handle={(values) => {
                        setData({ ...data, shipping_country: values });
                        setStates(getStates(values));
                      }}
                    />
                    <SelectComp
                      label="State"
                      isinput={false}
                      options={states}
                      defaultValue={data.shipping_state}
                      disabled={isView}
                      handle={(values) => {
                        setData({ ...data, shipping_state: values });
                        setCities(getCities(values));
                      }}
                    />
                    <SelectComp
                      label="City"
                      isinput={false}
                      options={cities}
                      defaultValue={data.shipping_city}
                      disabled={isView}
                      handle={(values) => {
                        setData({ ...data, shipping_city: values });
                      }}
                    />
                  </div>
                  <div className="flex mb-5">
                    <div className="mr-5">
                      <Input
                        variant="outlined"
                        label="Pincode"
                        value={data.shipping_pincode}
                        disabled={isView}
                        onChange={(v) => {
                          const pinValue = v.target.value;
                          setData({ ...data, shipping_pincode: pinValue });
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="space-x-2">
          <Button variant="gradient" color="gray" onClick={onSave}>
            {isView ? "Done" : editId ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
