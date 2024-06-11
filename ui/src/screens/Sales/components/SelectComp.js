import React from "react";
import Select from "react-select";
import { Link } from "react-router-dom";

export default function SelectComp({
  label = "",
  placeholder = "",
  options = [],
  handle,
}) {
  const handleChange = (selectedOption) => {
    handle(selectedOption.value);
  };

  const selectOptions = options.map((option) => ({
    value: option.text,
    label: option.text,
  }));

  return (
    <div className="flex flex-1 items-center w-full" style={{ minWidth: 200 }}>
      <Select
        options={selectOptions}
        onChange={handleChange}
        placeholder={placeholder ? placeholder : label}
        className="selectComp"
      />
    </div>
  );
}
