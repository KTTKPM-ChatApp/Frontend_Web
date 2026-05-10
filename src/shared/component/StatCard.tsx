"use client"

import { Box, Grid, Stack, styled, Typography } from "@mui/material";

interface StatCardProps {
    title: string;
    subTitle?: string;
    titleColor?: string;
    leftHighlight: {
        value: string;
        label: string;
    };

    rightHighlight?: {
        value: string;
        label: string;
    };

    size?: number;
}

export const TitleText = styled(Typography)(({ theme }) => ({
    fontSize: "32px",
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    marginTop:"32px"
}));
export const SubTitleText = styled(Typography)(({ theme }) => ({
    fontSize: "16px",
    fontWeight: "500",
    paddingBottom:"32px"
}))
export const TextSatistics = styled(Typography)({
    color: "#0068FF",
    fontSize: "64px",
    margin: 0,
    lineHeight: 1,
})
export const StatBox = styled(Box)({
    height: "100%",
    backgroundColor: "#fff",
    textAlign: "left",
    padding:"0px 32px",
})
const StatGrid = styled(Grid)({
    width:"100%",
    height:"100%",
    boxSizing:"border-box",
    maxHeight:"350px"
})
const StatCard = ({
    title,
    subTitle,
    titleColor = "text.secondary",
    leftHighlight,
    rightHighlight,
    size = 6,
}: StatCardProps) => {
    const hasRight = Boolean(rightHighlight);

    return (
        <StatGrid  size={size} >
            <StatBox sx={{ height: "100%" }}>
                <Stack height="100%" justifyContent="space-between">

                    <Box>
                        <TitleText>{title}</TitleText>
                        <SubTitleText color={titleColor}>
                            {subTitle}
                        </SubTitleText>
                    </Box>

                    <Grid container width="100%" >
                        <Grid size={hasRight ? 6 : 12}>
                            <Stack>
                                <TextSatistics>{leftHighlight.value}</TextSatistics>
                                <SubTitleText color="text.primary">
                                    {leftHighlight.label}
                                </SubTitleText>
                            </Stack>
                        </Grid>

                        {hasRight && (
                            <Grid size={6}>
                                <Stack>
                                    <TextSatistics>{rightHighlight!.value}</TextSatistics>
                                    <SubTitleText color="text.primary">
                                        {rightHighlight!.label}
                                    </SubTitleText>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>

                </Stack>
            </StatBox>
        </StatGrid>
    );
};



export default StatCard