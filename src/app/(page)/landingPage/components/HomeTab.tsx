"use client";

import { Button, Card, CardContent, CardMedia, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import StatCard from "@/src/shared/component/StatCard";
import IconAppCard, { BoxIcon } from "@/src/shared/component/IconAppCard";
import { useRouter } from 'next/navigation';
import { useTrans } from "@/src/common/utilities/hook/trans";

export const ContentSection = styled(Stack)({
    alignItems: 'center',
    textAlign: 'center',
    padding: "24px"
});
export const HeadingSection = styled(Typography)({
    color: '#292929',
    alignItems: 'center',
    justifyItems: 'center',
})
export const SubHeadingSection = styled(Typography)({
    color: '#292929',
    lineHeight: 1.25,
    fontWeight: 500,
});
const StackVideo = styled(Stack)({
    margin: '60px 0px',
});

export const BoxMedia = styled(Box)({
    position: "relative",
    minHeight: "300px",
    width: "100%",
    overflow: "hidden",
    borderRadius: "8px",
    cursor: "pointer",
    "& img": {
        transition: "transform 0.4s ease",
        objectFit: "cover",
    },
    "&:hover img": {
        transform: "scale(1.1)",
    },
    "& video": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.4s ease",
    },

    "&:hover video": {
        transform: "scale(1.1)",
    },
});
export const CardImageSection = styled(Card)({
    width: "100%",
    borderRadius: 0,
    boxShadow: "none"
})
export const CardContentStyled = styled(CardContent)({
    textAlign: "center",
    paddingTop: "16px"
})
export const ImageTextSection = styled(Box)({
    paddingTop: "24px"
})
export const ImageTitle = styled(Typography)({
    marginBottom: "0px"
})
export const ImageSubTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    paddingTop: "16px"
}));
const ContentTrustSection = styled(ContentSection)({
    backgroundColor: "#F6F7F9",
    minHeight: "300px",
    padding: "114px 24px"
})

const BoxMediaNoRadius = styled(BoxMedia)({
    borderRadius: "0px",
    minHeight: "auto",
})
export const CardMediaStyled = styled(CardMedia)({
    borderRadius: "8px",
})
const RegisButton = styled(Button)(({ theme }) => ({
    minWidth: "270px",
    borderRadius: "32px",
    backgroundColor: "#2563eb",
    color: "#fff",
    fontSize: "17px",
    fontWeight: 500,
    letterSpacing: 1,
    marginTop: "24px",
    "&:hover": {
        backgroundColor: "#294fcc",
    },
}));



