import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Editor } from "primereact/editor";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";

const getSchemaValidationErrorsStrings = (errorObj) => {
  let errMsg = {};
  for (const key in errorObj.errors) {
    if (Object.hasOwnProperty.call(errorObj.errors, key)) {
      const element = errorObj.errors[key];
      if (element?.message) {
        errMsg[key] = element.message;
      }
    }
  }
  return errMsg.length
    ? errMsg
    : errorObj.message
      ? { error: errorObj.message }
      : {};
};

const InboxCreateDialogComponent = (props) => {
  const [_entity, set_entity] = useState({});
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const urlParams = useParams();
  const [from, setFrom] = useState([]);
  const [toUser, setToUser] = useState([]);

  useEffect(() => {
    console.log("props.serviceInbox ", props.serviceInbox);
    let init = {
      read: false,
      sent: new Date(),
      service: props.serviceInbox || "common",
      from: props.user._id,
    };
    if (!_.isEmpty(props?.entity)) {
      init = initilization(
        { ...props?.entity, ...init },
        [from, toUser],
        setError,
      );
    }
    set_entity({ ...init });
  }, [props.show]);

  console.log("enitity print: ", props.entity);

  const validate = () => {
    let ret = true;
    const error = {};

    if (_.isEmpty(_entity?.content)) {
      error["content"] = `Content field is required`;
      ret = false;
    }
    if (!ret) setError(error);
    return ret;
  };

  const onSave = async () => {
    if (!validate()) return;
    let _data = {
      from: props.user?._id,
      toUser: _entity?.toUser?._id,
      content: _entity?.content,
      read: _entity?.read || false,
      sent: _entity?.sent,
      createdBy: props.user._id,
      updatedBy: props.user._id,
      service: _entity?.service,
    };

    setLoading(true);

    try {
      const result = await client.service("inbox").create(_data);
      const eagerResult = await client.service("inbox").find({
        query: {
          $limit: 10000,
          _id: { $in: [result._id] },
          $populate: [
            {
              path: "from",
              service: "users",
              select: ["name"],
            },
          ],
        },
      });
      props.onHide();
      props.alert({
        type: "success",
        title: "Create info",
        message: "Info Inbox updated successfully",
      });
      props.onCreateResult(eagerResult.data[0]);
    } catch (error) {
      console.log("error", error);
      setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
      props.alert({
        type: "error",
        title: "Create",
        message: "Failed to create in Inbox",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // on mount users
    client
      .service("users")
      .find({
        query: {
          $limit: 10000,
          $sort: { createdAt: -1 },
          _id: urlParams.singleUsersId,
        },
      })
      .then((res) => {
        const currentUser = res.data.find(
          (user) => user._id === props.user._id,
        );

        if (currentUser) {
          setFrom([{ name: currentUser.name, value: currentUser._id }]);
        }

        setToUser(
          res.data.map((e) => ({
            name: e.name,
            value: e._id,
          })),
        );
      })
      .catch((error) => {
        console.log({ error });
        props.alert({
          title: "Users",
          type: "error",
          message: error.message || "Failed get users",
        });
      });
  }, []);

  const renderFooter = () => (
    <div className="flex justify-content-end">
      <Button
        label="save"
        className="p-button-text no-focus-effect"
        onClick={onSave}
        loading={loading}
      />
      <Button
        label="close"
        className="p-button-text no-focus-effect p-button-secondary"
        onClick={props.onHide}
      />
    </div>
  );

  const setValByKey = (key, val) => {
    let new_entity = { ..._entity, [key]: val };
    set_entity(new_entity);
    setError({});
  };

  const fromOptions = from.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));
  const toUserOptions = toUser.map((elem) => ({
    name: elem.name,
    value: elem.value,
  }));

  return (
    <Dialog
      header="Create Inbox"
      visible={props.show}
      closable={false}
      onHide={props.onHide}
      modal
      style={{ width: "40vw" }}
      className="min-w-max"
      footer={renderFooter()}
      resizable={false}
    >
      <div
        className="grid p-fluid overflow-y-auto"
        style={{ maxWidth: "55vw" }}
        role="inbox-create-dialog-component"
      >
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="from">From:</label>
            <InputText id="from" value={props.user?.name} readOnly />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["from"]) ? (
              <p className="m-0" key="error-from">
                {error["from"]}
              </p>
            ) : null}
          </small>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="toUser">ToUser:</label>
            <Dropdown
              id="toUser"
              value={_entity?.toUser?._id}
              optionLabel="name"
              optionValue="value"
              options={toUserOptions}
              onChange={(e) => setValByKey("toUser", { _id: e.value })}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["toUser"]) ? (
              <p className="m-0" key="error-toUser">
                {error["toUser"]}
              </p>
            ) : null}
          </small>
        </div>

        <div className="col-12 field mt-5">
          <span className="align-items-center">
            <label htmlFor="stuName">Content:</label>
            <Editor
              id="content"
              style={{ height: "320px" }}
              value={_entity?.content}
              onTextChange={(e) => setValByKey("content", e.htmlValue)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["content"]) ? (
              <p className="m-0" key="error-stuName">
                {error["content"]}
              </p>
            ) : null}
          </small>
        </div>

        <small className="p-error">
          {Array.isArray(Object.keys(error))
            ? Object.keys(error).map((e, i) => (
                <p className="m-0" key={i}>
                  {e}: {error[e]}
                </p>
              ))
            : error}
        </small>
      </div>
    </Dialog>
  );
};

const mapState = (state) => {
  const { user } = state.auth;
  return { user };
};
const mapDispatch = (dispatch) => ({
  alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(InboxCreateDialogComponent);
