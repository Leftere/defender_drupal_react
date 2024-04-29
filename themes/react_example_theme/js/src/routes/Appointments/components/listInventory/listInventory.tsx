import { DeleteButton } from '@refinedev/antd'
import { useResource } from '@refinedev/core'
import { Button, Col, Row, Space, Table } from 'antd'
import React, { useEffect, useState } from 'react'

interface InventoryItem {
  id: string | number // Adjust based on your actual data
  name: string
  itemCode: string
  itemName: string
  category: string
  modelNumber: string
  originalPrice: number // Or string if it includes currency symbols or units
}


export const ListInventory = ({ inventoryState }: { inventoryState: InventoryItem[] }) => {
  const { id } = useResource()


  return (
    <Row>
      <Col span={24}>
        <Table dataSource={inventoryState} rowKey="id" style={{ width: '100%' }}>
          <Table.Column title="Item Name" dataIndex="itemName" key="itemName" />
          {/* <Table.Column title="Category" dataIndex="category" key="category" /> */}
          <Table.Column title="Model Number" dataIndex="modelNumber" key="modelNumber" />
          <Table.Column
            title="Original Price"
            dataIndex="originalPrice"
            key="originalPrice"
            render={(text) => `$${text}`} // Custom render function for formatting
          />
            <Table.Column 
        title="Actions"
        key="actions"
        render={(text, record) => (
          // Actions like Edit or Delete can go here
          <Space size="middle">
            {/* Example Action Button */}
            <DeleteButton hideText size="small"  />
          </Space>
        )}
      />
        </Table>
      </Col>
    </Row>
  )
}

