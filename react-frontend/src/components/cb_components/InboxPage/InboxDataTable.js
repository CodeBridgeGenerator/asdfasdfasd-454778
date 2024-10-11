import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { useState, useRef } from "react";
import _ from "lodash";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useParams } from "react-router-dom";
import moment from "moment";
import UploadService from "../../../services/UploadService";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import DownloadCSV from "../../../utils/DownloadCSV";
import Toggle from "../../../assets/icons/Toggle.js";
import Home from "../../../assets/icons/Home.js";
import Data from "../../../assets/icons/Data.js";
import Messaging from "../../../assets/icons/Messaging.js";
import Report from "../../../assets/icons/Report.js";
import GenAI from "../../../assets/icons/GenAI.js";
import StaffInfo from "../../../assets/icons/StaffInfo.js";
import Stack from "../../../assets/icons/Stack.js";
import DynaLoader from "../../../assets/icons/DynaLoader.js";
import Notification from "../../../assets/icons/Notification.js";
import Server from "../../../assets/icons/Server.js";
import Email from "../../../assets/icons/Email.js";
import MailSent from "../../../assets/icons/MailSent.js";
import Load from "../../../assets/icons/Load.js";
import Chat from "../../../assets/icons/Chat.js";
import Terminal from "../../../assets/icons/Terminal.js";
import Documents from "../../../assets/icons/Documents.js";
import "./InboxDataTable.css";

const serviceIcons = {
  Dashboard: <Home />,
  "Data management": <Data />,
  "Staff info": <StaffInfo />,
  DynaLoader: <Stack />,
  // "companies": <Stack />,
  companies: <i className="pi pi-building text-xl mr-3" />,
  "Job ques": <Stack />,
  Messaging: <Messaging />,
  Notifications: <Notification />,
  "Email templates": <Email />,
  "Mail sent logs": <MailSent />,
  "Mail job ques": <Stack />,
  "Mail warehouse": <Server />,
  Reports: <Report />,
  "Generate reports": <Load />,
  "Gen AI": <GenAI />,
  "Chat AI": <Chat />,
  Prompts: <Terminal />,
  Usage: <Documents />,
};

