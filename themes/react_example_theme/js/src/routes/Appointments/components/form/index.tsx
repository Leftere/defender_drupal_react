import React, { useCallback, useEffect, useState } from "react";

import { useSelect } from "@refinedev/antd";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { appliances } from "./appliances";
import { useFetchTechnicians } from "../hooks/useFetchTechnicians"; // Adjust the import path as necessary
import { useFetchClients } from "../hooks/useFetchClients";
import { AddTechnician } from './AddTechnician'
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin

dayjs.extend(utc);
dayjs.extend(timezone);


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
  zipCode: string
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
  const [isTechnicianModalOpen, setTechnicianModal] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [techZipCode, setTechZipCode] = useState(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const { clients, refetch } = useFetchClients();

  const rangeDate = form.getFieldsValue().rangeDate;
  const date = form.getFieldsValue().date;
  const time = form.getFieldsValue().time;

  const showModal = () => setIsModalOpen(true);
  const closeModal = async () => {
    setIsModalOpen(false);
    refetch();
  };

  const closeTechModal = () => {
    setTechnicianModal(false)
  }

  const openTechnicianModal = () => {
    setTechnicianModal(true)
  }

  return (
    <Form layout="vertical" form={form} {...formProps} style={{ display: "block" }} >
      <Row>
        <Col >
          <Form.Item
            label="Date & Time"
            rules={[
              {
                required: true,
              },
            ]}

          >
            <div>
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
                    format="YYYY/MM/DD"
                    onChange={(dates, dateStrings) => {
                      if (dates && dates[0] && dates[1] && isAllDayEvent) { // Check if both date values are not null
                        setDateRange([dates[0], dates[1]]); // Update the state with valid Dayjs objects
                  
                      } else {
                        setDateRange(null); // Clear the date range if any date is null
                      
                      }
                    }}
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
                      format={"YYYY/MM/DD"}
                      value={dayjs(rangeDate ? rangeDate[0] : undefined)}
                      onChange={(date, dateString) => {
                        setSelectedDate(date); // Update the date state
                      }}
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
                      format="hh:mm a"
                      minuteStep={15}
                      allowClear={true}
                      onChange={(times, timeStrings) => {
                        if (times && times[0] && times[1]) { // Ensure both time objects are not null
                          setSelectedTimeRange([times[0], times[1]]);
                        } else {
                          setSelectedTimeRange(null); // Handle clearing of the picker
                        }
                      }}
                    />
                  </Form.Item>
                </div>
              )}
            </div>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[23, 0]}>
        <Col span={12} xs={24} lg={12}>
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
        <Col xs={24} lg={6}>
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
                console.log(clientDetails.zipCode)
                setTechZipCode(clientDetails.zipCode)

                const clientObj = {
                  id: clientDetails.id,
                  uuid: clientDetails.uuid,
                  firstName: clientDetails.firstName,
                  lastName: clientDetails.lastName,
                  address: clientDetails.address,
                  primaryPhone: clientDetails.primaryPhone,
                };
                form.setFieldsValue({ client: clientObj });

                // setSelectedClientAddress(clientDetails.address);
              }}
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
                    zipCode: client.zipCode
                  })}
                  label={`${client.firstName} ${client.lastName}`}
                >
                  {`${client.firstName} ${client.lastName}`}
                </Select.Option>
              ))}

            </Select>
          </Form.Item>

          <CreateClient key={isModalOpen ? "isTechnicianModalOpen" : "closed"} isOpen={isModalOpen} onClose={closeModal} />

        </Col>
        <Col lg={6} xs={24}
          style={{ display: "flex", alignItems: "center", marginTop: ".25rem" }}
        >
          <Button
            type="default"
            onClick={showModal}
            style={{ marginRight: "1rem" }}
          >
            Add Client
          </Button>
          {techZipCode == null ? null : (
            <>
              <Button type="default" onClick={openTechnicianModal}>Add Technician</Button>
              <AddTechnician
                isTechnicianModalOpen={isTechnicianModalOpen}
                closeTechModal={closeTechModal}
                techZipCode={techZipCode}
                isAllDayEvent={isAllDayEvent}
                selectedTimeRange={selectedTimeRange}
                selectedDate={selectedDate}
                dateRange={dateRange}
              /></>
          )}
        </Col>
      </Row>

      <Row style={{ marginBottom: "1rem" }}>
        <Col span={6} xs={24}>
        </Col>
      </Row>
    </Form>
  );
};
