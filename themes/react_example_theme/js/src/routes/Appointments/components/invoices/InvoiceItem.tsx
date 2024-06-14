import React from "react";
import { Button, Tag } from "antd";
import dayjs from 'dayjs';

interface InvoiceItemProps {
  item: any;
  index: number;
  appliance: string[];
  invoices: object;
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({ item, index, appliance, invoices }) => {
 
  const invoiceItems = item.invoice;
  const formattedDate = item.dateCreated ? dayjs(item.dateCreated).format('MM/DD/YYYY') : 'N/A';
  const totalInvoicePrice = Array.isArray(invoiceItems) ?
    invoiceItems.reduce((sum: number, currentItem: any) => {
      if (currentItem && currentItem.totalPrice) {
        return sum + currentItem.totalPrice;
      }
      return sum;
    }, 0) : 0;

  const formattedTotalInvoicePrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalInvoicePrice);

  return (
    <Button style={{ display: "contents" }} key={index}>
      <div style={{ background: "#ffb703", padding: "1rem 2rem", borderRadius: ".5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem" }}>
          <span>Invoice #{index + 1} ${formattedTotalInvoicePrice}</span><span>{formattedDate}</span>
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
      </div>
    </Button>
  );
};
