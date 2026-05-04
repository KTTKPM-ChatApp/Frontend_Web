"use client";

import { Box, Card, styled, Typography } from "@mui/material";
import Image from "next/image";

interface IconAppCardPrps {
    path: string;
    title: string;
    subTitle?: string;
    width?: number;
    height?: number;
}

const CardIconApp = styled(Card)({
    cursor:"pointer",
    minHeight: 280,
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    borderRadius: "0px",
    boxShadow: "none",
    border: "1px solid #f4f4f5",
    "&:hover": {
        boxShadow: "8px 8px 24px rgba(37, 99, 235, 0.15)", 
    },
});

export const BoxIcon = styled(Box)({
    aspectRatio: "1 / 1",
    width: "fit-content",
});
const TitleText = styled(Typography)({
    marginBottom: "0px"
})
const IconAppCard = ({ path, title, width = 60, height = 60, subTitle }: IconAppCardPrps) => {
    return (
        <CardIconApp>
            <BoxIcon>
                <Image src={path} alt={title} width={width} height={height} />
            </BoxIcon>

            <TitleText color="text.primary" variant="h5">
                {title}
            </TitleText>
            <Typography color="text.secondary" variant="body1">{subTitle}</Typography>
        </CardIconApp>
    );
};

export default IconAppCard;
