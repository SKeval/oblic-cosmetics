import React, { createContext, useContext, useEffect, useState } from "react";
import { getCustomerToken, setCustomerToken, customerLogin, customerRegister, customerMe } from "../api";

const CustomerContext = createContext();
export const useCustomer = () => useContext(CustomerContext);

export function CustomerProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) { setLoading(false); return; }
    customerMe()
      .then((data) => setCustomer(data))
      .catch(() => { setCustomerToken(null); setCustomer(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await customerLogin(email, password);
    setCustomerToken(data.token);
    setCustomer({ email: data.email, name: data.name });
  };

  const register = async (name, email, password) => {
    const data = await customerRegister(name, email, password);
    setCustomerToken(data.token);
    setCustomer({ email: data.email, name: data.name });
  };

  const logout = () => {
    setCustomerToken(null);
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </CustomerContext.Provider>
  );
}
