import { Button, Card, Drawer, Skeleton, Space, Spin, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import "./styles.css";
import { CloseOutlined, IdcardOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import TabPane from 'antd/es/tabs/TabPane';
import Scheduler from '../Technicians/Scheduler/Scheduler';
interface CurrentUserProfileProps {
  open: boolean;  // Declare the 'open' prop
  onClose: () => void,
  userId: string,
  userAvatar: string
}

interface User {
  id: string;
  name: string;
  title: string;
  phone: string;
  mail: string
}

const { Title, Text } = Typography;
const CurrentUserProfile: React.FC<CurrentUserProfileProps> = ({ open, onClose, userId, userAvatar }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<User | null>(null);
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`/jsonapi/user/user/${userId}`);

      const json = await response.json();

      console.log(json, "I am user info")

      const { id, type, attributes, relationships } = json.data;

      console.log(json.data)
      setIsLoading(false)

      const mappedUser = {
        id: id,
        name: `${attributes.field_first_name} ${attributes.field_last_name}`,
        title: relationships.roles.data[0].meta.drupal_internal__target_id,
        phone: attributes.field_primary_phone,
        mail: attributes.mail
      }

      setUser(mappedUser)

    } catch (error) {
      console.log(error)
    }
  }

  function formatPhoneNumber(phoneNumber = '') {
    const cleaned = phoneNumber.replace(/\D/g, ''); // Remove all non-digit characters
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return ""; // Or return an unformatted phoneNumber, or handle as needed
  }

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
    }
  }, [userId])
  return (
    <>
      {isLoading ? (
        <Drawer open={open} onClose={onClose}
          width={756}
          bodyStyle={{
            background: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }} >
          <Spin />
        </Drawer>
      ) : (
        <Drawer open={open} onClose={onClose}
          width={960}
          styles={{
            header: { display: 'none' },
            body: { background: "#f5f5f5", padding: 0 },
          }}
        >
          
          <div className="header">
            <Text strong>Account Settings</Text>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => onClose()}
            />
          </div>
          <div className="container">
            <div className="name">
              <img src={userAvatar} style={{ width: "96px", borderRadius: "50%", marginRight: "16px" }} />
              <Title level={3} className="title">{user?.name}</Title>
            </div>
            <Tabs>
              <TabPane tab="User Profile" key="1">
              <Card
           
              headStyle={{ padding: "0 12px" }}
              bodyStyle={{ padding: "0" }}
            >
              <div className="card-container">
                <div className="content">
                  <div className="icon"><IdcardOutlined className="tertiary" /></div>
                  <div className="input">
                    <Text type="secondary" className="skeleton">Title</Text><br />
                    <Text className="title">{user?.title}</Text>
                  </div>
                </div>
              </div>
              <div className="card-container">
                <div className="content">
                  <div className="icon"><PhoneOutlined className="tertiary" /></div>
                  <div className="input">
                    <Text type="secondary" className="skeleton">Phone</Text><br />
                    <Text className="title">{formatPhoneNumber(user?.phone)}</Text>
                  </div>
                </div>
              </div>
              <div className="card-container">
                <div className="content">
                  <div className="icon"><MailOutlined className="tertiary" /></div>
                  <div className="input">
                    <Text type="secondary" className="skeleton">Email</Text><br />
                    <Text >{user?.mail}</Text>
                  </div>
                </div>
              </div>
            </Card>
              </TabPane>
              <TabPane tab="Time Off" key="2">
              <Scheduler technicianId={user?.id} />
              </TabPane>
            </Tabs>
         
          </div>
        </Drawer>
      )}
    </>
  )
}

export default CurrentUserProfile;