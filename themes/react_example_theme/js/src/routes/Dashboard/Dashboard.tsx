import React, { useState, useEffect } from 'react';
import { Layout, Row, Col, Card, Spin, Alert, Table, Statistic } from 'antd';
import useFetchAppointments from './hooks/useFetchAppointments';
import dayjs, { Dayjs } from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import './Dashboard.css';
import { FilterPanel } from './components/FilterPanel';
import { CompanyIncomeExpenses } from './components/CompanyIncomeExpenses';

dayjs.extend(isBetween);

const { Content } = Layout;

interface InvoiceItem {
  selectedService: string;
  technicianShare: number;
  callBackIncome?: number;
  depositIncome?: number;
  serviceCallIncome?: number;
  companyLaborIncome?: number;
  companyPartIncome?: number;
  unitPrice: number;
  totalPrice: number;
  partOrgPrice: number;
  quantity: number;
}

interface Invoice {
  invoice: InvoiceItem[];
  dateCreated: string;
  hasTechnicianBeenPaid: boolean;
  paymentMethod: string;
}

interface AppointmentAttributes {
  title: string;
  field_status: string;
  field_appointment_start: string;
  field_appointment_end: string;
  field_invoices?: string;
}

interface TechnicianData {
  id: string;
}

interface AppointmentRelationships {
  field_technician?: {
    data?: TechnicianData;
  };
}

interface Appointment {
  id: string;
  attributes: AppointmentAttributes;
  relationships?: AppointmentRelationships;
}

interface Technician {
  id: string;
  attributes: {
    display_name: string;
    field_first_name: string;
    field_last_name: string;
  };
}

const capitalizeTitle = (title: string) => {
  return title.replace(/\b\w/g, (char) => char.toUpperCase());
};

const processInvoiceItem = (item: InvoiceItem, acc: any) => {
  switch (item.selectedService) {
    case 'Service Call':
      acc.totalServiceCall += item.totalPrice;
      acc.serviceCallIncome += item.serviceCallIncome || 0;
      acc.totalRevenue += item.totalPrice;
      acc.serviceCallExpense += item.technicianShare;
      acc.techServiceCallIncome += item.technicianShare;
      break;
    case 'Deposit':
      acc.totalDeposits += item.totalPrice;
      acc.depositIncome += item.depositIncome || 0;
      acc.totalRevenue += item.totalPrice;
      acc.depositExpense += item.technicianShare;
      acc.techDepositIncome += item.technicianShare
      break;
    case 'Call Back':
      acc.totalCallBack += item.totalPrice;
      acc.callBackIncome += item.callBackIncome || 0;
      acc.totalRevenue += item.totalPrice;
      acc.callBackExpense += item.technicianShare;
      acc.techCallBackIncome += item.technicianShare
      break;
    case 'Labor':
      acc.totalLabor += item.totalPrice;
      acc.companyLaborIncome += item.companyLaborIncome || 0;
      acc.totalRevenue += item.totalPrice;
      acc.laborExpense += item.technicianShare;
      acc.techLaborIncome += item.technicianShare
      break;
    case 'Part':
      acc.totalPartsRevenue += item.totalPrice;
      acc.partIncome += item.companyPartIncome;
      acc.totalRevenue += item.totalPrice;
      acc.partExpense += item.technicianShare + (item.partOrgPrice * item.quantity);
      acc.partCost += item.partOrgPrice * item.quantity;
      acc.techSalary += item.technicianShare;
      acc.techPartsIncome += acc.techSalary
      break;
    case 'Quote':
      acc.totalQuotes += item.totalPrice;
      acc.techQuotes += item.totalPrice;
      break;
    case 'Refund':
      acc.totalRefunds += item.totalPrice;
      acc.totalRevenue -= item.totalPrice;
      acc.totalCompanyIncome -= item.totalPrice;
      break;
    default:
      acc.totalRevenue += item.totalPrice;
      if (item.totalPrice < 0) {
        acc.totalExpenses += Math.abs(item.totalPrice);
      }
      break;
  }
};

