import { useCallback, useState } from "react";
import api from "../api/api";

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, config = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api({
        method,
        url,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";

      setError(message);

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(
    (url, config = {}) => {
      return request("GET", url, null, config);
    },
    [request]
  );

  const post = useCallback(
    (url, data = null, config = {}) => {
      return request("POST", url, data, config);
    },
    [request]
  );

  const put = useCallback(
    (url, data = null, config = {}) => {
      return request("PUT", url, data, config);
    },
    [request]
  );

  const patch = useCallback(
    (url, data = null, config = {}) => {
      return request("PATCH", url, data, config);
    },
    [request]
  );

  const remove = useCallback(
    (url, config = {}) => {
      return request("DELETE", url, null, config);
    },
    [request]
  );

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,

    request,

    get,
    post,
    put,
    patch,
    remove,

    clearError,
  };
};

export default useApi;