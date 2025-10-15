import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";

// Types for billing data
export interface BillingData {
  balance: string;
  currentPlan: {
    name: string;
    costPerToken: string;
  };
  interactions: {
    total: number;
    limit: number;
    cost: number;
    tokenBalance: number;
  };
  connectedStores: {
    active: number;
    inactive: number;
    total: number;
  };
  customers: number;
  extraBundle: boolean;
  extraBundleCost: string;
}

export function useBillingData() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getBillingData();

      if (response.status_code === 200) {
        // Transform API response to match component structure
        setData({
          balance: response.data.balance,
          currentPlan: {
            name: response.data.current_plan.name,
            costPerToken: response.data.current_plan.cost_per_token,
          },
          interactions: {
            total: response.data.total_store_interactions,
            limit: 300, // You may want to get this from the API
            cost: response.data.total_store_interaction_cost,
            tokenBalance: response.data.total_store_interaction_token_balance,
          },
          connectedStores: {
            active: response.data.connected_stores.active,
            inactive: response.data.connected_stores.inactive,
            total: response.data.connected_stores.total_stores,
          },
          customers: response.data.customers,
          extraBundle: response.data.extra_bundle,
          extraBundleCost: response.data.extra_bundle_cost,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch billing data",
      );
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for top-up functionality
export function useTopUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topUp = async (amount: number) => {
    try {
      // Validate minimum amount
      if (amount < 50) {
        throw new Error("Minimum top-up amount is $50");
      }

      setLoading(true);
      setError(null);

      const response = await apiClient.topUpWallet(amount);

      if (response.status_code === 200) {
        console.log(`Successfully topped up $${amount}`);
        return response.data;
      } else {
        throw new Error(response.message || "Top-up failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Top-up failed";
      setError(errorMessage);
      console.error("Top-up failed:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    topUp,
    loading,
    error,
  };
}

// Hook for fetching plans
export function usePlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getPlans();

      if (response.status_code === 200) {
        setPlans(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch plans");
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
}

// Hook for changing plans
export function useChangePlan() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePlan = async (planId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.upgradePlan(planId);

      if (response.status_code === 200) {
        console.log("Successfully upgraded plan");
        return response.data;
      } else {
        throw new Error(response.message || "Plan upgrade failed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Plan change failed";
      setError(errorMessage);
      console.error("Plan change failed:", err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    changePlan,
    loading,
    error,
  };
}
