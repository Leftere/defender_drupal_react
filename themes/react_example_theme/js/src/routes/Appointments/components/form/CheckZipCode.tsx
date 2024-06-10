import { Button, Col, Form, Input, Modal, Row } from "antd";
import { useEffect, useState } from "react";
const { useForm } = Form;

interface ZipCode {
  isModalOpen: boolean;
  handleCancel: () => void;
}

export const CheckZipCode: React.FC<ZipCode> = ({ isModalOpen, handleCancel }) => {
  const [form] = useForm();
  const [zipCode, setZipCode] = useState<string | null>(null);
  const [availableTech, setAvailableTechs] = useState<number | null>(null);

  useEffect(() => {
    if (zipCode) {
      console.log("Zip Code:", zipCode); // This will log every time zipCode changes and is not undefined
    }
  }, [zipCode]);

  const handleSubmit = async (values: any) => {
    setZipCode(values.address.zip);
    try {
      const response = await fetch(`/jsonapi/user/user`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      const mappedTechnicians = json.data
        .filter((item: any) => item.attributes.display_name !== 'Anonymous')  // Exclude anonymous users
        .map((item: any, index: any) => {
          // Safely parse the zip codes or set an empty array if parsing fails
          let zipCodes = [];
          try {
            const zipData = item.attributes.field_zip_code.slice(1, -1); // Corrected slice method to include all characters
            const zipArray = zipData.split(",");
            zipCodes = zipArray.map((zip: any) => zip.trim());
          } catch (parseError) {
            console.error('Failed to parse zip codes:', parseError);
          }

          if (!zipCodes.includes(values.address.zip.toString())) {
            return null;
          }

          return {
            id: (index + 1).toString(),
            uuid: item.id,
            firstName: item.attributes.field_first_name,
            lastName: item.attributes.field_last_name,
            primaryPhone: item.attributes.field_primary_phone,
            salaryRate: item.attributes.field_salary_rate,
            address: `${item.attributes.field_address.address_line1}, ${item.attributes.field_address.locality}, ${item.attributes.field_address.administrative_area}, ${item.attributes.field_address.postal_code}`,
            email: item.attributes.mail,
            skills: item.attributes.field_skills,
            zipCodes: zipCodes
          };
        })
        .filter((technician: any) => technician !== null); 

      setAvailableTechs(mappedTechnicians.length);

    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleCancelWrapper = () => {
    form.resetFields(); // Reset the form fields
    setZipCode(null);
    handleCancel(); // Call the original handleCancel function
  };

  return (
    <>
      <Modal
        onCancel={handleCancelWrapper}
        onOk={handleCancelWrapper}
        open={isModalOpen}
        title="Check for available Technicians"
        footer={[
          <Button key="back" onClick={handleCancelWrapper}>
            Close
          </Button>
        ]}
      >
        <Form
          style={{ width: "100%" }}
          onFinish={handleSubmit}
          form={form}
        >
          <Row gutter={[24, 12]} justify="start">
            <Col lg={12} xs={24}>
              <Form.Item
                label="Zip Code"
                name={["address", "zip"]}
                rules={[
                  { required: true, message: "Please input your zip code!" },
                  { pattern: /^\d{5}$/, message: "Zip code must be 5 digits" }
                ]}
              >
                <Input placeholder="12345" />
              </Form.Item>
            </Col>
            <Col lg={12} xs={24}>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <strong>
          {zipCode == null 
            ? "Please add Zip Code" 
            : `There are ${availableTech} Technicians available in this area.`}
        </strong>
      </Modal>
    </>
  );
};