const InboxDataTable = ({
  items,
  fields,
  onEditRow,
  onRowDelete,
  onRowClick,
  searchDialog,
  setSearchDialog,
  showUpload,
  setShowUpload,
  showFilter,
  setShowFilter,
  showColumns,
  setShowColumns,
  onClickSaveFilteredfields,
  selectedFilterFields,
  setSelectedFilterFields,
  selectedHideFields,
  setSelectedHideFields,
  onClickSaveHiddenfields,
  loading,
  user,
}) => {
  const dt = useRef(null);
  const urlParams = useParams();
  const [view, setView] = useState("inbox");
  const [globalFilter, setGlobalFilter] = useState("");

  // Function to filter the items based on the selected view
  const filteredItems = items.filter((item) => {
    if (view === "sent") {
      return item.from?._id === user._id; // Show sent messages
    } else {
      return item.toUser?._id === user._id; // Show received messages
    }
  });

  // const serviceTemplate = (rowData, { rowIndex }) => <p>{rowData.service}</p>;
  const serviceTemplate = (rowData) => {
    return serviceIcons[rowData.service] || <p>{rowData.service}</p>;
  };

  const dropdownTemplate0 = (rowData, { rowIndex }) => (
    <p>{rowData.from?.name}</p>
  );
  const dropdownTemplate1 = (rowData, { rowIndex }) => (
    <p>{rowData.toUser?.name}</p>
  );
  const pTemplate2 = (rowData, { rowIndex }) => (
    <p dangerouslySetInnerHTML={{ __html: rowData?.content }}></p>
  );
  const p_booleanTemplate3 = (rowData, { rowIndex }) => (
    <p>{String(rowData.read)}</p>
  );
  const calendar_12Template4 = (rowData, { rowIndex }) => (
    <p>{new Date(rowData.sent).toLocaleDateString()}</p>
  );
  const editTemplate = (rowData, { rowIndex }) => (
    <Button
      onClick={() => onEditRow(rowData, rowIndex)}
      icon={`pi ${rowData.isEdit ? "pi-check" : "pi-pencil"}`}
      className={`p-button-rounded p-button-text ${rowData.isEdit ? "p-button-success" : "p-button-warning"}`}
    />
  );
  const deleteTemplate = (rowData, { rowIndex }) => (
    <Button
      onClick={() => onRowDelete(rowData._id)}
      icon="pi pi-times"
      className="p-button-rounded p-button-danger p-button-text"
    />
  );

  // Function to determine row class based on the read status
  const rowClass = (rowData) => {
    // Apply bold styling only for unread inbox messages
    if (view === "inbox" && rowData.read === false) {
      return "unread-row";
    }
    return "";
  };

  const pCreatedAt = (rowData, { rowIndex }) => (
    <p>{moment(rowData.createdAt).fromNow()}</p>
  );
  const pUpdatedAt = (rowData, { rowIndex }) => (
    <p>{moment(rowData.updatedAt).fromNow()}</p>
  );
  const pCreatedBy = (rowData, { rowIndex }) => (
    <p>{rowData.createdBy?.name}</p>
  );
  const pUpdatedBy = (rowData, { rowIndex }) => (
    <p>{rowData.updatedBy?.name}</p>
  );
  const paginatorLeft = (
    <Button
      type="button"
      icon="pi pi-upload"
      text
      onClick={() => setShowUpload(true)}
      disabled={!false}
    />
  );
  const paginatorRight = DownloadCSV({ data: items, fileName: "download" });

  return (
    <>
      <div className="mb-3" style={{ display: "flex", gap: "1rem" }}>
        {/* Toggle Buttons for Switching between Sent and Inbox */}
        <Button
          label="Inbox"
          className={
            view === "inbox"
              ? "p-button-primary p-button-selected"
              : "p-button-outlined"
          }
          onClick={() => setView("inbox")}
        />
        <Button
          label="Sent"
          className={
            view === "sent"
              ? "p-button-primary p-button-selected"
              : "p-button-outlined"
          }
          onClick={() => setView("sent")}
        />
      </div>

      <DataTable
        // value={items}
        value={filteredItems}
        ref={dt}
        removableSort
        onRowClick={onRowClick}
        scrollable
        rowHover
        rowClassName={rowClass} // Apply row class based on the read status
        stripedRows
        paginator
        rows={10}
        rowsPerPageOptions={[10, 50, 250, 500]}
        size={"small"}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} to {last} of {totalRecords}"
        paginatorLeft={paginatorLeft}
        paginatorRight={paginatorRight}
        // rowClassName="cursor-pointer"
        alwaysShowPaginator={!urlParams.singleUsersId}
        loading={loading}
      >
        <Column
          field="service"
          header="Service"
          body={serviceTemplate}
          filter={selectedFilterFields.includes("service")}
          hidden={selectedHideFields?.includes("service")}
          style={{ minWidth: "8rem" }}
        />
        {view === "inbox" && (
          <Column
            field="from"
            header="From"
            body={dropdownTemplate0}
            filter={selectedFilterFields.includes("from")}
            hidden={selectedHideFields?.includes("from")}
            style={{ minWidth: "8rem" }}
          />
        )}

        {view === "sent" && (
          <Column
            field="toUser"
            header="ToUser"
            body={dropdownTemplate1}
            filter={selectedFilterFields.includes("toUser")}
            hidden={selectedHideFields?.includes("toUser")}
            style={{ minWidth: "8rem" }}
          />
        )}

        <Column
          field="content"
          header="Content"
          body={pTemplate2}
          filter={selectedFilterFields.includes("content")}
          hidden={selectedHideFields?.includes("content")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        {/* <Column
          field="read"
          header="Read"
          body={p_booleanTemplate3}
          filter={selectedFilterFields.includes("read")}
          hidden={selectedHideFields?.includes("read")}
          style={{ minWidth: "8rem" }}
        /> */}
        <Column
          field="sent"
          header="Sent"
          body={calendar_12Template4}
          filter={selectedFilterFields.includes("sent")}
          hidden={selectedHideFields?.includes("sent")}
          sortable
          style={{ minWidth: "8rem" }}
        />
        {/* Conditionally render Edit column only for sent messages */}
        {view === "sent" && <Column header="Edit" body={editTemplate} />}

        <Column header="Delete" body={deleteTemplate} />
        {/*<Column field="createdAt" header="created" body={pCreatedAt} sortable style={{ minWidth: "8rem" }} />*/}
        {/*<Column field="updatedAt" header="updated" body={pUpdatedAt} sortable style={{ minWidth: "8rem" }} />*/}
        {/*<Column field="createdBy" header="createdBy" body={pCreatedBy} sortable style={{ minWidth: "8rem" }} />*/}
        {/*<Column field="updatedBy" header="updatedBy" body={pUpdatedBy} sortable style={{ minWidth: "8rem" }} />*/}
      </DataTable>
      <Dialog
        header="Upload Inbox Data"
        visible={showUpload}
        onHide={() => setShowUpload(false)}
      >
        <UploadService
          user={user}
          serviceName="inbox"
          onUploadComplete={() => {
            setShowUpload(false); // Close the dialog after upload
          }}
        />
      </Dialog>

      <Dialog
        header="Search Inbox"
        visible={searchDialog}
        onHide={() => setSearchDialog(false)}
      >
        Search
      </Dialog>
      <Dialog
        header="Filter Users"
        visible={showFilter}
        onHide={() => setShowFilter(false)}
      >
        <div className="card flex justify-content-center">
          <MultiSelect
            value={selectedFilterFields}
            onChange={(e) => setSelectedFilterFields(e.value)}
            options={fields}
            optionLabel="name"
            optionValue="value"
            filter
            placeholder="Select Fields"
            maxSelectedLabels={6}
            className="w-full md:w-20rem"
          />
        </div>
        <Button
          text
          label="save as pref"
          onClick={() => {
            console.log(selectedFilterFields);
            onClickSaveFilteredfields(selectedFilterFields);
            setSelectedFilterFields(selectedFilterFields);
            setShowFilter(false);
          }}
        ></Button>
      </Dialog>

      <Dialog
        header="Hide Columns"
        visible={showColumns}
        onHide={() => setShowColumns(false)}
      >
        <div className="card flex justify-content-center">
          <MultiSelect
            value={selectedHideFields}
            onChange={(e) => setSelectedHideFields(e.value)}
            options={fields}
            optionLabel="name"
            optionValue="value"
            filter
            placeholder="Select Fields"
            maxSelectedLabels={6}
            className="w-full md:w-20rem"
          />
        </div>
        <Button
          text
          label="save as pref"
          onClick={() => {
            console.log(selectedHideFields);
            onClickSaveHiddenfields(selectedHideFields);
            setSelectedHideFields(selectedHideFields);
            setShowColumns(false);
          }}
        ></Button>
      </Dialog>
    </>
  );
};

export default InboxDataTable;
