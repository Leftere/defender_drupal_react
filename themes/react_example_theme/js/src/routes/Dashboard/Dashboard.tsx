import React from 'react';
import { Layout, Row, Col, Card, Typography, Spin, Alert, Statistic, List } from 'antd';
import useFetchAppointments from './hooks/useFetchAppointments';
import dayjs from 'dayjs';
import './Dashboard.css';

const { Header, Content } = Layout;
const { Title } = Typography;

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

  const totalMoney = appointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices) {
      try {
        const invoices = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: any) => {
          invoice.invoice.forEach((item: any) => {
            if (item.selectedService !== 'Quote') { // Exclude "Quote" from the total
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

  const totalLabor = appointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices) {
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

  const totalDeposits = appointments.reduce((acc: number, appointment: any) => {
    if (appointment.attributes.field_invoices) {
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

  return (
    <Layout className="dashboard-page">
      <Content className="content">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card>
              {isLoading && <Spin size="large" />}
              {error && <Alert message="Error" description={error} type="error" showIcon />}
              {!isLoading && !error && (
                <div className="statistics-container">
                  <Statistic
                    title="Total Appointments"
                    value={appointments.length}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Statistic
                    title="Total Money"
                    value={totalMoney}
                    prefix="$"
                    valueStyle={{ color: '#cf1322' }}
                  />
                  <Statistic
                    title="Total Labor"
                    value={totalLabor}
                    prefix="$"
                    valueStyle={{ color: '#fa8c16' }}
                  />
                  <Statistic
                    title="Total Deposits"
                    value={totalDeposits}
                    prefix="$"
                    valueStyle={{ color: '#2f54eb' }}
                  />
                </div>
              )}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Appointments List" className="appointments-card">
              {isLoading && <Spin size="large" />}
              {error && <Alert message="Error" description={error} type="error" showIcon />}
              {!isLoading && !error && (
                <List
                  itemLayout="horizontal"
                  dataSource={appointments}
                  renderItem={(appointment: any) => (
                    <List.Item className="appointment-item">
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
