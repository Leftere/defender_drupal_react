import { ArrowLeftOutlined, CheckCircleFilled, CheckOutlined, CloseCircleOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Tag, Typography, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/es/input/TextArea";
import { useUpdateInvoice } from './hooks/updateInvoice';
import { useEffect, useState } from "react";
import { NewInvoiceItem } from "./NewInvoiceItem";
import { InvoiceItem } from './InvoiceItem';
import { AddLineItem } from "./AddLineItem";
import { SelectedInvoiceItem } from './SelectedInvoiceItem';
import { useCreateInventory } from '../../../../utils/fetchInventory';
import dayjs from 'dayjs';

interface InvoiceProps {
  appointmentId: string;
  appliance: any;
  clientData: any;
  appointmentData: any;
}

export const Invoice: React.FC<InvoiceProps> = ({ appointmentId, appliance, clientData, appointmentData }) => {
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newServiceOpen, setNewService] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [newSelectedService, setNewSelectedService] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesHistory, setInvoicesHistory] = useState<any[]>([]);
  const serviceButtons = ["Quote", "Deposit", "Service Call", "Call Back", "Labor", "Part", "Parts Installation/Custom Part"];
  const { updateInvoice, isLoading, error } = useUpdateInvoice();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [technicianRate, setTechnicianRate] = useState(null);
  const { createInventory } = useCreateInventory();
  const [form] = useForm();
  const { Title, Text } = Typography;
  const { followUpAppointment } = appointmentData;

  const handleSelectedService = (item: string) => {
    setSelectedService(item);
  };

  const handleBackToInvoices = () => {
    setNewInvoiceOpen(false);
    setNewItemOpen(false);
  };

  const addNewInvoice = () => {
    setSelectedInvoice(null);
    setNewInvoiceOpen(true);
    setNewSelectedService(true);
  };

  const handleBack = () => {
    setSelectedInvoice(null);
  };

  const fetchTechnician = async () => {
    try {
      const response = await fetch(`/jsonapi/user/user/${appointmentData.technicianID}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();
      setTechnicianRate(json.data.attributes.field_rate);
    } catch (error) {
      console.error('Failed to fetch technician', error);
    }
  };

  useEffect(() => {
    fetchTechnician();
  }, [appointmentData]);

  const handleServiceTypeForm = async (values: any) => {
    console.log(values, "I am values");
    let totalPrice = isNaN(values.quantity) ? values.unitPrice || values.partUnitPrice : values.quantity * (values.unitPrice || values.partUnitPrice);
    let companyLaborIncome;
    let technicianShare;
    let serviceCallIncome;
    let callBackIncome;
    let depositIncome;
    let technicianReimbursement = values.owner === "Custom Part" ?  values.partOrgPrice * values.quantity : null
    let companyPartIncome = (values.partUnitPrice - values.partOrgPrice) * values.quantity

    switch (selectedService) {
      case "Labor":
        {
          let technicianRateDecimal = technicianRate !== null ? technicianRate / 100 : 0;
          technicianShare = totalPrice * technicianRateDecimal;
          companyLaborIncome = totalPrice - technicianShare;
        }
        break;
      case "Deposit":
        {
          let technicianRateDecimal = technicianRate !== null ? technicianRate / 100 : 0;
          technicianShare = totalPrice * technicianRateDecimal;
          depositIncome = totalPrice - technicianShare;
        }
        break;
      case "Service Call":
        {
          let technicianRateDecimal = technicianRate !== null ? technicianRate / 100 : 0;
          technicianShare = totalPrice * technicianRateDecimal;
          serviceCallIncome = totalPrice - technicianShare;
        }
        break;
      case "Call Back":
        {
          let technicianRateDecimal = technicianRate !== null ? technicianRate / 100 : 0;
          technicianShare = totalPrice * technicianRateDecimal;
          callBackIncome = totalPrice - technicianShare;
        }
        break;
      case "Part":
        {
          let technicianRateDecimal = technicianRate !== null ? technicianRate / 100 : 0;
          if (values.owner === "Company Part") {
            console.log(technicianRateDecimal, "technicianRateDecimal")
            technicianShare = companyPartIncome * technicianRateDecimal;
            companyPartIncome = companyPartIncome - technicianShare;
            console.log(technicianReimbursement, "technicianReimbursement")
            console.log(technicianShare, "technician share")
            console.log(companyPartIncome, "companyPartINcome")
          } else if (values.owner === "Custom Part") {
            technicianShare = companyPartIncome * technicianRateDecimal;
            companyPartIncome = companyPartIncome - technicianShare;
            console.log(technicianReimbursement, "technicianReimbursement")
            console.log(technicianShare, "technician share")
            console.log(companyPartIncome, "companyPartINcome")
          }

          let data = {
            "data": {
              "type": "node--inventory",
              "attributes": {
                "field_part_name": values.partName,
                "field_owner": values.owner,
                "field_original_price": values.partOrgPrice,
                "field_quantity": values.quantity,
                "field_selling_price": values.partUnitPrice,
                "field_technician_reimbursement": technicianReimbursement,
                "field_total_price": values.totalPrice,
                "field_company_part_income": companyPartIncome,
                "field_technician_share": technicianShare
              }
            }
          };
          try {
            await createInventory(data, form);
          } catch (error) {
            console.error('Failed to create inventory:', error);
          }
        }
        break;
      default:
        // Handle other cases or do nothing
        break;
    }

    const newLineItem = {
      selectedService,
      jobDescription: values.jobDescription,
      inventory: values.inventory,
      part: values.partName,
      partOrgPrice: values.partOrgPrice,
      partSellPrice: values.partUnitPrice,
      owner: values.owner,
      companyLaborIncome: companyLaborIncome,
      technicianShare: technicianShare,
      callBackIncome: callBackIncome,
      serviceCallIncome: serviceCallIncome,
      companyPartIncome: companyPartIncome ? companyPartIncome : null,
      technicianReimbursement: technicianReimbursement ? technicianReimbursement : null,
      depositIncome: depositIncome,
      quantity: values.quantity,
      unitPrice: values.unitPrice || values.partUnitPrice,
      totalPrice: totalPrice,
    };

    let updatedInvoices = [...invoices];
    let updatedInvoice = { ...selectedInvoice };

    if (newInvoiceOpen && !selectedInvoice) {
      updatedInvoice = { invoice: [newLineItem], dateCreated: dayjs().format() };
      updatedInvoices = [...invoices, updatedInvoice];
    } else if (selectedInvoice) {
      updatedInvoice.invoice = [...(updatedInvoice.invoice || []), newLineItem];
      updatedInvoices = updatedInvoices.map((inv) => (inv.dateCreated === selectedInvoice.dateCreated ? updatedInvoice : inv));
    }

    setInvoices(updatedInvoices);
    setSelectedInvoice(updatedInvoice);

    const data = {
      data: {
        type: "node--appointment1",
        id: appointmentId,
        attributes: {
          field_invoices: JSON.stringify(updatedInvoices),
        },
      },
    };

    try {
      await updateInvoice(data, form);
      fetchInvoice();
      message.success('Invoice updated successfully');
    } catch (error) {
      message.error('Failed to update invoice');
    } finally {
      setNewItemOpen(false);
      setNewInvoiceOpen(false);
      setSelectedService("");
      setNewSelectedService(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [appointmentId]);

  useEffect(() => {
    if (!newItemOpen) {
      form.resetFields();
    }
  }, [newItemOpen]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/jsonapi/node/appointment1/${appointmentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      const appointment = data.data;

      const invoiceData = appointment.attributes.field_invoices;
      const invoicesHistoryData = appointment.attributes.field_invoices_history;

      let parsedInvoices = [];
      let parsedInvoicesHistory = [];

      if (invoiceData && invoiceData.length && invoiceData[0].trim() !== "[]") {
        try {
          parsedInvoices = JSON.parse(invoiceData[0]);
        } catch (e) {
          console.error('Failed to parse invoiceData JSON:', e);
        }
      }

      if (invoicesHistoryData && invoicesHistoryData.length && invoicesHistoryData[0].trim() !== "[]") {
        try {
          parsedInvoicesHistory = JSON.parse(invoicesHistoryData[0]);
        } catch (e) {
          console.error('Failed to parse invoicesHistoryData JSON:', e);
        }
      }

      setInvoices(parsedInvoices);

      if (selectedInvoice) {
        const updatedSelectedInvoice = parsedInvoices.find((inv: any) => inv.dateCreated === selectedInvoice.dateCreated) ||
          parsedInvoicesHistory.find((inv: any) => inv.dateCreated === selectedInvoice.dateCreated);
        if (updatedSelectedInvoice) {
          setSelectedInvoice(updatedSelectedInvoice);
        }
      }

      setInvoicesHistory(parsedInvoicesHistory);
    } catch (error) {
      console.error("failed to fetch invoice:", error);
    }
  };

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div style={{ width: "100%" }}>
      {selectedInvoice ? (
        <SelectedInvoiceItem
          invoice={selectedInvoice}
          clientData={clientData}
          appliance={appliance}
          appointmentId={appointmentId}
          onBack={handleBack}
          setNewItemOpen={setNewItemOpen}
          serviceButtons={serviceButtons}
          invoices={invoices}
          setInvoices={setInvoices}
          form={form}
          setNewSelectedService={setNewSelectedService}
          setSelectedInvoice={setSelectedInvoice}
          newSelectedService={newSelectedService}
          selectedService={selectedService}
          handleSelectedService={handleSelectedService}
          handleServiceTypeForm={handleServiceTypeForm}
          setSelectedService={setSelectedService}
          handleBackToInvoices={handleBackToInvoices}
          fetchInvoice={fetchInvoice}
          invoicesHistory={invoicesHistory}
        />
      ) : newInvoiceOpen ? (
        newItemOpen ? (
          <AddLineItem
            form={form}
            selectedService={selectedService}
            handleBackToInvoices={handleBackToInvoices}
            serviceButtons={serviceButtons}
            handleSelectedService={handleSelectedService}
            handleServiceTypeForm={handleServiceTypeForm}
            setNewItemOpen={setNewItemOpen}
            setSelectedService={setSelectedService}
          />
        ) : (
          <SelectedInvoiceItem
            invoice={{ invoice: [] }} // Provide a default empty object for new invoices
            appliance={appliance}
            appointmentId={appointmentId}
            onBack={handleBack}
            setNewItemOpen={setNewItemOpen}
            clientData={clientData}
            setSelectedInvoice={setSelectedInvoice}
            serviceButtons={serviceButtons}
            form={form}
            invoicesHistory={invoicesHistory}
            invoices={invoices}
            setInvoices={setInvoices}
            setNewSelectedService={setNewSelectedService}
            newSelectedService={newSelectedService}
            selectedService={selectedService}
            handleSelectedService={handleSelectedService}
            handleServiceTypeForm={handleServiceTypeForm}
            setSelectedService={setSelectedService}
            handleBackToInvoices={handleBackToInvoices}
            fetchInvoice={fetchInvoice}
          />
        )
      ) : (
        <>
          {followUpAppointment && (
            <div style={{ marginBottom: '1rem' }}>
              <Title level={4}>History</Title>

              {invoicesHistory.map((item: any, index: any) => (
                console.log(item, "item"),
                <div key={index} onClick={() => handleInvoiceClick(item)}>
                  <InvoiceItem invoices={invoicesHistory} item={item} index={index} appliance={appliance} />
                </div>
              ))}
            </div>
          )}
          {invoices.map((item, index) => (
            <div key={index} onClick={() => handleInvoiceClick(item)}>
              <InvoiceItem invoices={invoices} item={item} index={index} appliance={appliance} />
            </div>
          ))}
          <Button
            onClick={addNewInvoice}
            type="dashed"
            block
            size="large"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "4rem 1rem",
            }}
          >
            <PlusCircleOutlined style={{ marginBottom: "0.5rem" }} />
            New Invoice
          </Button>
        </>
      )}
    </div>
  );
};
