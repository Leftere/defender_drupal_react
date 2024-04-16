import { useState } from 'react';
import { message, FormInstance } from 'antd';

interface ClientData {

   data: {
    id?: string
    type: string,
    attributes: object
   }
}

interface UseCreateClientResult {
    createInventory: (data: ClientData, form: FormInstance) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    csrfToken: string | null; // Add this to hold the CSRF token
}

export const useCreateInventory = (): UseCreateClientResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

    const createInventory = async (data: ClientData, form: FormInstance) => {
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
            const method = data.data.id ? 'PATCH' : 'POST'; // Determine method based on presence of an ID
            const url = data.data.id
                ? `/jsonapi/node/inventory/${data.data.id}`
                : '/jsonapi/node/inventory';
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
                throw new Error(data.data.id ? 'Failed to update inventory' : 'Failed to create inventory');
            }

            const responseData = await response.json();
            message.success(data.data.id ? "Inventory updated successfully" : "Inventory created successfully");
            form.resetFields();
        } catch (error: any) {
            console.error(data.data.id ? "Error updating inventory:" : "Error creating inventory:", error);
            message.error(data.data.id ? "Failed to update inventory" : "Failed to create inventory");
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { createInventory, isLoading, error, csrfToken }; // Return the CSRF token in the hook result
};
