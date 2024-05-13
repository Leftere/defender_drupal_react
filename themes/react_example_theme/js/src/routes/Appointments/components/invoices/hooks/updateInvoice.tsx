import { useState } from 'react';
import { message, FormInstance } from 'antd';

interface InvoiceData {

   data: {
    id?: string
    type: string,
    attributes: object
   }
}

interface UseCreateInvoiceResult {
    updateInvoice: (data: InvoiceData, form: FormInstance) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    csrfToken: string | null; // Add this to hold the CSRF token
}

export const useUpdateInvoice = (): UseCreateInvoiceResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

    const updateInvoice = async (data: InvoiceData, form: FormInstance) => {
        setIsLoading(true);
        setError(null);
        console.log("hello world")
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
                ? `/jsonapi/node/appointment1/${data.data.id}`
                : '/jsonapi/node/appointment1';
                console.log(data)
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
                throw new Error(data.data.id ? 'Failed to update Invoice' : 'Failed to create Invoice');
            }

            const responseData = await response.json();
            message.success(data.data.id ? "Invoice updated successfully" : "Invoice created successfully");
            form.resetFields();
        } catch (error: any) {
            console.error(data.data.id ? "Error updating Invoice:" : "Error creating Invoice:", error);
            message.error(data.data.id ? "Failed to update Invoice" : "Failed to create Invoice");
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { updateInvoice, isLoading, error, csrfToken }; // Return the CSRF token in the hook result
};
