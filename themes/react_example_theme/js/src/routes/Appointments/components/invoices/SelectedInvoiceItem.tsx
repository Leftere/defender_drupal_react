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
  invoicesHistory: any;
}

interface CurrentRole {
  role: string;
  uuid: string;
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
  setInvoices,
  clientData,
  invoicesHistory,
}) => {
  const { updateInvoice, isLoading, error } = useUpdateInvoice();
  const [localInvoice, setLocalInvoice] = useState(invoice);
  const [hasTechnicianBeenPaid, setHasTechnicianBeenPaid] = useState(invoice?.hasTechnicianBeenPaid || false);
  const [refundOpen, setRefundOpen] = useState(false);

  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>(''); // Default to empty string
  const [isModalOpen, setIsModalOpen] = useState(false);
  const methodPayment = ['Credit Card', 'Cash', 'Check']; // Payment methods
  const [currentRole, setCurrentRole] = useState<CurrentRole | undefined>(undefined);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/current-user');

      if (response.ok) {
        const json = await response.json(); // This should have 'await' since response.json() returns a promise
        const user = json.map((user: any) => ({
          name: `${user.field_first_name[0].value} ${user.field_last_name[0]?.value ? user.field_last_name[0].value : "" }`,
          image: user.user_picture[0]?.url ? user.user_picture[0].url : null,
          uuid: user.uuid[0].value,
          role: user.roles[0].target_id
        }));

        if (user[0].role) {
          setCurrentRole(user[0])
        }

      } else {
        console.error('HTTP error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', message.error);
    }
  }
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (clientData) {
      setClientEmail(clientData.clientEmail);
    }
  }, [clientData]);

  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);

  useEffect(() => {
    const initialTechnicianPaid = invoice?.hasTechnicianBeenPaid || false;
    setHasTechnicianBeenPaid(initialTechnicianPaid);
    const initialPaymentMethod = invoice?.paymentMethod || '';
    setPaymentMethod(initialPaymentMethod);
    form.setFieldsValue({ paymentMethod: initialPaymentMethod });
  }, [invoice, form]);

  const updateInvoiceBackend = async (updatedInvoice: any) => {
    const updatedInvoices = invoices.map(inv => inv === localInvoice ? updatedInvoice : inv);
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
    setLocalInvoice(updatedInvoice); // Ensure localInvoice is updated
    setSelectedInvoice(updatedInvoice); // Update selectedInvoice
  };

  const handleServiceTypeFormWrapper = (values: any) => {
    let updatedInvoice = { ...localInvoice, ...values, paymentMethod: values.paymentMethod, hasTechnicianBeenPaid: values.hasTechnicianBeenPaid ?? hasTechnicianBeenPaid };

    setLocalInvoice(updatedInvoice);
    updateInvoiceBackend(updatedInvoice);
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);

    handleServiceTypeFormWrapper({ paymentMethod: value });
  };

  const handleTechnicianPaidChange = (e: any) => {
    const newHasTechnicianBeenPaid = e.target.checked;
    setHasTechnicianBeenPaid(newHasTechnicianBeenPaid);
    handleServiceTypeFormWrapper({ hasTechnicianBeenPaid: newHasTechnicianBeenPaid, paymentMethod: paymentMethod });
  };

  const generateInvoiceHTML = (invoice: any) => {
    const rows = invoice.invoice.map((item: any, index: number) => {
      if (!item) return ''; // Skip null or undefined items

      const isRefund = item.selectedService === "Refund";
      const totalQuoteAmount = item.selectedService === "Quote"
        ? item.quoteData.reduce((sum: number, quoteItem: any) => sum + quoteItem.unitPrice, 0)
        : item.totalPrice;
      const formattedTotalPrice = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(totalQuoteAmount);

      const emailInvoiceQty = item.quantity ? item.quantity : '';

      return `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9f9f9'}; ${isRefund ? 'color: #ff4d4f;' : ''}">
          <td style="padding: 8px; border: 1px solid #ddd;">
            ${item.selectedService}
            ${item.selectedService === "Quote" ? `
              <ul style="padding-left: 20px; margin: 0;">
                ${item.quoteData.map((quote: any) => `
                  <li>${quote.field} ${quote.partName ? quote.partName : ''} $${quote.unitPrice}</li>
                `).join('')}
              </ul>
            ` : ''}
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${emailInvoiceQty}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${isRefund ? '-' : ''}${formattedTotalPrice}</td>
        </tr>
      `;
    }).join('');

    const totalAmount = invoice?.invoice?.reduce((acc: number, item: any) => {
      if (!item) return acc; // Skip null or undefined items
      if (item.selectedService === "Quote") {
        return acc
      }
      if (item.selectedService === "Refund") {
        return acc - item.totalPrice;
      } else {
        return acc + item.totalPrice;
      }
    }, 0) || 0;

    const totalQuoteAmount = invoice?.invoice?.reduce((acc: number, item: any) => {
      if (!item || item.selectedService !== "Quote") return acc; // Only include quotes
      return acc + item.quoteData.reduce((sum: number, quoteItem: any) => sum + quoteItem.unitPrice, 0);
    }, 0) || 0;

    const totalDue = totalQuoteAmount === 0 ? 0 : totalAmount - totalQuoteAmount;

    const formattedTotalInvoicePrice = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(totalAmount);

    const formattedTotalDuePrice = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(totalDue));

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
         <tr style="font-style: italic; background-color: #f0f0f0;">
            <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total Due</td>
            <td style="padding: 8px; border: 1px solid #ddd;"></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formattedTotalDuePrice}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f0f0f0;">
            <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total Billed</td>
            <td style="padding: 8px; border: 1px solid #ddd;"></td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formattedTotalInvoicePrice}</td>
          </tr>
         
        </tfoot>
      </table>
      <p>Date Created: ${formattedDateCreated}</p>
      <p>Payment Method: ${invoice.paymentMethod ? invoice.paymentMethod : ""}</p>
      <p>Total Due: ${formattedTotalDuePrice}</p>
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
    const serviceId = 'service_j61c9xk';
    const templateId = 'template_4tuxdfq';
    const userId = 'W2T5jK8zsxWpdpjZh';

    const formattedMessage = generateInvoiceHTML(invoice);

    const templateParams = {
      to_name: 'Dear Client',
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
      setLocalInvoice(null); // Clear localInvoice
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
      setLocalInvoice(updatedInvoice); // Ensure localInvoice is updated
      setSelectedInvoice(updatedInvoice); // Update selectedInvoice

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

      message.success("Line item deleted successfully");
    } catch (error) {
      message.error("Failed to delete line item");
    }
  };

  const totalAmount = localInvoice?.invoice?.reduce((acc: number, item: any) => {
    if (!item || item.selectedService === "Quote") return acc; // Skip null, undefined items, and quotes
    if (item.selectedService === "Refund") {
      return acc - item.totalPrice;
    } else {
      return acc + item.totalPrice;
    }
  }, 0) || 0;

  const totalQuoteAmount = localInvoice?.invoice?.reduce((acc: number, item: any) => {
    if (!item || item.selectedService !== "Quote") return acc; // Only include quotes
    return acc + item.quoteData.reduce((sum: number, quoteItem: any) => sum + quoteItem.unitPrice, 0);
  }, 0) || 0;



  const totalDue = totalQuoteAmount === 0 ? 0 : totalAmount - totalQuoteAmount;

  const formattedTotalInvoicePrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalAmount);

  const formattedTotalDuePrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(totalDue));


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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              type="link"
              onClick={addService}
              style={{ padding: "0", marginBottom: "1rem" }}
            >
              <PlusCircleOutlined /> Add line item
            </Button>
            <Button type="link" onClick={handleDeleteInvoice}><DeleteOutlined />Delete</Button>
          </div>
          <div>
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
              {localInvoice?.invoice?.sort((a: any, b: any) => {
                if (a.selectedService === "Quote") return -1;
                if (b.selectedService === "Quote") return 1;
                return 0;
              }).map((lineItem: any, index: any) => {
                if (!lineItem) return null; // Skip null or undefined items
                const isQuote = lineItem.selectedService === "Quote";
                const isRefund = lineItem.selectedService === "Refund";
                const totalQuoteAmount = isQuote ? lineItem.quoteData.reduce((sum: number, item: any) => sum + item.unitPrice, 0) : lineItem.totalPrice;
                const formattedTotalPrice = new Intl.NumberFormat('en-US', {
                  style: 'decimal',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalQuoteAmount);

                return (
                  <div
                    key={index}
                    style={{
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px",
                      backgroundColor: isQuote ? "#fff7e6" : isRefund ? "#ffe6e6" : lineItem.history ? "#ffe6f5" : (index % 2 === 0 ? "#ffffff" : "#f9f9f9"),
                      borderBottom: "1px solid #e8e8e8",
                      color: isQuote ? "#fa8c16" : isRefund ? "#ff4d4f" : "inherit"
                    }}
                  >
                    {/* backgroundColor:"#ffe6f5" */}
                    <div style={{ flex: 2 }}>
                      <span >
                        <strong style={lineItem.history ? { fontStyle: "italic", fontWeight: "normal", } : {}}>{lineItem.owner === "Custom Part" ? "Custom Part" : lineItem.selectedService}</strong>
                        <br />
                        {lineItem.part}
                      </span>
                      {isQuote && lineItem.quoteData && (
                        <>
                          {lineItem.quoteData.map((quote: any, quoteIndex: number) => (
                            <span key={quoteIndex}>
                              <span style={{ fontSize: "16px" }}>  {quote.field} {quote.partName ? quote.partName : ''} ${quote.unitPrice}</span><br />
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>{lineItem.quantity}</div>
                    <div style={{ flex: 1, textAlign: "right", ...(lineItem.history ? { fontStyle: "italic", fontWeight: "normal" } : {}) }}>
                      {isRefund ? `-${formattedTotalPrice}` : `$${formattedTotalPrice}`}
                    </div>

                    <div style={{ flex: 1, textAlign: "right" }}>
                      {!lineItem.history ? (
                        <Button
                          type="link"
                          danger
                          onClick={() => handleDeleteLineItem(index)}
                        >
                          <DeleteOutlined />
                        </Button>
                      ) : null}

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

              }}
            >
              <div style={{ flex: 1, textAlign: "left", fontStyle: "italic" }}>Total Due</div>
              <div style={{ flex: 3, textAlign: "right", fontStyle: "italic" }}>${formattedTotalDuePrice}</div>
              <div style={{ flex: 1 }}></div>
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
              <div style={{ flex: 1, textAlign: "left", fontWeight: "bold" }}>Total Billed</div>
              <div style={{ flex: 3, textAlign: "right", fontWeight: "bold" }}>${formattedTotalInvoicePrice}</div>
              <div style={{ flex: 1 }}></div>
            </div>

            <Row gutter={[16, 16]} style={{ marginTop: "1rem" }}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  style={{ width: "100%" }}
                  label="Select Payment Method"
                  name={paymentMethod}
                >
                  <Select
                    value={paymentMethod}
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
                >
                  <Checkbox
                    disabled={currentRole?.role === "technician" ? true : false}
                    checked={hasTechnicianBeenPaid}
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
