import React from "react";
import { Button, Tag } from "antd";

interface InvoiceItemProps {
  item: any;
  index: number;
  appliance: string[];
}

export const InvoiceItem: React.FC<InvoiceItemProps> = ({ item, index, appliance }) => {
  
    return (
    <Button style={{ display: "contents" }} key={index}>
      <div style={{ background: "#ffb703", padding: "1rem 2rem", borderRadius: ".5rem", marginBottom: "1rem" }}>
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
      </div>
    </Button>
  );
};