interface DashboardProps {
  currentRole?: {
    role?: string;
    uuid?: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ currentRole }) => {
  const { appointments, isLoading, error } = useFetchAppointments();
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(appointments);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [showRevenue, setShowRevenue] = useState(true);
  const [showIncome, setShowIncome] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<string | undefined>(undefined);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [paidTechniciansFilter, setPaidTechniciansFilter] = useState<string[]>([]);


  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDateChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates);
  };

  const handlePaymentMethodChange = (values: string[]) => {
    setPaymentMethods(values);
  };

  const handleTechnicianChange = (value: string) => {
    setSelectedTechnician(value);
  };

  const handlePaidTechniciansChange = (values: string[]) => {
    setPaidTechniciansFilter(values);
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch('/jsonapi/user/user');
      const json = await response.json();
      setTechnicians(json.data);
    } catch (error) {
      console.error('Failed to fetch technicians', error);
    }
  };

  useEffect(() => {
    if (currentRole?.role === "technician") {
      const filtered = appointments.filter((appointment: any) => appointment.relationships?.field_technician?.data?.id === currentRole.uuid);
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [appointments, currentRole]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const filterByStatusDateAndPaymentMethod = () => {
    let filtered = appointments;
    if (currentRole?.role === "technician") {
      filtered = appointments.filter((appointment: any) => appointment.relationships?.field_technician?.data?.id === currentRole.uuid);
    }
    if (statusFilter) {
      filtered = filtered.filter(appointment => appointment.attributes.field_status === statusFilter);
    }
    if (dateRange) {
      const [startDate, endDate] = dateRange;
      if (startDate.isSame(endDate, 'day')) {
        filtered = filtered.filter(appointment =>
          dayjs(appointment.attributes.field_appointment_start).isSame(startDate, 'day')
        );
      } else {
        filtered = filtered.filter(appointment =>
          dayjs(appointment.attributes.field_appointment_start).isBetween(startDate, endDate, null, '[]')
        );
      }
    }
    if (selectedTechnician) {
      filtered = filtered.filter((appointment: Appointment) => appointment.relationships?.field_technician?.data?.id === selectedTechnician);
    }
    if (paymentMethods.length > 0) {
      filtered = filtered.filter(appointment => {
        if (!appointment.attributes.field_invoices) return false;
        try {
          const invoices: Invoice[] = JSON.parse(appointment.attributes.field_invoices);
          return invoices.some(invoice => paymentMethods.includes(invoice.paymentMethod));
        } catch (e) {
          console.error('Failed to parse invoices JSON:', e);
          return false;
        }
      });
    }
    if (paidTechniciansFilter.length > 0) {
      filtered = filtered.filter(appointment => {
        if (!appointment.attributes.field_invoices) return false;
        try {
          const invoices: Invoice[] = JSON.parse(appointment.attributes.field_invoices);
          return invoices.some(invoice => paidTechniciansFilter.includes(invoice.hasTechnicianBeenPaid ? 'Yes' : 'No'));
        } catch (e) {
          console.error('Failed to parse invoices JSON:', e);
          return false;
        }
      });
    }

    setFilteredAppointments(filtered);
  };

  useEffect(() => {
    filterByStatusDateAndPaymentMethod();
  }, [statusFilter, dateRange, paymentMethods, appointments, selectedTechnician, paidTechniciansFilter]);

  const initialAcc = {
    totalRevenue: 0,
    totalServiceCall: 0,
    totalExpenses: 0,
    totalDeposits: 0,
    totalLabor: 0,
    totalCallBack: 0,
    companyLaborIncome: 0,
    depositIncome: 0,
    serviceCallIncome: 0,
    callBackIncome: 0,
    totalPartsRevenue: 0,
    partIncome: 0,
    laborExpense: 0,
    depositExpense: 0,
    callBackExpense: 0,
    serviceCallExpense: 0,
    partExpense: 0,
    partCost: 0,
    techSalary: 0,
    totalQuotes: 0,
    totalRefunds: 0,
    /// technician data

    techQuotes: 0,
    techLaborIncome: 0,
    techServiceCallIncome: 0,
    techDepositIncome: 0,
    techCallBackIncome: 0,
    techPartsIncome: 0,
    techTotalIncome: 0,
  };

  const result = filteredAppointments.reduce((acc, appointment) => {
    if (appointment.attributes.field_invoices && appointment.attributes.field_invoices.length > 0) {
      try {
        const invoices: Invoice[] = JSON.parse(appointment.attributes.field_invoices);
        invoices.forEach((invoice: Invoice) => {
          invoice.invoice.forEach((item: InvoiceItem) => {
            processInvoiceItem(item, acc);
          });
        });
      } catch (e) {
        console.error('Failed to parse invoices JSON:', e);
      }
    }
    // Calculate total expenses
    acc.totalExpenses = acc.laborExpense + acc.depositExpense + acc.callBackExpense + acc.serviceCallExpense + acc.partExpense + acc.totalRefunds;
    return acc;
  }, initialAcc);

  const {
    totalRevenue,
    totalServiceCall,
    totalExpenses,
    totalDeposits,
    totalLabor,
    totalCallBack,
    companyLaborIncome,
    depositIncome,
    serviceCallIncome,
    callBackIncome,
    totalPartsRevenue,
    partIncome,
    laborExpense,
    depositExpense,
    callBackExpense,
    serviceCallExpense,
    partExpense,
    partCost,
    techSalary,
    totalQuotes,
    totalRefunds,

    // Tech Income
    techQuotes,
    techLaborIncome,
    techServiceCallIncome,
    techDepositIncome,
    techCallBackIncome,
    techPartsIncome,
    // techTotalIncome,
  } = result;

  const totalCompanyIncome = companyLaborIncome + serviceCallIncome + depositIncome + callBackIncome + partIncome - totalRefunds;

  const techTotalIncome = techLaborIncome + techServiceCallIncome + techDepositIncome + techPartsIncome + techCallBackIncome;

  const handleAppointmentClick = (appointmentId: string) => {
    window.open(`/appointments/show/${appointmentId}`, "_blank");
  };

  const formatTime = (time: string) => {
    return dayjs(time).format('MM/DD/YYYY - hh:mm A');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: ['attributes', 'title'],
      key: 'title',
      render: (text: string) => capitalizeTitle(text).replace(/_/g, " "),
    },
    {
      title: 'Status',
      dataIndex: ['attributes', 'field_status'],
      key: 'status',
    },
    {
      title: 'Start Time',
      dataIndex: ['attributes', 'field_appointment_start'],
      key: 'start',
      render: (text: string, record: any) => formatTime(record.attributes.field_appointment_start),
    },
    {
      title: 'End Time',
      dataIndex: ['attributes', 'field_appointment_end'],
      key: 'end',
      render: (text: string) => formatTime(text),
    },
  ];

  const revenueColumns = [
    { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
  ];

  const revenueData = [
    { metric: 'Quotes', amount: totalQuotes, key: 'totalQuotes' },
    { metric: 'Total Labor', amount: totalLabor },
    { metric: 'Total Service Calls', amount: totalServiceCall },
    { metric: 'Total Deposits', amount: totalDeposits },
    { metric: 'Total Call Backs', amount: totalCallBack },
    { metric: 'Total Company Parts', amount: totalPartsRevenue },
    { metric: 'Total Refunds', amount: totalRefunds, key: 'totalRefunds' },
    { metric: 'Total Revenue', amount: totalRevenue, key: 'totalRevenue' },
  ];

  const incomeColumns = [
    { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
  ];

  const incomeData = [
    ...(currentRole?.role === "technician" ? [{ metric: 'Quotes', amount: totalQuotes, key: 'totalQuotes' }] : []),
    { metric: 'Labor Income', amount: currentRole?.role === "technician" ? techLaborIncome : companyLaborIncome },
    { metric: 'Service Call Income', amount: currentRole?.role === "technician" ? techServiceCallIncome : serviceCallIncome },
    { metric: 'Deposit Income', amount: currentRole?.role === "technician" ? techDepositIncome : depositIncome },
    { metric: 'Call Back Income', amount: currentRole?.role === "technician" ? techCallBackIncome : callBackIncome },
    { metric: 'Parts Income', amount: currentRole?.role === "technician" ? techPartsIncome : partIncome },
    { metric: 'Refunds', amount: totalRefunds, key: 'totalRefunds' },
    { metric: currentRole?.role === "technician" ? "Total Income" : 'Total Company Income', amount: currentRole?.role === "technician" ? techTotalIncome : totalCompanyIncome, key: 'totalCompanyIncome' },
  ];
  

  const expenseColumns = [
    { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
  ];

  const expenseData = [
    { metric: 'Labor', amount: laborExpense },
    { metric: 'Deposits', amount: depositExpense },
    { metric: 'Call Backs', amount: callBackExpense },
    { metric: 'Service Calls', amount: serviceCallExpense },
    { metric: 'Parts', amount: partExpense, key: 'partExpense', partCost, techSalary },
    { metric: 'Refunds', amount: totalRefunds, key: 'totalRefunds' },
    { metric: 'Total Expenses', amount: totalExpenses, key: 'totalExpenses' }
  ];

  const rowClassName = (record: any) => {
    if (record.key === 'totalRevenue') {
      return 'total-revenue-row';
    } else if (record.key === 'totalCompanyIncome') {
      return 'total-company-income-row';
    } else if (record.key === 'totalExpenses') {
      return 'total-company-expenses-row';
    } else if (record.key === 'totalQuotes') {
      return 'total-quotes-row';
    } else if (record.key === 'totalRefunds') {
      return 'total-refunds-row';
    }
    return '';
  };

  return (
    <Layout className="dashboard-page">
      <Content className="content">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {/* {currentRole?.role === "administrator" ?
              () : "Technician View"} */}
            <FilterPanel
              handleStatusChange={handleStatusChange}
              handleDateChange={handleDateChange}
              handlePaymentMethodChange={handlePaymentMethodChange}
              handleTechnicianChange={handleTechnicianChange}
              handlePaidTechniciansChange={handlePaidTechniciansChange}
              setShowRevenue={setShowRevenue}
              setShowIncome={setShowIncome}
              filteredAppointments={filteredAppointments}
              technicians={technicians}
              currentRole={currentRole}
            />
          </Col>
          <Col span={24}>
            <CompanyIncomeExpenses
              currentRole={currentRole}
              showRevenue={showRevenue}
              showIncome={showIncome}
              isLoading={isLoading}
              error={error}
              revenueData={revenueData}
              incomeData={incomeData}
              expenseData={expenseData}
              rowClassName={rowClassName}
              revenueColumns={revenueColumns}
              incomeColumns={incomeColumns}
              expenseColumns={expenseColumns}
            />
          </Col>
          <Col span={24}>
            <Card title="Appointments List" className="appointments-card">
              {isLoading && <Spin size="large" />}
              {error && <Alert message="Error" description={error} type="error" showIcon />}
              {!isLoading && !error && (
                <Table
                  dataSource={filteredAppointments}
                  columns={columns}
                  rowKey="id"
                  onRow={(record) => ({
                    onClick: () => handleAppointmentClick(record.id),
                  })}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};
