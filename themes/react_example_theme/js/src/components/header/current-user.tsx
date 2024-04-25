import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Popover, Typography, message } from "antd";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import CurrentUserProfile from '../../routes/CurrentUserProfile/CurrentUserProfile';

export const CurrentUser: React.FC = () => {
  // const [opened, setOpened] = useState(false);
  const [userName, setUserName ] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const [userId, setUserId] = useState("");
  const [open, setOpen] = useState(false);

 
  const { Text } = Typography;
  const navigate = useNavigate();

  const showDrawer = () => {
    setOpen(true);


  };

  const onClose = () => {
    setOpen(false);
  };

  const fetchCurrentUser = async () => {
    try {
      const response =  await fetch('/current-user');
      
      if (response.ok) {
        const json = await response.json(); // This should have 'await' since response.json() returns a promise
        const user = json.map((user: any) => ({
          name: `${user.field_first_name[0].value} ${user.field_last_name[0].value}`,
          image: user.user_picture[0].url,
          uuid: user.uuid[0].value
        }));

        setUserName(user[0].name)
        setUserAvatar(user[0].image)
        setUserId(user[0].uuid)
      } else {
        console.error('HTTP error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', message.error);
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  },[])

  const user = {
    name: userName,
    src: userAvatar
  }
  const content = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Text
        strong
        style={{
          padding: "12px 20px",
        }}
      >
        {user?.name}
      </Text>
      <div
        style={{
          borderTop: "1px solid #d9d9d9",
          padding: "4px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <Button
          style={{ textAlign: "left" }}
          icon={<SettingOutlined />}
          type="text"
          block
          onClick={() => showDrawer()}
        >
          Account settings
        </Button>
        <Button
          style={{ textAlign: "left" }}
          icon={<LogoutOutlined />}
          type="text"
          danger
          block
          onClick={() => (
            navigate('/user/logout?_format=json&token=logout_token'),
            location.reload()
          )

          }
        >
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <><Popover
      placement="bottomRight"
      content={content}
      trigger="click"
      overlayInnerStyle={{ padding: 0 }}
      overlayStyle={{ zIndex: 999 }}
      style={{ display: "flex", justifyContent: "center", alignItems: "center", alignContent: "center",  }}
    >
      <img src={user.src} style={{ width: "25px", borderRadius: "50%", cursor:"pointer"}} />
    </Popover>
    <CurrentUserProfile open={open} onClose={onClose} userId={userId} userAvatar={userAvatar}/>
    </>
  )
}