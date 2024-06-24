import React from 'react';
import { Row, Col, Card, Typography, Select, DatePicker, Statistic } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface FilterPanelProps {
  handleStatusChange: (value: string) => void;
  handleDateChange: (dates: [Dayjs, Dayjs] | null) => void;
  handlePaymentMethodChange: (values: string[]) => void;
  handleTechnicianChange: (value: string) => void;
  handlePaidTechniciansChange: (values: string[]) => void;
  setShowRevenue: (show: boolean) => void;
  setShowIncome: (show: boolean) => void;
  filteredAppointments: any[];
  technicians: any[];
  currentRole: any;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  handleStatusChange,
  handleDateChange,
  handlePaymentMethodChange,
  handleTechnicianChange,
  handlePaidTechniciansChange,
  setShowRevenue,
  setShowIncome,
  filteredAppointments,
  technicians,
  currentRole
}) => {
  return (
    <Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={4}>
          <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Filter by Status</Text>
          <Select
            placeholder="Filter by Status"
            onChange={handleStatusChange}
            style={{ width: '100%' }}
          >
            <Option value="">All Statuses</Option>
            <Option value="Scheduled">Scheduled</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Parts Installation">Parts Installation</Option>
            <Option value="Completed">Completed</Option>
          </Select>
        </Col>
        <Col xs={24} md={4}>
          <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Select Date Range</Text>
          <RangePicker onChange={(dates, dateStrings) => handleDateChange(dates as [Dayjs, Dayjs])} style={{ width: '100%' }} />
        </Col>
        {currentRole?.role === "administrator" ?
          (<Col xs={24} md={8}>
            <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Select Data</Text>
            <Select
              mode="multiple"
              placeholder="Select Data to Show"
              defaultValue={['Revenue', 'Income']}
              onChange={(values) => {
                setShowRevenue(values.includes('Revenue'));
                setShowIncome(values.includes('Income'));
              }}
              style={{ width: '100%' }}
            >
              <Option value="Revenue">Company Revenue</Option>
              <Option value="Income">Company Income</Option>
            </Select>
          </Col>)
          : null}

        <Col xs={24} md={6}>
          <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Filter by Payment Method</Text>
          <Select
            mode="multiple"
            placeholder="Select Payment Methods"
            onChange={handlePaymentMethodChange}
            style={{ width: '100%' }}
          >
            <Option value="Credit Card">Credit Card</Option>
            <Option value="Cash">Cash</Option>
            <Option value="Check">Check</Option>
          </Select>
        </Col>

        {currentRole?.role === "technician" && (<Col xs={24} md={4}>
          <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Paid Technicians</Text>
          <Select
            placeholder=""
            mode="multiple"
            defaultValue={['Yes', 'No']}
            onChange={handlePaidTechniciansChange}
            style={{ width: '100%' }}
          >
            <Option value="Yes">Yes</Option>
            <Option value="No">No</Option>
          </Select>
        </Col>)}
        <Col xs={24} md={currentRole?.role === "administrator" ? 2 : 6} className="filter-bar-appointments">
          <Statistic
            title="Total Appointments"
            value={filteredAppointments.length}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '1rem' }}>
        {currentRole?.role === "administrator" ? (
          <Col xs={24} md={4}>
            <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Technicians</Text>
            <Select
              showSearch
              placeholder="Select Technician"
              onChange={handleTechnicianChange}
              style={{ width: '100%' }}
              filterOption={(input, option: any) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="">All Technicians</Option>
              {technicians
                ?.filter((tech: any) => tech.attributes.display_name !== 'Anonymous')
                .map((tech: any) => (
                  <Option key={tech.id} value={tech.id}>
                    {tech.attributes.field_first_name + ' ' + tech.attributes.field_last_name}
                  </Option>
                ))}
            </Select>
          </Col>
        ) : null}
        {currentRole?.role === "administrator" && (<Col xs={24} md={4}>
          <Text strong style={{ display: 'block', marginBottom: '0.5rem' }}>Paid Technicians</Text>
          <Select
            placeholder=""
            mode="multiple"
            defaultValue={['Yes', 'No']}
            onChange={handlePaidTechniciansChange}
            style={{ width: '100%' }}
          >
            <Option value="Yes">Yes</Option>
            <Option value="No">No</Option>
          </Select>
        </Col>)}

      </Row>
    </Card>
  );
};


