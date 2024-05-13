import { Button, Col, Row } from "antd";
import { Calendar, CalendarCategories } from "./components";
import CreateAppointment from "./CreateAppointment1";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusSquareOutlined } from "@ant-design/icons";
const AppointmentsWrapper: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate()
  const showModal = () => {
    setOpen(true);
  };

  const [selectedEventCategory, setSelectedEventCategory] = useState<string[]>(
    [],
  );


  const handleCancel = () => {

    setOpen(false);
  };
  return (
    <div className="page-container">
      <Row gutter={[32, 32]} style={{ margin: "0" }}>
        <Col xs={24} xl={6}>
          <Button block size="large" type="primary"
            style={{ marginBottom: "1rem" }}
            onClick={() => {
              showModal()
              navigate('/appointments/create')
            }}
          ><PlusSquareOutlined />Create Appointment</Button>
          <CalendarCategories
            onChange={(event) => {
              
              setSelectedEventCategory((prev) => {
                if (prev.includes(event.target.value)) {
                  return prev.filter((item) => item !== event.target.value);
                }

                return [...prev, event.target.value];
              });
            }}
          />

          <CreateAppointment open={open} handleCancel={handleCancel} />
        </Col>
        <Col xs={24} xl={18}>
          <Calendar    categoryId={selectedEventCategory}/>
        </Col>
      </Row>
    </div>

  )
}

export default AppointmentsWrapper;