const HomeTab = () => {
    const router = useRouter();
    const t = useTrans();

    const handleClickChangePage = () => {
        router.push('/mainsite');
    }
    return <Stack gap={7} data-testid="home-tab">
        <ContentSection >
            <Container maxWidth="md">
                <Stack alignItems={'center'} spacing={2}>
                    <Typography variant="h3"
                        sx={{
                            fontWeight: 500,
                            lineHeight: 1.1,
                            textAlign: "center",
                            maxWidth: 900,
                            wordBreak: "keep-all",
                        }}
                    >
                        {t("LANDING.HEADER")}{" "}
                        <span style={{ color: "#2563eb" }}>{t("LANDING.INTERNET")}</span>,<br />
                        {t("LANDING.CHANGE")}{" "}
                        <span style={{ color: "#14b8a6" }}>{t("LANDING.LIFE")}</span> {t("LANDING.VIETNAM")}
                    </Typography>

                    <SubHeadingSection variant="h6">
                        {t("LANDING.SUBTITLE")}
                    </SubHeadingSection>

                </Stack>
                <RegisButton onClick={() => handleClickChangePage()}>{t("LANDING.CTA_BUTTON")}</RegisButton>

            </Container>
            <StackVideo>
                <video width="100%" src="https://zalo-site.zadn.vn/videos/home-vi.mp4" autoPlay muted loop playsInline />
            </StackVideo>
        </ContentSection>
        <ContentSection data-testid="home-tab-effort-section" spacing={5}>
            <Box>
                <HeadingSection variant="h4">{t("LANDING.EFFORTS_TITLE")}</HeadingSection>
                <SubHeadingSection variant="h6">
                    {t("LANDING.EFFORTS_SUBTITLE")}
                </SubHeadingSection>
            </Box>
            <Grid container spacing={4} sx={{ mt: 2, width: "100%" }}>
                {/* Card 1 */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="/images/pic1.webp"
                                    alt="pic1"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContentStyled >
                            <ImageTextSection>
                                <ImageTitle variant="h5" gutterBottom>
                                    {t("LANDING.PRODUCT_SERVICE")}
                                </ImageTitle>
                                <ImageSubTitle variant="body1">
                                    {t("LANDING.PRODUCT_SERVICE_DESC")}
                                </ImageSubTitle>
                            </ImageTextSection>
                        </CardContentStyled>
                    </CardImageSection>
                </Grid>

                {/* Card 2 */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <CardImageSection ><CardMediaStyled>
                        <BoxMedia >
                            <Image
                                src="/images/pic2.webp"
                                alt="pic2"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                        </BoxMedia>
                    </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImageTitle variant="h5" gutterBottom>
                                    {t("LANDING.AI_TECH")}
                                </ImageTitle>
                                <ImageSubTitle variant="body1" >
                                    {t("LANDING.AI_TECH_DESC")}
                                </ImageSubTitle>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </Grid>

                {/* Card 3 */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <CardImageSection >
                        <CardMedia>
                            <BoxMedia >
                                <Image
                                    src="/images/pic3.webp"
                                    alt="pic3"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMedia>

                        <CardContent>
                            <ImageTextSection>
                                <ImageTitle variant="h5" gutterBottom>
                                    {t("LANDING.IMPACT_RESPONSIBILITY")}
                                </ImageTitle>
                                <ImageSubTitle variant="body1" >
                                    {t("LANDING.IMPACT_RESPONSIBILITY_DESC")}
                                </ImageSubTitle>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </Grid>
            </Grid>
        </ContentSection>
        <ContentTrustSection spacing={5} data-testid="home-tab-trust-section" >
            <Box pb={3}>
                <HeadingSection variant="h4">{t("LANDING.TRUST_TITLE")}</HeadingSection>
                <Container maxWidth="md" >
                    <SubHeadingSection variant="h6">
                        {t("LANDING.TRUST_SUBTITLE")}
                    </SubHeadingSection>
                </Container>

            </Box>
            <Grid direction="column" width="100%" container spacing={5}>
                <Grid container alignItems="stretch" spacing={5}>
                    <Grid size={6}>
                        <Box sx={{ height: "100%" }}>
                            <BoxMediaNoRadius height={350}>
                                <Image

                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpeople.3932e46d.png&w=3840&q=75"
                                    fill
                                    alt=""
                                />
                            </BoxMediaNoRadius>
                        </Box>
                    </Grid>
                    <Grid size={6}>
                        <StatCard
                            size={6}
                            title={t("LANDING.ZALO")}
                            subTitle={t("LANDING.ZALO_DESC")}
                            leftHighlight={{ value: "2B+", label: t("LANDING.MESSAGES_PER_DAY") }}
                            rightHighlight={{ value: "79M+", label: t("LANDING.USERS") }} />
                    </Grid>
                </Grid>
                <Grid container sx={{ alignItems: "stretch" }}>
                    <Grid size={3}>
                        <BoxMediaNoRadius sx={{ height: "100%" }}>
                            <Image
                                fill
                                src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fkiki.d715d09c.webp&w=3840&q=75"
                                alt=""
                            />
                        </BoxMediaNoRadius>
                    </Grid>

                    <Grid size={3}>
                        <StatCard
                            title={t("LANDING.KIKI")}
                            subTitle={t("LANDING.KIKI_DESC")}
                            leftHighlight={{ value: "1M+", label: t("LANDING.INSTALLED") }}
                        />
                    </Grid>

                    <Grid size={3}>
                        <video
                            src="https://zalo-site.zadn.vn/videos/zalo-video-thumb.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            width="100%"
                        />
                    </Grid>

                    <Grid size={3}>
                        <StatCard

                            title={t("LANDING.ZALO_VIDEO")}
                            leftHighlight={{ value: "40M+", label: t("LANDING.USERS") }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </ContentTrustSection>
        <ContentSection>
            <Stack width="100%" spacing={5} marginTop={4}>
                <Grid container size={12} textAlign="left" spacing={5}>
                    <Grid paddingRight={4} size={4}> <HeadingSection variant="h4">{t("LANDING.ECOSYSTEM_TITLE")}</HeadingSection></Grid>
                    <Grid size={4}>

                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-zalo.d8547d8a.png&w=640&q=75"
                            title={t("LANDING.ZALO")}
                            subTitle={t("LANDING.ZALO_DESC")} />
                    </Grid>
                    <Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-zing-mp3.f64af3c6.png&w=640&q=75"
                            title={t("LANDING.ZING_MP3")}
                            subTitle={t("LANDING.ZING_MP3_DESC")} />
                    </Grid>

                </Grid>
                <Grid container size={12} spacing={5} textAlign="left">
                    <Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-bao-moi.a8318a04.png&w=640&q=75"
                            title={t("LANDING.BAO_MOI")}
                            subTitle={t("LANDING.BAO_MOI_DESC")} />
                    </Grid><Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-kiki.d528c587.png&w=640&q=75"
                            title={t("LANDING.KIKI")}
                            subTitle={t("LANDING.KIKI_DESC")} />
                    </Grid><Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-zalo-video.5d7c7b34.png&w=640&q=75"
                            title={t("LANDING.ZALO_VIDEO")}
                            subTitle={t("LANDING.ZALO_VIDEO_DESC")} />
                    </Grid>

                </Grid>
            </Stack>
        </ContentSection>
        <ContentSection spacing={7}>
            <Container>
                <HeadingSection variant="h4">{t("LANDING.UPDATES_TITLE")}</HeadingSection>
                <SubHeadingSection variant="h6">{t("LANDING.UPDATES_SUBTITLE")}</SubHeadingSection>

            </Container>
            <Grid width="100%" alignItems="stretch" container spacing={5} size={12} >
                <Grid size={8.5}>
                    <Stack spacing={2}>
                        <BoxMediaNoRadius height={550}>
                            <Image
                                fill
                                src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzalo-sos.1f373bf5.png&w=3840&q=75"
                                alt=""
                            />
                        </BoxMediaNoRadius>
                        <HeadingSection textAlign="left" variant="h5" >{t("LANDING.ZALO_SOS")}</HeadingSection>
                    </Stack>

                </Grid>
                <Grid
                    size={3.5}
                    container
                    direction="column"
                    height="100%"
                    spacing={2} 
                >
                    <Grid>
                        <Stack spacing={2}>
                            <BoxMediaNoRadius height={200}>
                                <Image
                                    fill
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzalo-ai-llm-vietnam.e3fee334.png&w=1920&q=75"
                                    alt=""
                                />
                            </BoxMediaNoRadius>

                            <HeadingSection textAlign="left" variant="h5">
                                {t("LANDING.ZALO_LLM")}
                            </HeadingSection>
                        </Stack>
                    </Grid>

                    <Grid>
                        <Stack spacing={2}>
                            <BoxMediaNoRadius height={200}>
                                <Image
                                    fill
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fzalo-ai-assistant.f438edbe.png&w=3840&q=75"
                                    alt=""
                                />
                            </BoxMediaNoRadius>

                            <HeadingSection textAlign="left" variant="h5">
                                {t("LANDING.ZALO_ASSISTANT")}
                            </HeadingSection>
                        </Stack>
                    </Grid>
                </Grid>

            </Grid>
        </ContentSection>
        <ContentSection>

        </ContentSection>
    </Stack>
}
export default HomeTab;