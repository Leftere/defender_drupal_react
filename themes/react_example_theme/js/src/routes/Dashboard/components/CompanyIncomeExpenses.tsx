import React from 'react';
import { Card, Typography, Spin, Alert, Table, Tabs } from 'antd';

const { Text } = Typography;
const { TabPane } = Tabs;

interface CompanyIncomeExpensesProps {
  showRevenue: boolean;
  showIncome: boolean;
  isLoading: boolean;
  error: string | null;
  revenueData: any[];
  incomeData: any[];
  expenseData: any[];
  rowClassName: (record: any) => string;
  revenueColumns: any[];
  incomeColumns: any[];
  expenseColumns: any[];
  currentRole: any;
}

export const CompanyIncomeExpenses: React.FC<CompanyIncomeExpensesProps> = ({
  showRevenue,
  showIncome,
  isLoading,
  error,
  revenueData,
  currentRole,
  incomeData,
  expenseData,
  rowClassName,
  revenueColumns,
  incomeColumns,
  expenseColumns,
}) => {


  const expandedRowRender = (record: any) => {
    if (record.key === 'partExpense') {
      return (
        <Table
          columns={[
            { title: 'Metric', dataIndex: 'metric', key: 'metric', width: '70%' },
            { title: 'Amount', dataIndex: 'amount', key: 'amount', width: '30%', render: (text: number) => formatCurrency(text) }
          ]}
          dataSource={[
            { key: 'partCost', metric: 'Part Cost', amount: record.partCost },
            { key: 'techSalary', metric: 'Technician Share', amount: record.techSalary }
          ]}
          pagination={false}
          rowKey="key"
        />
      );
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Income" key="1">
        {showRevenue && (
          <>
            {currentRole?.role === "technician" ? null : (
              <Card>
                <Text strong style={{ display: "block", marginBottom: "1rem" }}>Company Revenue</Text>
                {isLoading && <Spin size="large" />}
                {error && <Alert message="Error" description={error} type="error" showIcon />}
                {!isLoading && !error && (
                  <Table
                    dataSource={revenueData}
                    columns={revenueColumns}
                    pagination={false}
                    rowKey="metric"
                    rowClassName={rowClassName}
                  />
                )}
              </Card>
            )}

          </>

        )}
        {showIncome && (
          <Card>
            <Text strong style={{ display: "block", marginBottom: "1rem" }}>{currentRole?.role === "technician" ? "My Income" : "Company Income"}</Text>
            {isLoading && <Spin size="large" />}
            {error && <Alert message="Error" description={error} type="error" showIcon />}
            {!isLoading && !error && (
              <Table
                dataSource={incomeData}
                columns={incomeColumns}
                pagination={false}
                rowKey="metric"
                rowClassName={rowClassName}
              />
            )}
          </Card>
        )}
      </TabPane>
      {currentRole?.role === "technician" ? null : (
        <TabPane tab="Expenses" key="2">
          <Card>
            {isLoading && <Spin size="large" />}
            {error && <Alert message="Error" description={error} type="error" showIcon />}
            {!isLoading && !error && (
              <Table
                dataSource={expenseData}
                columns={expenseColumns}
                pagination={false}
                rowKey="metric"
                rowClassName={rowClassName}
                expandable={{ expandedRowRender, rowExpandable: record => record.key === 'partExpense' }}
              />
            )}
          </Card>
        </TabPane>
      )}

    </Tabs>
  )
}
