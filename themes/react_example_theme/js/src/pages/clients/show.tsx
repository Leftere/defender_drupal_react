import { NumberField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from 'react';
const { Title } = Typography;


export const ClientShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;
  const formattedDate = dayjs(record?.clientSince).format('MM/DD/YYYY');
  const statusTitle = record?.status?.title;
console.log(data)
  // const status = data.status.title
  return (
 
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <NumberField value={record?.id ?? ""} />
      <Title level={5}>{"First Name"}</Title>
      <TextField value={record?.firstName} />
      <Title level={5}>{"Last Name"}</Title>
      <TextField value={record?.lastName} />
      <Title level={5}>{"Primary Phone"}</Title>
      <TextField value={record?.primaryPhone} />
      <Title level={5}>{"Client Since"}</Title>
      <TextField value={formattedDate} />
      <Title level={5}>{"Status"}</Title>
      <TextField value={statusTitle} />
      <Title level={5}>{"Email"}</Title>
      <TextField value={record?.email} />
    </Show>
  );
};
