import { useState } from 'react';
import { message, FormInstance } from 'antd';

interface ClientData {

   data: {
    id?: string
    type: string,
    attributes: object
   }
}

interface useUpdateTechnicianResult {
    updateTechnician: (data: ClientData, form: FormInstance) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    csrfToken: string | null; // Add this to hold the CSRF token
}

export const useUpdateTechnician = (): useUpdateTechnicianResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

    const updateTechnician = async (data: ClientData, form: FormInstance) => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch CSRF token from the server
            const tokenResponse = await fetch('/session/token?_format=json');
            if (!tokenResponse.ok) {
                throw new Error('Failed to fetch CSRF token');
            }
            const token = await tokenResponse.text(); // Get the CSRF token as text
            setCsrfToken(token); // Store the CSRF token
            const method = 'PATCH' // Determine method based on presence of an ID
            const url = `/jsonapi/user/user/${data.data.id}`
                console.log(method)
            const response = await fetch(url, {
                method: method,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json',
                    'X-CSRF-Token': token // Use the fetched CSRF token
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(data.data.id ? 'Failed to update technician' : 'Failed to create technician');
            }

            const responseData = await response.json();
            message.success(data.data.id ? "Client updated successfully" : "Client created successfully");
            form.resetFields();
        } catch (error: any) {
            console.error(data.data.id ? "Error updating technician:" : "Error creating technician:", error);
            message.error(data.data.id ? "Failed to update technician" : "Failed to create technician");
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { updateTechnician, isLoading, error, csrfToken }; // Return the CSRF token in the hook result
};
