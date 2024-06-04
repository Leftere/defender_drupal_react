import React from 'react';
import { ArrowLeftOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, message } from "antd";
import { useEffect, useState } from "react";
import { AddLineItem } from "./AddLineItem";
import { useUpdateInvoice } from './hooks/updateInvoice';
import emailjs from 'emailjs-com';

// Add this function to send email
const sendEmail = (invoice: any) => {
  const serviceId = 'service_um8nz55';
  const templateId = 'template_s3n7zvq';
  const userId = 'HSc9gkfqvMFX_3nHR';

  const templateParams = {
    to_name: 'Recipient Name',
    message: JSON.stringify(invoice, null, 2), // Include the invoice data
  };

  emailjs.send(serviceId, templateId, templateParams, userId)
    .then((response) => {
      console.log('SUCCESS!', response.status, response.text);
      message.success("Email sent successfully");
    }, (err) => {
      console.log('FAILED...', err);
      message.error("Failed to send email");
    });
};

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
  invoices: any[];
  setInvoices: (invoices: any[]) => void;
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
  invoices,
  setInvoices
}) => {
  const { updateInvoice, isLoading, error } = useUpdateInvoice();
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const [hasTechnicianBeenPaid, setHasTechnicianBeenPaid] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const addService = () => {
    setNewSelectedService(true);
    setNewItemOpen(true);
  };

  const addRefund = () => {
    setRefundOpen(true);
    setNewItemOpen(true);
    setSelectedService("Refund");
  };

  const handleDeleteInvoice = async () => {
    try {
      const updatedInvoices = invoices.filter(inv => inv !== localInvoice);

      const data = {
        data: {
          type: "node--appointment1",
          id: appointmentId,
          attributes: {
            field_invoices: JSON.stringify(updatedInvoices),
          },
        },
      };

      await updateInvoice(data, form);

      setInvoices(updatedInvoices);
      setSelectedInvoice(null);
      message.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      message.error("Failed to delete invoice");
    }
  };

  const handleDeleteLineItem = async (invoiceIndex: number) => {
    try {
      const updatedInvoice = {
        ...localInvoice,
        invoice: localInvoice.invoice.filter((_: any, index: number) => index !== invoiceIndex),
      };

      let updatedInvoices;
      if (updatedInvoice.invoice.length === 0) {
        updatedInvoices = invoices.filter(inv => inv !== localInvoice);
        setSelectedInvoice(null);
      } else {
        updatedInvoices = invoices.map(inv => inv === localInvoice ? updatedInvoice : inv);
      }

      setInvoices(updatedInvoices);

      const data = {
        data: {
          type: "node--appointment1",
          id: appointmentId,
          attributes: {
            field_invoices: JSON.stringify(updatedInvoices),
          },
        },
      };

      await updateInvoice(data, form);

      if (updatedInvoice.invoice.length > 0) {
        setLocalInvoice(updatedInvoice);
      }

      message.success("Line item deleted successfully");
    } catch (error) {
      console.error("Error deleting line item:", error);
      message.error("Failed to delete line item");
    }
  };

  const totalAmount = localInvoice?.invoice?.reduce((acc: number, item: any) => {
    if (item.selectedService === "Refund") {
      return acc - item.totalPrice;
    } else {
      return acc + item.totalPrice;
    }
  }, 0) || 0;

  const formattedTotalInvoicePrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalAmount);

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);

  return (
    <div>
      {newSelectedService || refundOpen ? (
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
            setRefundOpen(false);
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
            <Button type="link" onClick={handleDeleteInvoice}><DeleteOutlined />Delete</Button>
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
              {localInvoice?.invoice?.map((lineItem: any, index: any) => {
                const isRefund = lineItem.selectedService === "Refund";
                const formattedTotalPrice = new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(lineItem.totalPrice);
                return (
                  <div
                    key={index}
                    style={{
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      backgroundColor: isRefund ? "#ffe6e6" : (index % 2 === 0 ? "#ffffff" : "#f9f9f9"),
                      borderBottom: "1px solid #e8e8e8",
                      color: isRefund ? "#ff4d4f" : "inherit"
                    }}
                  >
                    <div style={{ flex: 2 }}>
                      {lineItem.inventory ? (
                        <>
                          <strong>Part </strong>{lineItem.inventory}
                          {lineItem.customPart && <span> ({lineItem.customPart})</span>}
                        </>
                      ) : (
                        <span>{lineItem.selectedService} <br />  {lineItem.customPart}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>{lineItem.quantity}</div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      {isRefund ? `-${formattedTotalPrice}` : formattedTotalPrice}
                    </div>
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
                )
              })}
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
              <div style={{ flex: 3, textAlign: "right", fontWeight: "bold" }}>${formattedTotalInvoicePrice}</div>
              <div style={{ flex: 1 }}></div>
            </div>
            <Form.Item name="technicianPaid" valuePropName="checked" initialValue={false}>
              Has technician been paid?
              <Checkbox
                style={{ marginLeft: ".5rem", marginTop: "1rem" }}
                onChange={(e) => setHasTechnicianBeenPaid(e.target.checked)}
              />
            </Form.Item>

            <Button
              onClick={addRefund}
            >
              Issue Refund
            </Button>

            {/* Add this button to send the invoice via email */}
            <Button
              onClick={() => sendEmail(localInvoice)}
              type="primary"
              style={{ marginTop: "1rem", marginLeft:"1rem" }}
            >
              Send Invoice via Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
