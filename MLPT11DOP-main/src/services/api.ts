
export interface PredictionInput {
    cases_lag1: number;
    cases_lag2: number;
    cases_lag4: number;
    rolling_avg_4: number;
    rolling_avg_12: number;
    month: number;
    year: number;
    quarter: number;
    growth_rate: number;
}

export interface PredictionOutput {
    predicted_cases: number;
    severity: string;
}

export interface DiseaseMetric {
    Disease: string;
    MAE: number;
    RMSE: number;
    ModelPerformance: number;
    "Best Model": string;
}

export interface HistoricalDataPoint {
    date: string;
    state: string;
    cases: number;
    rolling_avg_12: number;
}

export interface HistoricalResponse {
    data: HistoricalDataPoint[];
    states: string[];
    selected_state: string;
}

const API_BASE = "/api";

export const api = {
    getHealth: async () => {
        const res = await fetch(`${API_BASE}/health`);
        return res.json();
    },

    getDiseases: async (): Promise<{ diseases: string[] }> => {
        const res = await fetch(`${API_BASE}/diseases`);
        return res.json();
    },

    getPerformanceMetrics: async (): Promise<DiseaseMetric[]> => {
        const res = await fetch(`${API_BASE}/performance`);
        return res.json();
    },

    getHistoricalTrends: async (disease: string, state?: string): Promise<HistoricalResponse> => {
        const url = new URL(`${window.location.origin}${API_BASE}/history/${disease}`);
        if (state) url.searchParams.append("state", state);
        const res = await fetch(url.toString());
        return res.json();
    },

    getMapData: async (disease: string): Promise<{ state_totals: Record<string, number> }> => {
        const res = await fetch(`${API_BASE}/map-data/${disease}`);
        return res.json();
    },

    predictOutbreak: async (disease: string, input: PredictionInput): Promise<PredictionOutput> => {

        const res = await fetch(`${API_BASE}/predict/${disease}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Prediction failed");
        return res.json();
    }
};
