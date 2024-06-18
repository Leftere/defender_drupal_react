import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Alert, Statistic, List, Select, Tabs } from 'antd';
import useFetchAppointments from './hooks/useFetchAppointments';
import dayjs from 'dayjs';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

const capitalizeTitle = (title: string) => {
  return title.replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatTime = (start: string, end: string) => {
  const startDate = dayjs(start).format('MM/DD/YYYY - hh:mm A');
  const endDate = dayjs(end).format('hh:mm A');
  return `Start: ${startDate}, End: ${endDate}`;
};

export const Dashboard: React.FC = () => {
  const { appointments, isLoading, error } = useFetchAppointments();
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredAppointments(
      appointments.filter((appointment) =>
        statusFilter ? appointment.attributes.field_status === statusFilter : true
      )
    );
  }, [statusFilter, appointments]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const totalIncome = filteredAppointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            console.log(item)
            if (item.selectedService !== 'Quote' && item.totalPrice > 0) {
              acc += item.totalPrice;
            }
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, 0);


  const totalServiceCall = filteredAppointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            if (item.selectedService === 'Service Call') {
              acc += item.totalPrice;
            }
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, 0);

  const totalExpenses = filteredAppointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            if (item.selectedService !== 'Quote' && item.totalPrice < 0) {
              acc += Math.abs(item.totalPrice);
            }
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, 0);

  const totalDeposits = filteredAppointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            if (item.selectedService === 'Deposit') {
              acc += item.totalPrice;
            }
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, 0);

  const totalLabor = filteredAppointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            if (item.selectedService === 'Labor') {
              acc += item.totalPrice;
            }
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, 0);

  const totalCallBack = filteredAppointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            if (item.selectedService === 'Call Back') {
              acc += item.totalPrice;
            }
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, 0);



  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/appointments/show/${appointmentId}`);
  };

  return (
    <Layout className="dashboard-page">
      <Content className="content">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={4}>
                  <Text strong style={{ display: "block", marginBottom: "0.5rem" }}>Filter by Status</Text>
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
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Income" key="1">
                <Card>
                  {isLoading && <Spin size="large" />}
                  {error && <Alert message="Error" description={error} type="error" showIcon />}
                  {!isLoading && !error && (
                    <div className="statistics-container">
                      <Statistic
                        title="Total Appointments"
                        value={filteredAppointments.length}
                        valueStyle={{ color: '#3f8600' }}
                      />

                      <Statistic
                        title="Total Labor"
                        value={totalLabor}
                        prefix="$"
                        valueStyle={{ color: '#58bb48' }}
                      />
                      <Statistic
                        title="Total Service Calls"
                        value={totalServiceCall}
                        prefix="$"
                        valueStyle={{ color: '#58bb48' }}
                      />
                      <Statistic
                        title="Total Deposits"
                        value={totalDeposits}
                        prefix="$"
                        valueStyle={{ color: '#58bb48' }}
                      />
                      <Statistic
                        title="Total Call Backs"
                        value={totalCallBack}
                        prefix="$"
                        valueStyle={{ color: '#58bb48' }}
                      />
                      <Statistic
                        title="Total Income"
                        value={totalIncome}
                        prefix="$"
                        valueStyle={{ color: '#58bb48' }}
                      />
                    </div>
                  )}
                </Card>
                <Card>
                  Labor
                  <Statistic
                    title="Total Labor"
                    value={totalLabor}
                    prefix="$"
                    valueStyle={{ color: '#58bb48' }}
                  />
                </Card>
              </TabPane>
              <TabPane tab="Expenses" key="2">
                <Card>
                  {isLoading && <Spin size="large" />}
                  {error && <Alert message="Error" description={error} type="error" showIcon />}
                  {!isLoading && !error && (
                    <div className="statistics-container">
                      <Statistic
                        title="Total Expenses"
                        value={totalExpenses}
                        prefix="$"
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </div>
                  )}
                </Card>
              </TabPane>
            </Tabs>
          </Col>
          <Col span={24}>
            <Card title="Appointments List" className="appointments-card">
              {isLoading && <Spin size="large" />}
              {error && <Alert message="Error" description={error} type="error" showIcon />}
              {!isLoading && !error && (
                <List
                  itemLayout="horizontal"
                  dataSource={filteredAppointments}
                  renderItem={(appointment: any) => (
                    <List.Item className="appointment-item" onClick={() => handleAppointmentClick(appointment.id)} style={{ cursor: "pointer" }}>
                      <List.Item.Meta
                        title={capitalizeTitle(appointment.attributes.title)}
                        description={`Status: ${appointment.attributes.field_status} | ${formatTime(appointment.attributes.field_appointment_start, appointment.attributes.field_appointment_end)}`}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};


