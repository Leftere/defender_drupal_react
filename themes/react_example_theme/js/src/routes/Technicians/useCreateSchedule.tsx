import { useState } from 'react';
import { message, FormInstance } from 'antd';

interface ScheduleData {

    data: {
        id?: string
        type: string,
        attributes: object
    }
}

interface UseCreateClientResult {
    createSchedule: (data: ScheduleData) => Promise<void>;
    isLoading: boolean;
    error: Error | null;
    csrfToken: string | null; // Add this to hold the CSRF token
}

export const useCreateSchedule = (): UseCreateClientResult => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

    const createSchedule = async (data: ScheduleData) => {
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
            const method = "PATCH"; // Determine method based on presence of an ID
            const url = `/jsonapi/user/user/${data.data.id}`

            console.log(" i am here")
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
                throw new Error(data.data.id ? 'Failed to update schedule' : 'Failed to create schedule');
            }

            const responseData = await response.json();
            message.success(data.data.id ? "Schedule updated successfully" : "Schedule created successfully");

        } catch (error: any) {
            console.error(data.data.id ? "Error updating Schedule:" : "Error creating Schedule:", error);
            message.error(data.data.id ? "Failed to update Schedule" : "Failed to create Schedule");
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return { createSchedule, isLoading, error, csrfToken }; // Return the CSRF token in the hook result
};
