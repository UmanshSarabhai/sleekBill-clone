import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";

export default function ReportsDropDown() {
  const location = useLocation();
  const navigate = useNavigate();

  function convertDropdownData(data) {
    return data.map((item) => ({
      text: item,
      value: item,
    }));
  }

  function extractMiddleTitleCase(path) {
    const parts = path.split("/");
    const middlePart = parts.slice(2, -1).join(" ");
    const titleCaseMiddlePart = middlePart.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
    return "Show " + titleCaseMiddlePart;
  }

  function ListItemsOptions({ title, to }) {
    const renderTitle = () => {
      if (!title) return null;
      return (
        <h1
          className="font-bold text-black"
          style={{
            display: "inline-flex",
            alignItems: "center",
            fontSize: "small",
          }}
        >
          {title}
        </h1>
      );
    };

    const handleClick = () => {
      navigate(to);
    };

    return (
      <div
        onClick={handleClick}
        style={{
          justifyContent: "center",
          border: "none",
          cursor: "pointer", // Add cursor style for better UX
        }}
      >
        <div>{renderTitle()}</div>
      </div>
    );
  }

  const options = [
    {
      value: "1",
      label: <ListItemsOptions title="Show Invoice" to="/sales/invoice/show" />,
    },
    {
      value: "2",
      label: (
        <ListItemsOptions title="Show Quotation" to="/sales/quotation/show" />
      ),
    },
    {
      value: "3",
      label: <ListItemsOptions title="Show Debit" to="/sales/debit/show" />,
    },
    {
      value: "4",
      label: <ListItemsOptions title="Show Credit" to="/sales/credit/show" />,
    },
    {
      value: "5",
      label: (
        <ListItemsOptions title="Show Purchase" to="/sales/purchase/show" />
      ),
    },
    {
      value: "6",
      label: <ListItemsOptions title="Show Payment" to="/sales/payment/show" />,
    },
    {
      value: "7",
      label: <ListItemsOptions title="Show Vendors" to="/sales/vendors/show" />,
    },
  ];

  return (
    <div style={{ width: 200, marginLeft: 20 }}>
      <Select
        options={options}
        placeholder={extractMiddleTitleCase(location.pathname)}
      />
    </div>
  );
}
