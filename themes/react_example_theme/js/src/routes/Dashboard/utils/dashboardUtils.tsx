import dayjs from 'dayjs';

export const totalCompanyIncome = (
  companyLaborIncome: number,
  serviceCallIncome: number,
  depositIncome: number,
  callBackIncome: number,
  partIncome: number,
  totalRefunds: number
) => {
  return companyLaborIncome + serviceCallIncome + depositIncome + callBackIncome + partIncome - totalRefunds;
};

export const handleAppointmentClick = (appointmentId: string) => {
  window.open(`/appointments/show/${appointmentId}`, '_blank');
};

export const formatTime = (time: string) => {
  return dayjs(time).format('MM/DD/YYYY - hh:mm A');
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

export const getColumns = (capitalizeTitle: (title: string) => string, formatTime: (time: string) => string) => {
  return [
    {
      title: 'Title',
      dataIndex: ['attributes', 'title'],
      key: 'title',
      render: (text: string) => capitalizeTitle(text).replace(/_/g, ' '),
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
};

export const getRevenueColumns = (formatCurrency: (value: number) => string) => {
  return [
    { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
  ];
};

export const getIncomeColumns = (formatCurrency: (value: number) => string) => {
  return [
    { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
  ];
};

export const getExpenseColumns = (formatCurrency: (value: number) => string) => {
  return [
    { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
  ];
};
