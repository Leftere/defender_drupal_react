import React, { useCallback, useEffect, useState } from "react";

import { useSelect } from "@refinedev/antd";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { appliances } from "./appliances";
import { useFetchTechnicians } from "../hooks/useFetchTechnicians"; // Adjust the import path as necessary
import { useFetchClients } from "../hooks/useFetchClients";
import './index.css'
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
import { CreateClient } from "./createClient";

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


interface Client {
  id: string,
  uuid: string,
  firstName: string,
  lastName: string,
  address: string,
  primaryPhone: string,
}

const { RangePicker } = DatePicker;
const AutoCompleteOption = AutoComplete.Option;

export const CalendarForm: React.FC<CalendarFormProps> = ({
  form,
  formProps,
  isAllDayEvent = false,
  setIsAllDayEvent,
}) => {
  const technicians = useFetchTechnicians();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { clients, refetch } = useFetchClients();
  const showModal = () => setIsModalOpen(true);
  const closeModal = useCallback( () => {
    setIsModalOpen(false);
    refetch();
    console.log("I am refetched")
  },[refetch])

  useEffect(() => {
    refetch();
  },[closeModal])
  const rangeDate = form.getFieldsValue().rangeDate;
  const date = form.getFieldsValue().date;

  return (
    <Form layout="vertical" form={form} {...formProps}>
      <Row>
        <Col span={12}>
          <Form.Item
            label="Appliance"
            name="appliance"
            rules={[{ required: true, message: "Please select an appliance!" }]}
          >
            <Select placeholder="Select an appliance" mode="multiple">
              {appliances.map((title, index) => (
                <Select.Option key={index} value={title} >
                  <span className="title">{title.replace(/_/g, ' ')}</span>
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
                  uuid:clientDetails.uuid,
                  firstName: clientDetails.firstName,
                  lastName: clientDetails.lastName,
                  address: clientDetails.address,
                  primaryPhone: clientDetails.primaryPhone,
                };
                console.log(clientObj)
                form.setFieldsValue({ client: clientObj });
                // setSelectedClientAddress(clientDetails.address);
              }}

              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Button
                    type="link"
                    style={{ display: "block", margin: "10px" }}
                    onClick={showModal}
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
                    uuid: client.uuid,
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

          <CreateClient key={isModalOpen ? "open" : "closed"} isOpen={isModalOpen} onClose={closeModal} />
        </Col>

      </Row>
      <Row>
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
      </Row>

      <Row gutter={[32, 23]}>
        <Col span={12}>
          {/* <Form.Item
            label="Technician"
            name="technician"
            rules={[{ required: true, message: "Please select a technician" }]}
          >
            <Select
              showSearch
              placeholder="Select a technician"
              optionFilterProp="children"
              mode="multiple"
              labelInValue={true}
              onChange={(value: { value: string }[], option) => {
                const techniciansObjArray: Technician[] = value.map((techValue: { value: string }) => {
                  return JSON.parse(techValue.value);
                });

                console.log(techniciansObjArray);

                // Assuming `form.setFieldsValue` is properly defined
                form.setFieldsValue({ technician: techniciansObjArray });
              }}
            >
              {technicians.map((tech: Technician) => (
                <Select.Option
                  key={tech.id}
                  value={`${tech.firstName} ${tech.lastName}`} // Use technician id as the value
                  label={`${tech.firstName} ${tech.lastName}`}
                >
                  {`${tech.firstName} ${tech.lastName}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item> */}
        </Col>
      </Row>

      <Form.Item label="Description" name="description">
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
};
