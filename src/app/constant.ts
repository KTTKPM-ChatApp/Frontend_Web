import { styled } from "@mui/material/styles";
import { Box, Tab, Typography, Grid } from "@mui/material";
import { FilterCategoryKey } from "../../src/app/(page)/me/page";

export interface Country {
    code: string;
    name: string;
    dial: string;
}
export const RESPONSE_PAYLOAD_DATA_PATH = ["payload", "Data"];
export const COUNTRIES: Country[] = [
    { code: "VN", name: "Vietnam", dial: "+84" },
    { code: "AF", name: "Afghanistan", dial: "+93" },
    { code: "AL", name: "Albania", dial: "+355" },
    { code: "DZ", name: "Algeria", dial: "+213" },
    { code: "AS", name: "American Samoa", dial: "+1684" },
    { code: "AD", name: "Andorra", dial: "+376" },
    { code: "AO", name: "Angola", dial: "+244" },
    { code: "AI", name: "Anguilla", dial: "+1264" },
    { code: "AR", name: "Argentina", dial: "+54" },
    { code: "AU", name: "Australia", dial: "+61" },
    { code: "AT", name: "Austria", dial: "+43" },
    { code: "BD", name: "Bangladesh", dial: "+880" },
    { code: "BE", name: "Belgium", dial: "+32" },
    { code: "BR", name: "Brazil", dial: "+55" },
    { code: "CA", name: "Canada", dial: "+1" },
    { code: "CN", name: "China", dial: "+86" },
    { code: "FR", name: "France", dial: "+33" },
    { code: "DE", name: "Germany", dial: "+49" },
    { code: "HK", name: "Hong Kong", dial: "+852" },
    { code: "IN", name: "India", dial: "+91" },
    { code: "ID", name: "Indonesia", dial: "+62" },
    { code: "IT", name: "Italy", dial: "+39" },
    { code: "JP", name: "Japan", dial: "+81" },
    { code: "KR", name: "South Korea", dial: "+82" },
    { code: "LA", name: "Laos", dial: "+856" },
    { code: "MY", name: "Malaysia", dial: "+60" },
    { code: "PH", name: "Philippines", dial: "+63" },
    { code: "SG", name: "Singapore", dial: "+65" },
    { code: "TH", name: "Thailand", dial: "+66" },
    { code: "UK", name: "United Kingdom", dial: "+44" },
    { code: "US", name: "United States", dial: "+1" },
];

export const categories: FilterCategoryKey[] = [
    "Customer",
    "Family",
    "Work",
    "Friends",
    "Reply later",
    "Colleague",
    "Other",
];
export const categoryColors: Record<FilterCategoryKey, string> = {
    Customer: "rgb(217, 27, 27)",
    Family: "rgb(243, 27, 200)",
    Work: "rgb(255, 105, 5)",
    Friends: "rgb(255, 105, 5)",
    "Reply later": "rgb(75, 195, 119)",
    Colleague: "rgb(0, 104, 255)",
    Other: "black",
};
export const SIDEBAR_KEYS = [
    "chat",
    "contact",
    "cloud",
    "folder",
    "chatbot",
    "business",
    "settings",
] as const;
export type SidebarKey = typeof SIDEBAR_KEYS[number];
