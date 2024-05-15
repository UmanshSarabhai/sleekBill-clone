import { Link, useLocation } from "react-router-dom";
import Select from "react-select";

export default function ModuleDropDown() {
  const location = useLocation();

  function extractMiddleTitleCase(path) {
    const parts = path.split("/");
    const middlePart = parts.slice(2, -1).join(" ");
    const titleCaseMiddlePart = middlePart.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
    return "New " + titleCaseMiddlePart;
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

    return (
      <Link to={to}>
        <div
          style={{
            justifyContent: "center",
            border: "none",
          }}
        >
          <div>{renderTitle()}</div>
        </div>
      </Link>
    );
  }
  const options = [
    {
      value: "1",
      label: <ListItemsOptions title="New Invoice" to="/sales/invoice/new" />,
    },
    {
      value: "2",
      label: (
        <ListItemsOptions title="New Quotation" to="/sales/quotation/new" />
      ),
    },
    {
      value: "3",
      label: <ListItemsOptions title="New Debit" to="/sales/debit/new" />,
    },
    {
      value: "4",
      label: <ListItemsOptions title="New Credit" to="/sales/credit/new" />,
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
