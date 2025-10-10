import { useState, useEffect } from "react";

// Types for billing data
export interface BillingData {
  balance: number;
  currentPlan: {
    name: string;
    costPerToken: number;
  };
  interactions: {
    total: number;
    limit: number;
  };
  connectedStores: number;
  customers: number;
  cards: Array<{
    id: string;
    brand: string;
    last4: string;
    expiry: string;
    name: string;
    isDefault: boolean;
  }>;
  billingHistory: Array<{
    id: string;
    transactionRef: string;
    type: string;
    date: string;
    status: string;
    amount: string;
  }>;
}

// Mock data - replace with actual API calls
const mockBillingData: BillingData = {
  balance: 25.5,
  currentPlan: {
    name: "Starter",
    costPerToken: 0.009,
  },
  interactions: {
    total: 150,
    limit: 300,
  },
  connectedStores: 1,
  customers: 45,
  cards: [
    {
      id: "1",
      brand: "visa",
      last4: "4242",
      expiry: "12/25",
      name: "John Doe",
      isDefault: true,
    },
  ],
  billingHistory: [
    {
      id: "1",
      transactionRef: "TXN-001",
      type: "top_up",
      date: "2024-10-01",
      status: "successful",
      amount: "$25.00",
    },
    {
      id: "2",
      transactionRef: "TXN-002",
      type: "plan_upgrade",
      date: "2024-09-15",
      status: "successful",
      amount: "$19.99",
    },
  ],
};

export function useBillingData() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real implementation, this would be:
        // const response = await fetch('/api/billing');
        // const data = await response.json();

        setData(mockBillingData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch billing data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = () => {
    // Trigger data refetch
    setLoading(true);
    setTimeout(() => {
      setData({ ...mockBillingData });
      setLoading(false);
    }, 500);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Hook for top-up functionality
export function useTopUp() {
  const [loading, setLoading] = useState(false);

  const topUp = async (amount: number) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation:
      // await fetch('/api/billing/top-up', {
      //   method: 'POST',
      //   body: JSON.stringify({ amount }),
      // });

      console.log(`Successfully topped up $${amount}`);
      return { success: true };
    } catch (error) {
      console.error("Top-up failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    topUp,
    loading,
  };
}

// Hook for adding payment cards
export function useAddCard() {
  const [loading, setLoading] = useState(false);

  const addCard = async (cardData: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation:
      // await fetch('/api/billing/cards', {
      //   method: 'POST',
      //   body: JSON.stringify(cardData),
      // });

      console.log("Successfully added card:", cardData);
      return { success: true };
    } catch (error) {
      console.error("Add card failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addCard,
    loading,
  };
}

// Hook for changing plans
export function useChangePlan() {
  const [loading, setLoading] = useState(false);

  const changePlan = async (planId: string, planName: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real implementation:
      // await fetch('/api/billing/change-plan', {
      //   method: 'POST',
      //   body: JSON.stringify({ planId }),
      // });

      console.log(`Successfully changed to ${planName} plan`);
      return { success: true };
    } catch (error) {
      console.error("Plan change failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    changePlan,
    loading,
  };
}
