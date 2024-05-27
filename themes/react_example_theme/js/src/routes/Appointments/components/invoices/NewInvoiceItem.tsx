import { ArrowLeftOutlined, DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons"
import { Button, Tag } from "antd"

interface NewInvoiceItemProps {
  invoice: any;
  appliance: string[];
  setNewItemOpen: (arg0: boolean) => void;
  onBack: () => void;
}

export const NewInvoiceItem: React.FC<NewInvoiceItemProps> = ({ invoice, appliance, onBack, setNewItemOpen }) => {
  console.log(invoice)
  return (
    <div>
      <Button type="link" onClick={onBack} style={{ padding: '0', marginBottom: '1rem' }}>
        <ArrowLeftOutlined /> Back to Invoices
      </Button>
      {/* <div style={{ background: "#ffb703", padding: "1rem 2rem", borderRadius: ".5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
          <span>Invoice #1($0.00)</span><span>3/1/2024</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            {appliance.map((item, index) => (
              <Tag key={index} color="#000" style={{ color: "#fff", textTransform: "capitalize" }}>
                {item.replace(/_/g, ' ')}
              </Tag>
            ))}
          </span>
          <span>Unpaid</span>
        </div>
      </div> */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginLeft: "1rem" }}>
          <span>Invoice #16 <span>unpaid</span></span>
          <Button type="link"><DeleteOutlined />Delete</Button>
        </div>

        <div>
          <Button type="link"
            onClick={() => setNewItemOpen(true)}
            style={{ padding: "0", marginBottom: "1rem" }}>
            <PlusCircleOutlined />Add line item
          </Button>
        </div>
        <div>
          {/* <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div>Parts</div><div>Tax</div><div>Unit Cost</div><div>Qty</div><div>Amount</div>
          </div> */}
          <div>
            {invoice.invoice.map((lineItem: any, index: any) => {
              console.log(lineItem)
              return (
                <div key={index}>
                  
                  {lineItem.selectedService}
                </div>
              )

            })}
          </div>
        </div>
      </div>
      <div>
        {/* Display more details about the invoice here */}
        {/* {invoice.invoice.map((lineItem: any, index: any) => (
          <div key={index}>
            <p>Service: {lineItem.selectedService}</p>
            <p>Description: {lineItem.jobDescription}</p>
            <p>Quantity: {lineItem.quantity}</p>
            <p>Unit Price: {lineItem.unitPrice}</p>
          </div>
        ))} */}
      </div>
    </div>
  );
};