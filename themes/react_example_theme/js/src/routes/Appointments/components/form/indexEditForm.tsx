import React, { useEffect, useState } from "react";

import { useSelect } from "@refinedev/antd";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { appliances } from "./appliances";
import { useFetchTechnicians } from "../hooks/useFetchTechnicians"; // Adjust the import path as necessary
import { useFetchClients } from "../hooks/useFetchClients";

import {
  Checkbox,
  Col,
  ColorPicker,
  DatePicker,
  Form,
  FormInstance,
  FormProps,
  Input,
  AutoComplete,
  Row,
  Select,
  TimePicker,
  Button,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

type CalendarFormProps = {
  isAllDayEvent: boolean;
  setIsAllDayEvent: (value: boolean) => void;
  formProps: FormProps;
  form: FormInstance;
};

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
}

interface Option {
  value: string; // Assuming the value is a string that will be used in AutoComplete
  label: string;
}

interface Client {
  id: string,
 
  firstName: string,
  lastName: string,
  address: string,
  primaryPhone: string,
}

const { RangePicker } = DatePicker;
const AutoCompleteOption = AutoComplete.Option;

export const EditForm: React.FC<CalendarFormProps> = ({
  form,
  formProps,
  isAllDayEvent = false,
  setIsAllDayEvent,
}) => {
  const technicians = useFetchTechnicians();
  const { clients, refetch } = useFetchClients();
  const [options, setOptions] = useState<Option[]>([]);
  const [showUpdateAddress, setShowUpdateAddress] = useState(false);
  const navigate = useNavigate();
  const [selectedClientAddress, setSelectedClientAddress] = useState("");
  useEffect(() => {
    setOptions(
      technicians.map((tech: Technician) => ({
        // Concatenate the technician's first name and last name into a single string for the value
        value: `${tech.firstName} ${tech.lastName}`,
        label: `${tech.firstName} ${tech.lastName}`,
      }))
    );
  }, [technicians]);

  const serviceType = [
    "Service Call",
    "Repairs with no parts",
    "Repairs with parts from Inventory",
    "Reparis with custom Parts",
    "Call-Back",
  ];

  const rangeDate = form.getFieldsValue().rangeDate;
  const date = form.getFieldsValue().date;

  return (
    <Form layout="vertical" form={form} {...formProps}>
      <Row gutter={16}>
        <Col>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Color"
            name="color"
            rules={[
              {
                required: true,
              },
            ]}
            initialValue={"#1677FF"}
          >
            <ColorPicker
              defaultValue="#1677FF"
              panelRender={(_, { components: { Presets } }) => <Presets />}
              presets={[
                {
                  label: "Recommended",
                  colors: [
                    "#F5222D",
                    "#FA8C16",
                    "#8BBB11",
                    "#52C41A",
                    "#13A8A8",
                    "#1677FF",
                    "#2F54EB",
                    "#722ED1",
                    "#EB2F96",
                  ],
                },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Form.Item
            label="Appliance"
            name="appliance"
            rules={[{ required: true, message: "Please select an appliance!" }]}
          >
            <Select placeholder="Select an appliance" mode="multiple">
              {appliances.map((title, index) => (
                <Select.Option key={index} value={title}>
                  {title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[32, 23]}>
        <Col span={12}>
          <Form.Item
            label="Add client"
            name="client"
            rules={[{ required: true, message: "Please select a client" }]}
          >
            <Select
              showSearch
              placeholder="Select a client"
              optionFilterProp="children"
              labelInValue // Enable labelInValue
              onChange={(value, option) => {
                const clientDetails = JSON.parse(value.value); // Parse the selected option's value which is a stringified JSON
                // Construct the new client object with the desired structure

                const clientObj = {
                  id: clientDetails.id,
                  firstName: clientDetails.firstName,
                  lastName: clientDetails.lastName,
                  address: clientDetails.address,
                  primaryPhone: clientDetails.primaryPhone,
                };
       
                form.setFieldsValue({ client: clientObj });
                setSelectedClientAddress(clientDetails.address);
              }}
              // filterOption={(input, option) =>
              //   option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              // }
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Button
                    type="link"
                    style={{ display: "block", margin: "10px" }}
                    onClick={() => {
                      // Your logic to add a new client, like opening a modal
        
                      navigate("/clients/create");
                    }}
                  >
                    Add Client
                  </Button>
                </>
              )}
            >
              {clients.map((client: Client) => (
                <Select.Option
                  key={client.id}
                  value={JSON.stringify({
                    id: client.id,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    address: client.address,
                    primaryPhone: client.primaryPhone,
                  })}
                  label={`${client.firstName} ${client.lastName}`}
                >
                  {`${client.firstName} ${client.lastName}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

      </Row>
      <Form.Item
        label="Date & Time"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, width: 80 }}>
            <Checkbox
              checked={isAllDayEvent}
              onChange={(e) => setIsAllDayEvent(e.target.checked)}
            >
              All Day
            </Checkbox>
          </div>

          {isAllDayEvent ? (
            <Form.Item
              name="rangeDate"
              rules={[
                {
                  required: true,
                },
              ]}
              noStyle
            >
              <RangePicker
                style={{
                  width: 416,
                }}
                format={"YYYY/MM/DD"}
                defaultValue={[dayjs(date), dayjs(date)]}
              />
            </Form.Item>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.5rem",
              }}
            >
              <Form.Item
                name="date"
                rules={[
                  {
                    required: true,
                  },
                ]}
                noStyle
              >
                <DatePicker
                  style={{
                    width: "160px",
                  }}
                  format={"YYYY/MM/DD"}
                  defaultValue={dayjs(rangeDate ? rangeDate[0] : undefined)}
                />
              </Form.Item>
              <Form.Item
                name="time"
                rules={[
                  {
                    required: true,
                  },
                ]}
                noStyle
              >
                <TimePicker.RangePicker
                  style={{
                    width: 240,
                  }}
                  format={"hh:mm a"}
                  minuteStep={15}
                />
              </Form.Item>
            </div>
          )}
        </div>
      </Form.Item>

      {/* <Row gutter={[32, 32]}>
        <Col span={12}>
          <Form.Item
            label="Kind"
            name="kind"
            rules={[
              { required: true, message: 'Please select a service type' },
            ]}
          >
            <Select placeholder="Select a service type">
              {serviceType.map((type, index) => (
                <Select.Option key={index} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row> */}
      <Row gutter={[32, 23]}>
        <Col span={12}>
          <Form.Item
            label="Technician"
            name="technician"
            rules={[{ required: true, message: "Please select a technician" }]}
          >
            <Select
              showSearch
              placeholder="Select a technician"
              optionFilterProp="children"
              mode="multiple"
              labelInValue // Enable labelInValue
              onChange={(value, option) => {
                const technicianDetails = JSON.parse(value.value); // Parse the selected option's value which is a stringified JSON

                // Construct the new technician object with the desired structure
                const techniciansObjArray = value.map((techValue: { value: string; }) =>
                  JSON.parse(techValue.value)
                );
                form.setFieldsValue({ technician: techniciansObjArray });
              }}
              // filterOption={(input, option) =>
              //   option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              // }
            >
              {technicians.map((tech: Technician) => (
                <Select.Option
                  key={tech.id}
                  value={JSON.stringify({
                    id: tech.id,
                    firstName: tech.firstName,
                    lastName: tech.lastName,
                  })}
                  label={`${tech.firstName} ${tech.lastName}`}
                >
                  {`${tech.firstName} ${tech.lastName}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Description" name="description">
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
};
