import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Alert, Statistic, List, Select, Tabs, DatePicker } from 'antd';
import useFetchAppointments from './hooks/useFetchAppointments';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'
dayjs.extend(isBetween);

const { Content } = Layout;
const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const capitalizeTitle = (title: string) => {
  return title.replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatTime = (start: string, end: string) => {
  const startDate = dayjs(start).format('MM/DD/YYYY - hh:mm A');
  const endDate = dayjs(end).format('hh:mm A');
  return `Start: ${startDate}, End: ${endDate}`;
};

const processInvoiceItem = (item: any, acc: { totalRevenue: number; totalServiceCall: number; totalExpenses: number; totalDeposits: number; totalLabor: number; totalCallBack: number; companyLaborIncome: number; depositIncome: number; serviceCallIncome: number; callBackIncome: number }) => {
  console.log('Processing item:', item);

  switch (item.selectedService) {
    case 'Quote':
      break;
    case 'Service Call':
      acc.totalServiceCall += item.totalPrice;
      acc.serviceCallIncome += item.serviceCallIncome || 0;
      if (item.totalPrice > 0) {
        acc.totalRevenue += item.totalPrice;
      }
      break;
    case 'Deposit':
      acc.totalDeposits += item.totalPrice;
      acc.depositIncome += item.depositIncome || 0;
      if (item.totalPrice > 0) {
        acc.totalRevenue += item.totalPrice;
      }
      break;
    case 'Call Back':
      acc.totalCallBack += item.totalPrice;
      acc.callBackIncome += item.callBackIncome || 0;
      if (item.totalPrice > 0) {
        acc.totalRevenue += item.totalPrice;
      }
      break;
    case 'Labor':
      acc.totalLabor += item.totalPrice;
      if (item.totalPrice > 0) {
        acc.totalRevenue += item.totalPrice;
        acc.companyLaborIncome += item.companyLaborIncome || 0;
      }
      break;
    default:
      if (item.totalPrice > 0) {
        acc.totalRevenue += item.totalPrice;
      } else if (item.totalPrice < 0) {
        acc.totalExpenses += Math.abs(item.totalPrice);
      }
      break;
  }
  console.log('Accumulator after processing item:', acc);
};

export const Dashboard: React.FC = () => {
  const { appointments, isLoading, error } = useFetchAppointments();
  const [filteredAppointments, setFilteredAppointments] = useState(appointments);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const navigate = useNavigate();

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateChange = (dates: [Dayjs, Dayjs] | null) => {
    if (dates && dates[0] && dates[1] && dates[0].isSame(dates[1], 'day')) {
      // If the selected dates are the same, extend the end date to the end of the day
      setDateRange([dates[0], dates[1].endOf('day')]);
    } else {
      setDateRange(dates);
    }
  };

  const filterByStatusAndDate = () => {
    let filtered = appointments;
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.attributes.field_status === statusFilter);
    }
    if (dateRange) {
      console.log(dateRange)
      filtered = filtered.filter(appointment => dayjs(appointment.attributes.field_appointment_start).isBetween(dateRange[0], dateRange[1], null, '[]'));
    }
    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    filterByStatusAndDate();
  }, [statusFilter, dateRange, appointments]);

  const initialAcc = { totalRevenue: 0, totalServiceCall: 0, totalExpenses: 0, totalDeposits: 0, totalLabor: 0, totalCallBack: 0, companyLaborIncome: 0, depositIncome: 0, serviceCallIncome: 0, callBackIncome: 0 };

  const result = filteredAppointments.reduce((acc: { totalRevenue: number; totalServiceCall: number; totalExpenses: number; totalDeposits: number; totalLabor: number; totalCallBack: number; companyLaborIncome: number; depositIncome: number; serviceCallIncome: number; callBackIncome: number }, appointment: any) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices[0]);
        console.log('Invoices:', invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            processInvoiceItem(item, acc);
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    return acc;
  }, initialAcc);

  const { totalRevenue, totalServiceCall, totalExpenses, totalDeposits, totalLabor, totalCallBack, companyLaborIncome, depositIncome, serviceCallIncome, callBackIncome } = result;

  const totalCompanyIncome = companyLaborIncome + serviceCallIncome + depositIncome + callBackIncome;

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
                <Col xs={24} md={6}>
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
                <Col  xs={24} md={6}>
                  <Text strong style={{ display: "block", marginBottom: "0.5rem" }}>Select Date Range</Text>
                  <RangePicker onChange={(dates, dateStrings) => handleDateChange(dates as [Dayjs, Dayjs])} style={{ width: '100%' }} />
                </Col>
                <Col xs={0} md={4}>
             
                  </Col>
                  <Col xs={24} md={8} className="filter-bar-appointments" style={{}}>
                  <Statistic
                    title="Total Appointments"
                    value={filteredAppointments.length}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Income" key="1">
                <Card>
                  <Text strong>Company Revenue</Text>
                  {isLoading && <Spin size="large" />}
                  {error && <Alert message="Error" description={error} type="error" showIcon />}
                  {!isLoading && !error && (
                    <div className="statistics-container">

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
                        title="Total Revenue"
                        value={totalRevenue}
                        prefix="$"
                        valueStyle={{ color: '#58bb48' }}
                      />
                    </div>
                  )}
                </Card>
                <Card>
                  <Text strong>Company Income</Text>
                  <div className="statistics-container-income">

                    <Statistic
                      title="Labor Income"
                      value={companyLaborIncome}
                      prefix="$"
                      valueStyle={{ color: '#58bb48' }}
                    />
                    <Statistic
                      title="Service Call Income"
                      value={serviceCallIncome}
                      prefix="$"
                      valueStyle={{ color: '#58bb48' }}
                    />
                    <Statistic
                      title="Deposit Income"
                      value={depositIncome}
                      prefix="$"
                      valueStyle={{ color: '#58bb48' }}
                    />
                    <Statistic
                      title="Call Back Income"
                      value={callBackIncome}
                      prefix="$"
                      valueStyle={{ color: '#58bb48' }}
                    />
                    <Statistic
                      title="Total Income"
                      value={totalCompanyIncome}
                      prefix="$"
                      valueStyle={{ color: '#58bb48' }}
                    />
                  </div>
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
