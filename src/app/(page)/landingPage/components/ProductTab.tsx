"use client";

import {  CardContent, CardMedia, Container, Grid, Stack, styled } from "@mui/material";
import { BoxMedia, CardContentStyled, CardImageSection, CardMediaStyled, ContentSection, HeadingSection, ImageSubTitle, ImageTextSection, ImageTitle, SubHeadingSection } from "./HomeTab";
import Image from "next/image";
import { useTrans } from "@/src/common/utilities/hook/trans";
const GridMedia = styled(Grid)({
    border: "1px solid #F4F4F5",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
});
const ImaggTitleLeft = styled(ImageTitle)({
    textAlign: "left",
})
const ImaggSubTitleLeft = styled(ImageSubTitle)({
    textAlign: "left",
})
const ProductTab = () => {
    const t = useTrans();
    return <Stack gap={7} data-testid="home-tab">
        <ContentSection >
            <Container maxWidth="lg">
                <Stack alignItems={'center'} spacing={2}>
                    <HeadingSection variant="h3">{t("LANDING.PRODUCT_TITLE")}</HeadingSection>

                    <SubHeadingSection padding="0px 80px" variant="body1">
                        {t("LANDING.PRODUCT_SUBTITLE")}                     </SubHeadingSection>

                </Stack>

            </Container>
        </ContentSection>

        <ContentSection spacing={5}>
            <Grid container size={12} spacing={5} sx={{ mt: 2, width: "100%" }}>
                {/* Card 1 */}
                <GridMedia size={4}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <video src="https://zalo-site.zadn.vn/videos/product-zalo-thumb.mp4" autoPlay muted loop playsInline></video>
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContentStyled>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.ZALO")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1">
                                    {t("LANDING.ZALO_APP_DESC")}                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContentStyled>
                    </CardImageSection>
                </GridMedia>

                {/* Card 2 */}
                <GridMedia size={4}>
                    <CardImageSection ><CardMediaStyled>
                        <BoxMedia >
                            <Image
                                src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-zing-mp3.8c320140.png&w=1920&q=75"
                                alt="pic2"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                        </BoxMedia>
                    </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.ZING_MP3")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    {t("LANDING.ZING_MP3_PRODUCT_DESC")}                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>

                {/* Card 3 */}
                <GridMedia size={4}>
                    <CardImageSection >
                        <CardMedia>
                            <BoxMedia >
                                <video src="https://zalo-site.zadn.vn/videos/product-zalo-video-thumb.mp4" autoPlay muted loop playsInline></video>
                            </BoxMedia>
                        </CardMedia>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.ZALO_VIDEO")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    {t("LANDING.ZAO_VIDEO_DESC")}                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
            </Grid>
            <Grid container size={12} spacing={5} sx={{ mt: 2, width: "100%" }}>
                {/* Card 2 */}
                <GridMedia size={4}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-baomoi.f3bc3350.png&w=3840&q=75"
                                    alt="pic2"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.BAO_MOI")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    {t("LANDING.BAO_MOI_PRODUCT_DESC")}                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
                {/* Card 1 */}
                <GridMedia size={4}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <video src="https://zalo-site.zadn.vn/videos/product-kiki-thumb.mp4" autoPlay muted loop playsInline></video>
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContentStyled>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.KIKI")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1">
                                    {t("LANDING.KIKI_PRODUCT_DESC")}                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContentStyled>
                    </CardImageSection>
                </GridMedia>



                {/* Card 3 */}
                <GridMedia size={4}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-laban-key.7c9f5332.png&w=1920&q=75"
                                    alt="pic2"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.LABAN_KEY")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    {t("LANDING.LABAN_KEY_DESC")}                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
            </Grid>
        </ContentSection>


        <ContentSection spacing={14}>
            <HeadingSection letterSpacing={1} variant="h3">{t("LANDING.SOLUTIONS_TITLE")}</HeadingSection>
            <Grid width="100%" container size={12} spacing={5} justifyContent="center">
                <GridMedia size={6}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-zalo-bussiness.538799e3.png&w=3840&q=75"
                                    alt="pic2"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>
                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.LABAN_KEY")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    {t("LANDING.LABAN_KEY_DESC")}                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
                <GridMedia size={6}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-zalo-bussiness.538799e3.png&w=3840&q=75"
                                    alt="pic2"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>
                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    {t("LANDING.LABAN_KEY")}
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    {t("LANDING.LABAN_KEY_DESC")}                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                       
                    </CardImageSection>
                </GridMedia>
            </Grid>
        </ContentSection>
        <ContentSection>

        </ContentSection>
    </Stack>
}

export default ProductTab;