import React, { useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import { Actions } from "./Actions";

export function Table({
  TABLE_HEAD,
  TABLE_ROWS,
  handleEdit,
  handleDelete,
  handleView,
  totalCount,
  paginationDetails,
  page,
  limit,
  pageCount,
  isClient,
}) {
  if (totalCount === 0) {
    //console.log("no data");
  }

  useEffect(() => {
    if (paginationDetails) {
      paginationDetails(page, limit);
    }
  }, [page, limit, paginationDetails]);

  const totalPages = Math.ceil(totalCount / limit);

  const actionHeaderIndex = TABLE_HEAD.indexOf("Action");

  const calculateTotalQuantity = (columnIndex) => {
    if (!TABLE_ROWS || TABLE_ROWS.length === 0) {
      return 0; // Return 0 if TABLE_ROWS is empty or undefined
    }

    const columnName = Object.keys(TABLE_ROWS[0])[columnIndex + 1]; // +1 to skip the index column
    if (
      ["quantity", "amount", "quantity_sold", "cogs", "gross_margin"].includes(
        columnName,
      )
    ) {
      return TABLE_ROWS.reduce((total, row) => {
        const value = row[columnName];
        return total + (value || 0);
      }, 0);
    }
    // Return blank spaces for other columns
    return TABLE_ROWS.reduce((total, row) => {
      const value = row[columnName];
      //console.log({ value });
      return " ";
    }, 0);
    // return; // Return for other columns
  };

  // Add an additional row for total quantities
  const renderTotalRow = [
    <tr>
      <td colSpan="1" className="p-4 border-t border-blue-gray-100">
        <Typography
          variant="small"
          color="black"
          className="font-normal leading-none opacity-70"
        >
          Total All
        </Typography>
      </td>
      {TABLE_HEAD.slice(1).map((head, idx) => (
        <td key={idx} className="p-4 border-t border-blue-gray-100">
          <Typography variant="small" color="blue-gray" className="font-normal">
            {calculateTotalQuantity(idx)}
          </Typography>
        </td>
      ))}
      <td className="p-4 border-t border-blue-gray-100"></td>
    </tr>,
  ];

  return (
    <Card className="h-full w-full rounded-none pb-0 shadow-none p-4">
      <CardBody className="p-0 border border-gray-400  overflow-x-auto">
        <table
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          border="0"
          className="w-full min-w-max table-auto text-left"
        >
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-b border-blue-gray-100 bg-blue-50 p-4"
                >
                  <Typography
                    variant="small"
                    color="black"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TABLE_ROWS.map((values, index) => {
              const isLast = index === TABLE_ROWS.length - 1;
              const classes = isLast
                ? "p-4"
                : "p-4 border-b border-blue-gray-50";

              return (
                <tr key={toString(Math.random() * 1000)}>
                  <td className={classes}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {index + 1}
                        </Typography>
                      </div>
                    </div>
                  </td>
                  {Object.keys(values)
                    .slice(1)
                    .map((v, idx) => {
                      return (
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {values[v] == null ? "-" : values[v]}
                          </Typography>
                        </td>
                      );
                    })}

                  <td className={classes}>
                    {actionHeaderIndex !== -1 &&
                      actionHeaderIndex === Object.keys(values).length && (
                        <div className="flex">
                          <Actions
                            handleEdit={() => handleEdit(values)}
                            handleDelete={() => handleDelete(values)}
                            handleView={() => handleView(values)}
                          />
                        </div>
                      )}
                  </td>
                </tr>
              );
            })}
            {!isClient && totalCount > 0 && renderTotalRow}
          </tbody>
        </table>
      </CardBody>

      <CardFooter className=" rounded-none flex items-center justify-between border-t border-blue-gray-50 p-4">
        <Typography variant="small" color="blue-gray" className="font-normal">
          Page {page} of {pageCount}
        </Typography>
        <div className="flex gap-2">
          <Button
            color="blue"
            variant="outlined"
            size="sm"
            onClick={() => paginationDetails(page - 1, limit)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            color="blue"
            variant="outlined"
            size="sm"
            onClick={() => paginationDetails(page + 1, limit)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
