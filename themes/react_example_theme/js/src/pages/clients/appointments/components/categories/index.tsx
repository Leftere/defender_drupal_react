import React from "react";

import { useModal } from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";

import { FlagOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Skeleton, theme } from "antd";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
// import { Text } from "../";
// import { EVENT_CATEGORIES_QUERY } from "@/graphql/queries";
// import { EventCategoriesQuery } from "@/graphql/types";

import styles from "./index.module.css";

type CalendarCategoriesProps = {
  onChange?: (e: CheckboxChangeEvent) => void;
};

type Category = {
  id: string,
  title: string
}



export const CalendarCategories: React.FC<CalendarCategoriesProps> = ({
  onChange,
  ...rest
}) => {
  const { token } = theme.useToken();
  const { modalProps, show, close } = useModal();

  const { data, isLoading } = useList<GetFieldsFromList<{ categories: { nodes: Category[] } }>>({
    resource: "categories",
    // meta: {
    //   gqlQuery: EVENT_CATEGORIES_QUERY,
    // },
  });


  return (
    <>
      <Card
        title={
          <span>
            <FlagOutlined style={{ color: token.colorPrimary, marginRight: ".5rem" }} />
            {/* <Text size="sm" style={{ marginLeft: ".5rem" }}>
              Categories
            </Text> */}
            Filter by status
          </span>
        }
        // extra={
        //   <Button
        //     shape="circle"
        //     onClick={() => show()}
        //     icon={<SettingOutlined />}
        //   />
        // }
        bodyStyle={{
          padding: "0.5rem 1rem",
        }}
        {...rest}
      >
        <div className={styles.container}>
          {isLoading && (
            <Skeleton
              loading={isLoading}
              active
              paragraph={{
                rows: 3,
                width: 200,
              }}
            />
          )}
          {data?.data.map((item) => (
            <div key={item.id} className={styles.category}>
              <Checkbox
                className={styles.checkbox}
                value={item.title}
                onChange={onChange}
                style={{width: "100%"}}
              >
                <div >  {item.title} </div>
              </Checkbox>
              <div className={styles.colorBox} style={{
                  backgroundColor: item.title === "Scheduled" ? "#fa8c16" : item.title === "In Progress" ? "#f5222d" : item.title === "Completed" ? "#52c41a" : "blue"
                }}></div>
            </div>
          ))}
        </div>
      </Card>

      {/* <CalendarManageCategories {...modalProps} saveSuccces={() => close()} /> */}
    </>
  );
};
