import { ArrowLeftOutlined, CheckCircleFilled, CheckOutlined, CloseCircleOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Button, Col, Form, Input, InputNumber, Row, Tag } from "antd"
import { useForm } from "antd/lib/form/Form";
import TextArea from "antd/es/input/TextArea";
import { useUpdateInvoice } from './hooks/updateInvoice'
import { useEffect, useState } from "react";
interface InvoiceProps {
  appointmentId: string;
  appliance: any;
}

export const Invoice: React.FC<InvoiceProps> = ({ appointmentId, appliance }) => {
  const [newInvoiceOpen, setNewInvoiceOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [newServiceOpen, setNewService] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const serviceButtons = ["Labor", "Part", "Deposit", "Service Call"]
  const { updateInvoice, isLoading, error } = useUpdateInvoice()
  const [form] = useForm();
  const handleSelectedService = (item: string) => {
    setSelectedService(item)

  }

  const addNewInvoice = () => {
    const newInvoice = {
      invoice: []
    };
    setInvoices([...invoices, newInvoice]);
    setNewInvoiceOpen(true);
    // setNewItemOpen(true);
  };

  const handleServiceTypeForm = async (values: any) => {
    let newLineItem = {
      "selectedService": selectedService,
      "jobDescription": values.jobDescription,
      "quantity": values.quantity,
      "unitPrice": values.unitPrice
    };

    // Assuming you want to add the new line item to the latest invoice
    let updatedInvoices = [...invoices];
    let latestInvoice = updatedInvoices[updatedInvoices.length - 1];
    latestInvoice.invoice.push(newLineItem);

    setInvoices(updatedInvoices);

    let data = {
      "data": {
        "type": "node--appointment1",
        "id": appointmentId,
        "attributes": {
          "field_invoices": JSON.stringify(updatedInvoices)
        }
      }
    };
    await updateInvoice(data, form);
    fetchInvoice();
    setNewItemOpen(false);
  };

  useEffect(() => {
    fetchInvoice();
  }, []);
  console.log(invoices)
  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/jsonapi/node/appointment1/${appointmentId}`)
      const data = await response.json();
      const invoiceData = data.data.attributes.field_invoices
      if (response.ok) {
        setInvoices(invoiceData ? JSON.parse(invoiceData) : []);   // Initialize with an empty array if undefined
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (error) {
      console.log("failed to fetch invoice:", error)
    }
  }



  return (
    <>
      <div style={{ width: "100%" }}>
        {newInvoiceOpen ? (
          <>

            {newItemOpen ? (
              <>

                <div>
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: "1rem" }}>
                    <Button
                      onClick={() => { setNewItemOpen(false), setSelectedService("") }}
                      type="link"
                      style={{ padding: "0" }}><ArrowLeftOutlined /> Invoice</Button>
                    <span style={{ width: "100%", textAlign: "center" }}>New invoice line</span>
                  </div>
                  {selectedService === "" ? (
                    <div>
                      <strong>Select Service Type</strong>
                      <div style={{ display: "flex", flexDirection: "column", width: "100%", margin: "1rem 0" }}>
                        {serviceButtons.map((item, index) => {
                          return <Button
                            onClick={() => handleSelectedService(item)}
                            key={index} block style={{ textAlign: "start", marginBottom: ".5rem" }}>{item}</Button>
                        })}

                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong style={{ display: "block" }}>{selectedService}</strong>
                      <Form form={form} layout="vertical" style={{ width: "100%" }}
                        onFinish={handleServiceTypeForm}
                      >
                        <Form.Item label="Job Description" name="jobDescription">
                          <TextArea rows={4} />
                        </Form.Item>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item label="Qty" name="quantity">
                              <Input />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item label="Unit Price" style={{ width: "100%" }} name="unitPrice">
                              <InputNumber

                                style={{ width: "100%" }}
                                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Button style={{ width: "100%" }} danger> <CloseCircleOutlined />Cancel</Button>
                          </Col>
                          <Col span={12}>
                            <Button style={{ width: "100%", backgroundColor: "green", color: "#fff" }} htmlType="submit"> <CheckCircleFilled /> Add</Button>
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  )}

                </div>

              </>
            ) : (
              <div>
                <Button
                  type="link"
                  style={{ padding: "0", marginBottom: "1rem" }}
                  onClick={() => setNewInvoiceOpen(false)}
                > <ArrowLeftOutlined />Invoices</Button>
                <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "1rem" }}>
                  <span>
                    Invoice #16 <span>unpaid</span>
                  </span>
                  <Button type="link"><DeleteOutlined />Delete</Button>
                </div>
                <div>
                  <Button
                    type="link"
                    onClick={() => setNewItemOpen(true)}
                    style={{ padding: "0", marginBottom: "1rem" }}
                  > <PlusCircleOutlined />Add line item</Button>
                </div>
                <div>

                </div>
              </div>
            )}

          </>
        ) : (
          <>
            {invoices ? (
              <>
                {invoices.map((item, index) => {
                  console.log(item)
                  return (
                    <>
                      <div style={{ background: "#ffb703", padding: "1rem 2rem", borderRadius: ".5rem", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}><span>Invoice #1($0.00)</span><span>3/1/2024</span></div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>  <span> {appliance?.map((item: string, index: number) => (
                          <Tag key={index} color="#000" style={{color: "#fff", textTransform:"capitalize"}}>
                            {item.replace(/_/g, ' ')}
                          </Tag>
                        ))}</span><span>Unpaid</span></div>
                      </div>
                    </>
                  )
                })}

              </>
            ) : null}

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
              }}>
              <PlusCircleOutlined style={{ marginBottom: "0.5rem" }} />
              New Invoice
            </Button>
          </>

        )}


      </div>
    </>
  )
}