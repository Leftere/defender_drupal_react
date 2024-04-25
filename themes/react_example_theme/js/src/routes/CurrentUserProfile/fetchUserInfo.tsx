export const fetchUserInfo = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null); 
}