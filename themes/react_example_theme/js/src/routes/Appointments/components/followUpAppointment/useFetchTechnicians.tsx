import { useState, useEffect } from "react";
import dayjs from "dayjs";

interface Technician {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  schedule: { [key: string]: string[] };
}

export const useFetchTechnicians = (techZipCode: string) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      if (!techZipCode) {
        console.log("Tech Zip Code is null, skipping fetch.");
        return; // Early exit if techZipCode is null
      }

      setIsLoading(true); // Start loading state
      try {
        const response = await fetch(`/jsonapi/user/user`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const mappedTechnicians = json.data
          .filter((item: any) => item.attributes.display_name !== 'Anonymous') // Exclude anonymous users
          .map((item: any, index: any) => {
            let zipCodes = [];
            let schedule = {};
            try {
              zipCodes = JSON.parse(item.attributes.field_zip_codes).map(String);
              schedule = JSON.parse(item.attributes.field_schedule);
            } catch (parseError) {
              console.error('Failed to parse zip codes:', parseError);
            }

            if (!zipCodes.includes(techZipCode.toString())) {
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
              schedule: schedule,
              skills: item.attributes.field_skills,
              zipCodes: zipCodes
            };
          })
          .filter((technician: any) => technician !== null); // Remove any null entries resulting from zip code mismatches

        setTechnicians(mappedTechnicians); // Update state with filtered and mapped technicians
      } catch (error) {
        console.error('Failed to fetch technicians:', error);
      } finally {
        setIsLoading(false); // End loading state
      }
    };

    fetchTechnicians();
  }, [techZipCode]);

  return { technicians, isLoading };
};
