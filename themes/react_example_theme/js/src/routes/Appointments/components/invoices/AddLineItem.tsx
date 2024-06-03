import React from 'react';
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { Labor } from './ServiceType/Labor';
import { Part } from './ServiceType/Part';
import { Deposit } from './ServiceType/Deposit';
import { PartsInstallation } from './ServiceType/PartsInstallation'
import { ServiceCall } from './ServiceType/ServiceCall';
import { CallBack } from './ServiceType/CallBack';

interface AddLineItemProps {
  form: any;
  selectedService: string;
  serviceButtons: string[];
  handleSelectedService: (service: string) => void;
  handleServiceTypeForm: (values: any) => void;
  setNewItemOpen: (open: boolean) => void;
  setSelectedService: (service: string) => void;
  handleBackToInvoices: any;
}

export const AddLineItem: React.FC<AddLineItemProps> = ({
  form,
  selectedService,
  serviceButtons,
  handleSelectedService,
  handleServiceTypeForm,
  setNewItemOpen,
  setSelectedService,
  handleBackToInvoices
}) => {
  const renderSelectedService = () => {
    switch (selectedService) {
      case "":
        return (
          <div>
            <strong>Select Service Type</strong>
            <div style={{ display: "flex", flexDirection: "column", width: "100%", margin: "1rem 0" }}>
              {serviceButtons.map((item, index) => (
                <Button
                  onClick={() => handleSelectedService(item)}
                  key={index}
                  block
                  style={{ textAlign: "start", marginBottom: ".5rem" }}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        );
      case "Labor":
        return (
          <Labor
            handleBackToInvoices={handleBackToInvoices}
            setSelectedService={setSelectedService}
            setNewItemOpen={setNewItemOpen}
            selectedService={selectedService}
            form={form}
            handleServiceTypeForm={handleServiceTypeForm}
          />
        );
      case "Part":
        return (
          <Part
            handleBackToInvoices={handleBackToInvoices}
            setSelectedService={setSelectedService}
            setNewItemOpen={setNewItemOpen}
            selectedService={selectedService}
            form={form}
            handleServiceTypeForm={handleServiceTypeForm}
          />
        );
      case "Deposit":
        return (
          <Deposit
            handleBackToInvoices={handleBackToInvoices}
            setSelectedService={setSelectedService}
            setNewItemOpen={setNewItemOpen}
            selectedService={selectedService}
            form={form}
            handleServiceTypeForm={handleServiceTypeForm}
          />
        );
      case "Service Call":
        return (
          <ServiceCall
            handleBackToInvoices={handleBackToInvoices}
            setSelectedService={setSelectedService}
            setNewItemOpen={setNewItemOpen}
            selectedService={selectedService}
            form={form}
            handleServiceTypeForm={handleServiceTypeForm}
          />
        );
      case "Parts Installation":
        return (
          <PartsInstallation
            handleBackToInvoices={handleBackToInvoices}
            setSelectedService={setSelectedService}
            setNewItemOpen={setNewItemOpen}
            selectedService={selectedService}
            form={form}
            handleServiceTypeForm={handleServiceTypeForm}
          />
        );
      case "Call Back":
        return (
          <CallBack
            handleBackToInvoices={handleBackToInvoices}
            setSelectedService={setSelectedService}
            setNewItemOpen={setNewItemOpen}
            selectedService={selectedService}
            form={form}
            handleServiceTypeForm={handleServiceTypeForm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "1rem" }}>
        <Button onClick={() => {
          setNewItemOpen(false);
          setSelectedService("");
          handleBackToInvoices();
        }} type="link" style={{ padding: "0" }}>
          <ArrowLeftOutlined /> Invoice
        </Button>
        <span style={{ width: "100%", textAlign: "center" }}>New invoice line</span>
      </div>
      {renderSelectedService()}
    </div>
  );
};
