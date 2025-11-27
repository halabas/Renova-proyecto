import React from "react";
import { MaterialReactTable } from "material-react-table";
import { MRT_Localization_ES } from 'material-react-table/locales/es';

export function Tabla({ columns, data, pageSize = 5 }) {
  return (
    <div className="p-4">
      <MaterialReactTable
        columns={columns}
        data={data}
        enableColumnActions={false}
        enableSorting
        enablePagination
        initialState={{
          pagination: { pageSize },
        }}
        muiTableContainerProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
          },
        }}
        muiTablePaperProps={{
          sx: {
            borderRadius: "20px",
          },
        }}
        muiTableHeadCellProps={{
          sx: {
            background: "linear-gradient(90deg, #9747ff, #ff2e88)",
            color: "white",
            fontFamily: "'Helvetica_Now_Display:Bold', sans-serif",
            fontSize: "18px",
          },
        }}
        muiTableBodyCellProps={{
          sx: {
            fontFamily: "'Helvetica_Now_Display:Bold', sans-serif",
            fontSize: "16px",
          },
        }}
        muiTableBodyRowProps={{
          sx: {
            "&:hover": {
              background: "linear-gradient(90deg, #9747ff10, #ff2e8810)",
            },
          },
        }}
        localization={MRT_Localization_ES}
      />
    </div>
  );
}
