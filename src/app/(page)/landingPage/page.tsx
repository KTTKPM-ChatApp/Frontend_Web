"use client";

import styled from "@emotion/styled";
import {
    Box,
    Container,
    Grid,
    IconButton,
    Link,
    Stack,
    Tab,
    Typography,
} from "@mui/material";
import Image from "next/image";
import React from "react";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import HomeTab from "./components/HomeTab";
import ProductTab from "./components/ProductTab";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { useTranslation } from "react-i18next";

export const HeaderLandingStyled = styled(Box)({
    minHeight: "10vh",
    padding: "16px 32px",
    display: "grid",                    
    gridTemplateColumns: "auto 1fr auto", 
    alignItems: "center",
    gap: "24px",

    marginBottom: "48px",
});


const TabLandingStyled = styled(TabList)({
    width: "fit-content",
    maxWidth: "100%",
    "& .MuiTabs-flexContainer": {
        gap: "32px",
    },
    "& .MuiTab-root": {
        fontSize: "16px",
        color: "#262626",
        textTransform: "none",
        fontWeight: 500,
        minHeight: 48,
        minWidth: "auto",
        padding: "12px 0",
        whiteSpace: "nowrap",
    },
    "& .MuiTabs-indicator": {
        backgroundColor: "#2563eb",
        height: "2px",
        bottom: "8px",
    },
    "& .MuiTouchRipple-root": {
        display: "none",
    },
    "& .MuiTab-root.Mui-selected": {
        backgroundColor: "transparent",
        color: "#262626",
    },
});
const BoxIcon = styled(Box)({
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
});

const StackAdress = styled(Stack)({
    borderBottom: "1px solid #E5E7EB",
    paddingBottom: "24px",
});

const LinkStyled = styled(Link)({
    color: "black",
    textDecoration: "none",
    "&:hover": {
        textDecoration: "underline",
        textDecorationColor: "black",
    },
});

const ContainerLink = styled(Container)({
    padding: "0px 54px",
    backgroundColor: "#F6F7F9",
});

const LandingPage = () => {
    const [tabs, setTabs] = React.useState("home");
    const t = useTrans();
    const { i18n } = useTranslation();

    const handleLanguageToggle = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const handleChangeTabs = (_event: React.SyntheticEvent, newTab: string) => {
        setTabs(newTab);
    };

    return (
        <Stack>
            <TabContext value={tabs}>
                <Stack>
                    <HeaderLandingStyled>
                        <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                            <Image
                                src="/images/logo-zalo.svg"
                                alt="logo-zalo"
                                width={85}
                                height={50}
                            />
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "center",
                                minWidth: 0,
                                overflow: "hidden",
                            }}
                        >
                            <TabLandingStyled
                                // value={tabs}
                                onChange={handleChangeTabs}
                                variant="scrollable"
                                scrollButtons="auto"
                            >
                                <Tab label={t("LANDING.TAB_HOME")} value="home" />
                                <Tab label={t("LANDING.TAB_PRODUCTS")} value="products" />
                                <Tab label={t("LANDING.TAB_AI")} value="ai" />
                                <Tab label={t("LANDING.TAB_IMPACT")} value="impact" />
                                <Tab label={t("LANDING.TAB_ABOUT")} value="about" />
                            </TabLandingStyled>

                        </Box>

                        <BoxIcon>
                            <IconButton onClick={handleLanguageToggle}>
                                <LanguageOutlinedIcon />
                            </IconButton>
                        </BoxIcon>
                    </HeaderLandingStyled>

                    <Box>
                        <TabPanel sx={{ p: 0 }} value="home">
                            <HomeTab />
                        </TabPanel>
                        <TabPanel sx={{ p: 0 }} value="products">
                            <ProductTab />
                        </TabPanel>
                        <TabPanel sx={{ p: 0 }} value="ai">
                            AI content
                        </TabPanel>
                        <TabPanel sx={{ p: 0 }} value="impact">
                            Impact content
                        </TabPanel>
                        <TabPanel sx={{ p: 0 }} value="about">
                            About content
                        </TabPanel>
                    </Box>
                </Stack>
            </TabContext>

            <Box bgcolor="#F6F7F9" padding="40px 0px">
                <ContainerLink disableGutters>
                    <Stack spacing={3}>
                        <StackAdress spacing={2}>
                            <Image
                                src="https://zalo-site.zadn.vn/_next/static/media/logo.a68785cd.svg"
                                alt="logo-zalo"
                                width={85}
                                height={50}
                            />
                            <Typography marginBottom="16px" variant="body1">
                                {t("LANDING.FOOTER_ADDRESS")}
                            </Typography>
                        </StackAdress>

                        <Grid container spacing={3}>
                            <Grid size={4}>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    {t("LANDING.FOOTER_SOLUTIONS")}
                                </Typography>
                                <Stack spacing={2}>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.ZALO_AI")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.BUSINESS_SOLUTION")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.DIGITAL_TRANSFORMATION")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.ADTIMA")}
                                    </LinkStyled>
                                </Stack>
                            </Grid>

                            <Grid size={4}>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    {t("LANDING.FOOTER_SUPPORT")}
                                </Typography>
                                <Stack spacing={2}>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.USER_SUPPORT")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.DEVELOPER_SUPPORT")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.SECURITY")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.REPORT_VIOLATION")}
                                    </LinkStyled>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.CONTACT")}
                                    </LinkStyled>
                                </Stack>
                            </Grid>

                            <Grid size={4}>
                                <Typography variant="h6" fontWeight={600} mb={2}>
                                    {t("LANDING.FOOTER_ZALO")}
                                </Typography>

                                <Stack spacing={2}>
                                    <LinkStyled href="#" variant="body1">
                                        {t("LANDING.RECRUITMENT")}
                                    </LinkStyled>

                                    <Typography variant="h6" fontWeight={600} mb={2} mt={1}>
                                        {t("LANDING.FOOTER_DOWNLOAD")}
                                    </Typography>

                                    <Stack spacing={2}>
                                        <LinkStyled href="#" variant="body1">
                                            {t("LANDING.ZALO_PC")}
                                        </LinkStyled>
                                        <LinkStyled href="#" variant="body1">
                                            {t("LANDING.ZALO_WEB")}
                                        </LinkStyled>
                                    </Stack>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Stack>
                </ContainerLink>
            </Box>
        </Stack>
    );
};

export default LandingPage;
