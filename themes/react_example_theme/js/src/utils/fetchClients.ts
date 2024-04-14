import { useState } from 'react';
import { message, FormInstance } from 'antd';

interface ClientData {
    // Define the structure of your client data here
}

interface UseCreateClientResult {
    createClient: (data: ClientData, form: FormInstance) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    csrfToken: string | null; // Add this to hold the CSRF token
}

export const useCreateClient = (): UseCreateClientResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

    const createClient = async (data: ClientData, form: FormInstance) => {
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

            const response = await fetch('https://defender.ddev.site/jsonapi/node/clients', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json',
                    'X-CSRF-Token': token // Use the fetched CSRF token
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to create client');
            }

            const responseData = await response.json();
            message.success("Client created successfully");
            form.resetFields();
        } catch (error: any) {
            console.error("Error creating client:", error);
            message.error("Failed to create client");
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { createClient, isLoading, error, csrfToken }; // Return the CSRF token in the hook result
};
