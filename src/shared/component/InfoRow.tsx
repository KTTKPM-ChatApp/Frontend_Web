import { Box, styled, Typography } from "@mui/material";

export interface InfoRowProps {
    label: string;
    value: string;
}
const BoxInfo = styled(Box)({
    width: "100%",
    display: "flex",
    gap:"24px"
})
const InfoRow = ({ label, value }: InfoRowProps) => {
    return (
        <BoxInfo >
            <Typography minWidth="80px" fontWeight={500} fontSize={14} color="text.secondary">
                {label}
            </Typography>
            <Typography fontSize={14} fontWeight={500}>
                {value}
            </Typography>
        </BoxInfo>
    );
}

export default InfoRow;