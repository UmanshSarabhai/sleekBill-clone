import React, { useState, useEffect } from "react";
import { Button, Input } from "@material-tailwind/react";
import HomeButton from "../../assets/Buttons/HomeButton";
import { get_company_details } from "../../utils/SelectOptions";
import { Link } from "react-router-dom";
import { showmessage } from "../../utils/api";

const initialValues = {
  companyName: "",
  address: "",
  pincode: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  email: "",
  website: "",
  PAN: "",
  GSTNO: "",
  TIN: "",
  KEY: "",
};

const KEY = "HSNAMU-4444-KAHTRAS-8888";

export default function AddCompanyDetails() {
  const [formData, setFormData] = useState(initialValues);
  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    async function fetchCompanyDetails() {
      const response = await get_company_details();
      setCompanyDetails(response.data[0]);

      if (response.data[0]?.KEY === KEY) {
        setFormData(response.data[0]);
      }
    }

    fetchCompanyDetails();
  }, []);

  const handleFieldChange = (fieldName, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async () => {
    //console.log(formData);
    const res = await window.api.invoke("add-company-details", formData);
    showmessage(res.message);
    window.location.reload();
  };

  const requiredFields = [
    "CompanyName",
    "Address",
    "Pincode",
    "City",
    "State",
    "Country",
    "Phone",
    "KEY",
  ];

  const isFormIncomplete = requiredFields.some(
    (field) => formData[field] === "",
  );

  const keyToCompare = companyDetails?.KEY;

  return (
    <>
      <div style={{ position: "absolute", marginLeft: -15 }}>
        <HomeButton />
      </div>
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: "linear-gradient(19deg, #6396b9c7, transparent)" }}
      >
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1
            className="text-2xl font-bold mb-4"
            style={{ display: "flex", justifyContent: "center" }}
          >
            Add Company Details
          </h1>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData)
                .filter(([key]) => key !== "id" && key !== "created_at")
                .map(([key, value]) => (
                  <Input
                    key={key}
                    type="text"
                    color="grey"
                    placeholder={key}
                    label={key}
                    value={value}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                    style={{ width: "100%" }}
                    className="mb-4"
                    disabled={key === "KEY" && keyToCompare === KEY}
                  />
                ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {KEY !== keyToCompare ? (
                <>
                  <div style={{ color: "red", marginTop: 10 }}>
                    ERR: Please Enter Correct KEY
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={isFormIncomplete}
                    style={{ width: "-webkit-fill-available" }}
                  >
                    {" "}
                    Save Details{" "}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Link to="/dashboard">
                      <Button className="rounded-full" color="green">
                        Happy Invoicing ❤️
                      </Button>
                    </Link>
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={isFormIncomplete}
                    style={{ width: "-webkit-fill-available" }}
                  >
                    Update Details
                  </Button>{" "}
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
