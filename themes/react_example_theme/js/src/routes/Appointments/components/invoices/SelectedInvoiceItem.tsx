import { ArrowLeftOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { AddLineItem } from "./AddLineItem";
import { useUpdateInvoice } from './hooks/updateInvoice';

interface SelectedInvoiceItemProps {
  invoice: any;
  appliance: string[];
  onBack: () => void;
  form: any;
  selectedService: string;
  serviceButtons: string[];
  handleSelectedService: (service: string) => void;
  handleServiceTypeForm: (values: any) => void;
  setNewItemOpen: (open: boolean) => void;
  setSelectedService: (service: string) => void;
  handleBackToInvoices: () => void;
  appointmentId: any;
  fetchInvoice: () => void;
  setNewSelectedService: (open: boolean) => void;
  setSelectedInvoice: any;
  newSelectedService: boolean;
  invoices: any[]; // Add invoices state
  setInvoices: (invoices: any[]) => void; // Add setInvoices state updater
}

export const SelectedInvoiceItem: React.FC<SelectedInvoiceItemProps> = ({
  form,
  selectedService,
  handleSelectedService,
  handleServiceTypeForm,
  setSelectedService,
  invoice,
  appliance,
  onBack,
  setNewItemOpen,
  appointmentId,
  handleBackToInvoices,
  setSelectedInvoice,
  serviceButtons,
  fetchInvoice,
  setNewSelectedService,
  newSelectedService,
  invoices, // Receive invoices state
  setInvoices // Receive setInvoices state updater
}) => {

  const { updateInvoice, isLoading, error } = useUpdateInvoice();
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const addService = () => {
    setNewSelectedService(true);
    setNewItemOpen(true);
  };


  const handleDeleteLineItem = async (invoiceIndex: number) => {
    console.log("Hello world")
  };

  const totalAmount = localInvoice?.invoice?.reduce((acc: number, item: any) => acc + item.totalPrice, 0) || 0;

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);
  console.log(localInvoice)
  return (
    <div>
      {newSelectedService ? (
        <AddLineItem
          form={form}
          selectedService={selectedService}
          serviceButtons={serviceButtons}
          handleSelectedService={handleSelectedService}
          handleServiceTypeForm={handleServiceTypeForm}
          setNewItemOpen={setNewItemOpen}
          setSelectedService={setSelectedService}
          handleBackToInvoices={() => {
            setNewSelectedService(false);
            handleBackToInvoices();
          }}
        />
      ) : (
        <div>
          <Button type="link" onClick={() => { onBack(); handleBackToInvoices(); }} style={{ padding: '0', marginBottom: '1rem' }}>
            <ArrowLeftOutlined /> Back to Invoices
          </Button>
          <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "1rem" }}>
            <span>Invoice #16 <span>unpaid</span></span>
            <Button type="link"><DeleteOutlined />Delete</Button>
          </div>
          <div>
            <Button
              type="link"
              onClick={addService}
              style={{ padding: "0", marginBottom: "1rem" }}
            >
              <PlusCircleOutlined /> Add line item
            </Button>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                borderBottom: "2px solid #d9d9d9",
                fontWeight: "bold"
              }}
            >
              <div style={{ flex: 2 }}>Services</div>
              <div style={{ flex: 1, textAlign: "center" }}>Qty</div>
              <div style={{ flex: 1, textAlign: "right" }}>Amount</div>
              <div style={{ flex: 1 }}></div>
            </div>
            <div>
              {localInvoice?.invoice?.map((lineItem: any, index: any) => (
                <div
                  key={index}
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                    borderBottom: "1px solid #e8e8e8"
                  }}
                >
                  <div style={{ flex: 2 }}>
                    {lineItem.inventory ? (
                      <><strong>Part </strong>{lineItem.inventory}</>
                    ) : (
                      lineItem.selectedService
                    )}
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>{lineItem.quantity}</div>
                  <div style={{ flex: 1, textAlign: "right" }}>${lineItem.totalPrice}</div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <Button
                      type="link"
                      danger
                      onClick={() => handleDeleteLineItem(index)}
                    >
                      <DeleteOutlined />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                borderTop: "2px solid #d9d9d9",
                fontWeight: "bold"
              }}
            >

              <div style={{ flex: 1, textAlign: "left", fontWeight: "bold" }}>Total</div>
              <div style={{ flex: 3, textAlign: "right", fontWeight: "bold" }}>${totalAmount.toFixed(2)}</div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
