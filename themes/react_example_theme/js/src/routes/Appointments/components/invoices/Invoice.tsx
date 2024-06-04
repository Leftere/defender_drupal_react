import { ArrowLeftOutlined, CheckCircleFilled, CheckOutlined, CloseCircleOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, InputNumber, Row, Tag } from "antd"
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/es/input/TextArea";
import { useUpdateInvoice } from './hooks/updateInvoice'
import { useEffect, useState } from "react";
import { NewInvoiceItem } from "./NewInvoiceItem";
import { InvoiceItem } from './InvoiceItem';
import { AddLineItem } from "./AddLineItem";
import { SelectedInvoiceItem } from './SelectedInvoiceItem'
import dayjs from 'dayjs';
interface InvoiceProps {
  appointmentId: string;
  appliance: any;
}

export const Invoice: React.FC<InvoiceProps> = ({ appointmentId, appliance }) => {
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newServiceOpen, setNewService] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [newSelectedService, setNewSelectedService] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const serviceButtons = ["Deposit", "Service Call", "Call Back", "Labor", "Part", "Parts Installation/Custom Part"]
  const { updateInvoice, isLoading, error } = useUpdateInvoice()
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [form] = useForm();



  const handleSelectedService = (item: string) => {
    setSelectedService(item)
  }

  const handleBackToInvoices = () => {
    setNewInvoiceOpen(false);
    setNewItemOpen(false);
  };

  const addNewInvoice = () => {
    setSelectedInvoice(null);
    setNewInvoiceOpen(true);
    setNewSelectedService(true)
    // setNewItemOpen(true);
    // Show form to add new invoice line items
  };

  const handleBack = () => {
    setSelectedInvoice(null);
  };

  const handleServiceTypeForm = async (values: any) => {
    console.log(values, "i am values")
    const newLineItem = {
      selectedService,
      jobDescription: values.jobDescription,
      inventory: values.inventory,
      customPart: values.partName,
      customPartOrgPrice: values.partOrgPrice,
      customPartSellPrice: values.partUnitPrice,
      quantity: values.quantity,
      unitPrice: values.unitPrice || values.partUnitPrice,
      totalPrice: isNaN(values.quantity)
        ? (values.unitPrice || values.partUnitPrice)
        : values.quantity * (values.unitPrice || values.partUnitPrice),
    };

    let updatedInvoices = invoices;
    let updatedInvoice: any;

    if (newInvoiceOpen && !selectedInvoice) {
      updatedInvoice = { invoice: [newLineItem], dateCreated: dayjs().format() };
      updatedInvoices = [...invoices, updatedInvoice];
    } else if (selectedInvoice) {
      updatedInvoice = {
        ...selectedInvoice,
        invoice: [...(selectedInvoice.invoice || []), newLineItem]
      };
      updatedInvoices = invoices.map(inv => inv === selectedInvoice ? updatedInvoice : inv);
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
    // fetchInvoice();
    setSelectedInvoice(updatedInvoice);  // Set the updated invoice as the selected invoice
    setNewItemOpen(false);
    setNewInvoiceOpen(false);
    setSelectedService("");
    setNewSelectedService(false)
    
    // Reset selected invoice
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
      const data = await response.json();
      const invoiceData = data.data.attributes.field_invoices;
      if (response.ok) {
        const parsedInvoices = invoiceData ? JSON.parse(invoiceData) : [];
        setInvoices(parsedInvoices);   // Initialize with an empty array if undefined

        // Update selectedInvoice if it's currently selected and exists in the fetched data
        if (selectedInvoice) {
          const updatedSelectedInvoice = parsedInvoices.find((inv: any) => inv === selectedInvoice);
          if (updatedSelectedInvoice) {
            setSelectedInvoice(updatedSelectedInvoice);
          } else {
            // setSelectedInvoice(null);
          }
        }
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (error) {
      console.log("failed to fetch invoice:", error);
    }
  };

  const handleInvoiceClick = (invoice: any) => {
    setSelectedInvoice(invoice);
  };


  return (
    <>
      <div style={{ width: "100%" }}>
        {selectedInvoice ? (
          <SelectedInvoiceItem
            invoice={selectedInvoice}
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
              setSelectedInvoice={setSelectedInvoice}
              serviceButtons={serviceButtons}
              form={form}
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
                padding: "4rem 1rem"
              }}
            >
              <PlusCircleOutlined style={{ marginBottom: "0.5rem" }} />
              New Invoice
            </Button>
          </>
        )}

      </div>
    </>
  )
}