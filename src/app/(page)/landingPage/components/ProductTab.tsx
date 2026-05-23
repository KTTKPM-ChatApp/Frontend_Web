"use client";

import {  CardContent, CardMedia, Container, Grid, Stack, styled } from "@mui/material";
import { BoxMedia, CardContentStyled, CardImageSection, CardMediaStyled, ContentSection, FILL_IMAGE_SIZES, HeadingSection, ImageSubTitle, ImageTextSection, ImageTitle, SubHeadingSection } from "./HomeTab";
import Image from "next/image";
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
    return <Stack gap={7} data-testid="home-tab">
        <ContentSection >
            <Container maxWidth="lg">
                <Stack alignItems={'center'} spacing={2}>
                    <HeadingSection variant="h3">Sản phẩm cho người Việt, chất lượng chuẩn quốc tế</HeadingSection>

                    <SubHeadingSection padding="0px 80px" variant="body1">
                        Chúng tôi tin rằng người Việt xứng đáng với các sản phẩm công nghệ đẳng cấp thế giới, được tạo dựng trên nền tảng am hiểu bản địa và tinh thần trách nhiệm.                     </SubHeadingSection>

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
                                    Zalo
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1">
                                    Ứng dụng nhắn tin số 1 Việt Nam: đơn giản, tin cậy, riêng tư và hiện được nâng cấp với AI.                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContentStyled>
                    </CardImageSection>
                </GridMedia>

                {/* Card 2 */}
                <GridMedia size={4}>
                    <CardImageSection ><CardMediaStyled>
                        <BoxMedia >
                            <Image
                                src="https://zalo-site.zadn.vn/_next/static/media/thumb-zing-mp3.8c320140.png"
                                alt="pic2"
                                fill
                                sizes={FILL_IMAGE_SIZES}
                                style={{ objectFit: "cover" }}
                            />
                        </BoxMedia>
                    </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Zing MP3
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Nền tảng âm nhạc hàng đầu Việt Nam, thưởng thức giai điệu yêu thích bất cứ lúc nào, bất cứ nơi đâu.                                </ImaggSubTitleLeft>
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
                                    Zao Video
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Khám phá kho video ngắn dành cho bạn: Nội dung gần gũi, hợp gu và hấp dẫn trong từng cú lướt.                                </ImaggSubTitleLeft>
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
                                    src="https://zalo-site.zadn.vn/_next/static/media/thumb-baomoi.f3bc3350.png"
                                    alt="pic2"
                                    fill
                                    sizes={FILL_IMAGE_SIZES}
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Báo Mới
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Cập nhật mới nhất từ những nguồn uy tín hàng đầu Việt Nam. Thông tin được chắt lọc, tốc độ, và dễ dàng truy cập.                                    </ImaggSubTitleLeft>
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
                                    Kiki
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1">
                                    Chỉ cần nói - Kiki sẽ giúp bạn điều hướng, mở nhạc, đọc tin và nhiều tác vụ khác.                                    </ImaggSubTitleLeft>
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
                                    src="https://zalo-site.zadn.vn/_next/static/media/thumb-laban-key.7c9f5332.png"
                                    alt="pic2"
                                    fill
                                    sizes={FILL_IMAGE_SIZES}
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Laban Key
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Bàn phím gõ tiếng Việt thông minh, nhanh, chuẩn xác, được hàng triệu người Việt tin dùng.                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
            </Grid>
        </ContentSection>


        <ContentSection spacing={14}>
            <HeadingSection letterSpacing={1} variant="h3">Giải pháp của Zalo giúp doanh nghiệp tiếp cận khách hàng một cách tự nhiên, hiệu quả, và độ phủ lớn</HeadingSection>
            <Grid width="100%" container size={12} spacing={5} justifyContent="center">
                <GridMedia size={6}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/static/media/thumb-zalo-bussiness.538799e3.png"
                                    alt="pic2"
                                    fill
                                    sizes="(max-width: 900px) 100vw, 50vw"
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>
                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Laban Key
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Bàn phím gõ tiếng Việt thông minh, nhanh, chuẩn xác, được hàng triệu người Việt tin dùng.                                    </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
                <GridMedia size={6}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/static/media/thumb-zalo-bussiness.538799e3.png"
                                    alt="pic2"
                                    fill
                                    sizes="(max-width: 900px) 100vw, 50vw"
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>
                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Laban Key
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Bàn phím gõ tiếng Việt thông minh, nhanh, chuẩn xác, được hàng triệu người Việt tin dùng.                                    </ImaggSubTitleLeft>
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
