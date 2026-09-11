export type E2ECredentials = Readonly<{
  email: string;
  password: string;
}>;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required E2E configuration: ${name}`);
  }
  return value;
}

export function customerCredentials(): E2ECredentials {
  return {
    email: required('E2E_CUSTOMER_EMAIL'),
    password: required('E2E_CUSTOMER_PASSWORD'),
  };
}

export function secondCustomerCredentials(): E2ECredentials {
  return {
    email: required('E2E_CUSTOMER_B_EMAIL'),
    password: required('E2E_CUSTOMER_B_PASSWORD'),
  };
}

export function adminCredentials(): E2ECredentials {
  return {
    email: required('E2E_ADMIN_EMAIL'),
    password: required('E2E_ADMIN_PASSWORD'),
  };
}
