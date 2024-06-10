import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, message, Modal, Row, Select } from "antd";
import { AddLineItem } from "./AddLineItem";
import { useUpdateInvoice } from './hooks/updateInvoice';
import emailjs from 'emailjs-com';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
  clientData: any;
  quote: string; // Adjust the type of quote
}

export const SelectedInvoiceItem: React.FC<SelectedInvoiceItemProps> = ({
  form,
  selectedService,
  handleSelectedService,
  handleServiceTypeForm,
  setSelectedService,
  invoice,
  quote,  // Add quote as a prop
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
  setInvoices,
  clientData,
}) => {
  const { updateInvoice, isLoading, error } = useUpdateInvoice();
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const [hasTechnicianBeenPaid, setHasTechnicianBeenPaid] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>(''); // Default to empty string
  const [isModalOpen, setIsModalOpen] = useState(false);
  const methodPayment = ['Credit Card', 'Cash', 'Check']; // Payment methods

  const parsedQuote = quote ? JSON.parse(quote) : null;
  const [localQuote, setLocalQuote] = useState(parsedQuote);

  console.log(quote,"invoice")
  useEffect(() => {
    if (clientData) {
      setClientEmail(clientData.clientEmail);
    }
  }, [clientData]);

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);

  useEffect(() => {
    setLocalQuote(parsedQuote);
  }, [quote]);


  const formattedQuotePrice = localQuote ? new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(localQuote.unitPrice) : '0.00';

  useEffect(() => {
    const initialTechnicianPaid = invoice?.hasTechnicianBeenPaid || false;
    setHasTechnicianBeenPaid(initialTechnicianPaid);
    const initialPaymentMethod = invoice?.paymentMethod || '';
    setPaymentMethod(initialPaymentMethod);
  }, [invoice]);

  const updateInvoiceBackend = async (updatedInvoice: any) => {
    const updatedInvoices = invoices.map(inv => inv === localInvoice ? updatedInvoice : inv);
    const data = {
      data: {
        type: "node--appointment1",
        id: appointmentId,
        attributes: {
          field_invoices: JSON.stringify(updatedInvoices),
          field_quote: localQuote ? JSON.stringify(localQuote) : null,
        },
      },
    };

    await updateInvoice(data, form);
    setInvoices(updatedInvoices);
  };

  const handleServiceTypeFormWrapper = (values: any) => {
    let updatedInvoice = { ...localInvoice, ...values, paymentMethod, hasTechnicianBeenPaid };

    if (selectedService === "Quote") {
      const quote = {
        selectedService,
        unitPrice: values.unitPrice,
        jobDescription: values.jobDescription,
      };
      setLocalQuote(quote);
    }

    setLocalInvoice(updatedInvoice);
    updateInvoiceBackend(updatedInvoice);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
    handleServiceTypeFormWrapper({});
  };

  const handleTechnicianPaidChange = (e: any) => {
    setHasTechnicianBeenPaid(e.target.checked);
    handleServiceTypeFormWrapper({});
  };

  const generateInvoiceHTML = (invoice: any) => {
    const rows = invoice.invoice.map((item: any, index: number) => {
      if (!item) return ''; // Skip null or undefined items

      const isRefund = item.selectedService === "Refund";
      const formattedTotalPrice = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(item.totalPrice);

      const emailInvoiceQty = item.quantity ? item.quantity : '';

      return `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'}; ${isRefund ? 'color: #ff4d4f;' : ''}">
          <td style="padding: 8px; border: 1px solid #ddd;">${item.selectedService}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${emailInvoiceQty}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${isRefund ? '-' : ''}${formattedTotalPrice}</td>
        </tr>
      `;
    }).join('');

    const totalAmount = invoice?.invoice?.reduce((acc: number, item: any) => {
      if (!item) return acc; // Skip null or undefined items
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

    const formattedDateCreated = dayjs(invoice.dateCreated).tz("America/New_York").format("YYYY-MM-DD HH:mm");

    return `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px; border: 1px solid #ddd;">Services</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f0f0f0;">
            <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total</td>
            <td style="padding: 8px; border: 1px solid #ddd;"></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formattedTotalInvoicePrice}</td>
          </tr>
        </tfoot>
      </table>
      <p>Date Created: ${formattedDateCreated}</p>
      <p>Payment Method: ${paymentMethod}</p>
    `;
  };

  const handleSendEmail = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (clientEmail) {
      sendEmail(localInvoice, clientEmail);
      setIsModalOpen(false);
    } else {
      message.error("Client email is required.");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const sendEmail = (invoice: any, clientEmail: string) => {
    const serviceId = 'service_um8nz55';
    const templateId = 'template_9e4l7vm';
    const userId = 'HSc9gkfqvMFX_3nHR';

    const formattedMessage = generateInvoiceHTML(invoice);

    const templateParams = {
      to_name: 'Recipient Name',
      to_email: clientEmail,
      message: formattedMessage,
    };

    emailjs.send(serviceId, templateId, templateParams, userId)
      .then((response) => {
        message.success("Email sent successfully");
      }, (err) => {
        message.error("Failed to send email");
      });
  };

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
      message.error("Failed to delete line item");
    }
  };

  const handleDeleteQuote = async () => {
    try {
      const data = {
        data: {
          type: "node--appointment1",
          id: appointmentId,
          attributes: {
            field_quote: null,
          },
        },
      };

      await updateInvoice(data, form);

      setSelectedInvoice((prev:any) => ({ ...prev, quote: null }));
      setLocalQuote(null);
      message.success("Quote deleted successfully");
    } catch (error) {
      message.error("Failed to delete quote");
    }
  };

  const totalAmount = localInvoice?.invoice?.reduce((acc: number, item: any) => {
    if (!item) return acc; // Skip null or undefined items
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
          <Button onClick={addRefund}>Issue Refund</Button>

          <Button
            onClick={handleSendEmail}
            type="primary"
            style={{ marginBottom: "1rem", marginLeft: "1rem" }}
          >
            Send Invoice via Email
          </Button>
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
            {localQuote && (
                <div
                  style={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px",
                    backgroundColor: "#fff7e6",
                    borderBottom: "1px solid #e8e8e8",
                    fontWeight: "bold",
                    color: "#fa8c16"
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <strong>Quote</strong> <br /> {localQuote.jobDescription || "No description"}
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}></div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    ${formattedQuotePrice}
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <Button
                      type="link"
                      danger
                      onClick={handleDeleteQuote}
                    >
                      <DeleteOutlined />
                    </Button>
                  </div>
                </div>
              )}
              {localInvoice?.invoice?.map((lineItem: any, index: any) => {
                if (!lineItem) return null; // Skip null or undefined items
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
                          <strong>Part </strong>  <br /> {lineItem.inventory}
                          {lineItem.customPart && <span> ({lineItem.customPart})</span>}
                        </>
                      ) : (
                        <span><strong>{lineItem.selectedService}</strong> <br />  {lineItem.customPart}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>{lineItem.quantity}</div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                      {isRefund ? `-${formattedTotalPrice}` : (`$${formattedTotalPrice}`)}
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

            <Row gutter={[16, 16]} style={{ marginTop: "1rem" }}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  style={{ width: "100%" }}
                  label="Select Payment Method"
                  name="paymentMethod"
                >
                  <Select
                    value={localInvoice?.paymentMethod}
                    onChange={handlePaymentMethodChange}
                    placeholder={localInvoice?.paymentMethod}
                  >
                    {methodPayment.map((method: any, index: any) => (
                      <Select.Option key={index} value={method}>
                        {method}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="technicianPaid"
                  initialValue={localInvoice?.hasTechnicianBeenPaid}
                >
                  <Checkbox 
                  checked={localInvoice?.hasTechnicianBeenPaid}
                  onChange={handleTechnicianPaidChange}>
                    Has technician been paid?
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Modal
            title="Send Invoice via Email"
            visible={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Form layout="vertical">
              <Form.Item
                label="Client Email"
                required
              >
                <Input
                  value={clientEmail || ''}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default SelectedInvoiceItem;
