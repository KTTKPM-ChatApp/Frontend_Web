"use client";

import { Button, Card, CardContent, CardMedia, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";


import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Image from "next/image";
import StatCard from "@/src/shared/component/StatCard";
import IconAppCard from "@/src/shared/component/IconAppCard";
import { useRouter } from 'next/navigation';

export const FILL_IMAGE_SIZES = "(max-width: 900px) 100vw, 33vw";

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
const RegisButton = styled(Button)(() => ({
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
    const handleClickChangePage = () => {
        console.log("click mainsite");
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
                        Phát triển{" "}
                        <span style={{ color: "#2563eb" }}>Internet</span>,<br />
                        thay đổi{" "}
                        <span style={{ color: "#14b8a6" }}>cuộc sống</span> người Việt Nam
                    </Typography>

                    <SubHeadingSection variant="h6">
                        Từ ứng dụng nhắn tin phổ biến nhất Việt Nam đến công nghệ AI tiên tiến, những sản phẩm của Zalo đang hỗ trợ cuộc sống hằng ngày của hàng chục triệu người.
                    </SubHeadingSection>

                </Stack>
                <RegisButton onClick={() => handleClickChangePage()}>Tham gia Zalo ngay</RegisButton>

            </Container>
            <StackVideo>
                <video width="100%" src="https://zalo-site.zadn.vn/videos/home-vi.mp4" autoPlay muted loop playsInline />
            </StackVideo>
        </ContentSection>
        <ContentSection data-testid="home-tab-effort-section" spacing={5}>
            <Box>
                <HeadingSection variant="h4">Nỗ lực và dấu ấn của Zalo</HeadingSection>
                <SubHeadingSection variant="h6">
                    Tìm hiểu cách Zalo xây dựng sản phẩm, phát triển công nghệ và đóng góp cho xã hội.
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
                                    sizes={FILL_IMAGE_SIZES}
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>

                        <CardContentStyled >
                            <ImageTextSection>
                                <ImageTitle variant="h5" gutterBottom>
                                    Sản phẩm và dịch vụ
                                </ImageTitle>
                                <ImageSubTitle variant="body1">
                                    Nhắn tin liên lạc, âm nhạc, tin tức, trợ lý AI - những sản phẩm của chúng tôi đã trở thành một phần không thể thiếu trong đời sống hàng ngày.
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
                                sizes={FILL_IMAGE_SIZES}
                                style={{ objectFit: "cover" }}
                            />
                        </BoxMedia>
                    </CardMediaStyled>

                        <CardContent>
                            <ImageTextSection>
                                <ImageTitle variant="h5" gutterBottom>
                                    AI và Công nghệ
                                </ImageTitle>
                                <ImageSubTitle variant="body1" >
                                    AI của chúng tôi có khả năng hiểu tốt ngôn ngữ,  nhu cầu bản địa; giúp tăng hiệu suất, và sự tiện lợi cho người dùng trên hệ sinh thái.
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
                                    sizes={FILL_IMAGE_SIZES}
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMedia>

                        <CardContent>
                            <ImageTextSection>
                                <ImageTitle variant="h5" gutterBottom>
                                    Ảnh hưởng và trách nhiệm
                                </ImageTitle>
                                <ImageSubTitle variant="body1" >
                                    Chúng tôi đầu tư vào chuyển đổi số, quyền riêng tư, AI và hơn thế nữa. Với Zalo, công nghệ để phụng sự con người phải được kiến tạo từ trách nhiệm.
                                </ImageSubTitle>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </Grid>
            </Grid>
        </ContentSection>
        <ContentTrustSection spacing={5} data-testid="home-tab-trust-section" >
            <Box pb={3}>
                <HeadingSection variant="h4">Từ thói quen đến niềm tin </HeadingSection>
                <Container maxWidth="md" >
                    <SubHeadingSection variant="h6">
                        Đó là cách hàng chục triệu người dùng tin cậy sử dụng thường xuyên các sản phẩm của Zalo để kết nối, giúp cuộc sống tiện lợi và cho nhiều mục đích khác.
                    </SubHeadingSection>
                </Container>

            </Box>
            <Grid direction="column" width="100%" container spacing={5}>
                <Grid container alignItems="stretch" spacing={5}>
                    <Grid size={6}>
                        <Box sx={{ height: "100%" }}>
                            <BoxMediaNoRadius height={350}>
                                <Image

                                    src="https://zalo-site.zadn.vn/_next/static/media/people.3932e46d.png"
                                    fill
                                    sizes="(max-width: 900px) 100vw, 50vw"
                                    alt=""
                                />
                            </BoxMediaNoRadius>
                        </Box>
                    </Grid>
                    <Grid size={6}>
                        <StatCard
                            size={6}
                            title="Zalo"
                            subTitle="Ứng dụng liên lạc số 1 Việt Nam"
                            leftHighlight={{ value: "2B+", label: "tin nhắn mỗi ngày" }}
                            rightHighlight={{ value: "79M+", label: "người dùng" }} />
                    </Grid>
                </Grid>
                <Grid container sx={{ alignItems: "stretch" }}>
                    <Grid size={3}>
                        <BoxMediaNoRadius sx={{ height: "100%" }}>
                            <Image
                                fill
                                sizes="(max-width: 900px) 100vw, 25vw"
                                src="https://zalo-site.zadn.vn/_next/static/media/kiki.d715d09c.webp"
                                alt=""
                            />
                        </BoxMediaNoRadius>
                    </Grid>

                    <Grid size={3}>
                        <StatCard
                            title="Kiki Auto"
                            subTitle="Trợ lý AI phổ biến nhất trên xe hơi"
                            leftHighlight={{ value: "1M+", label: "đã cài đặt" }}
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

                            title="Zalo Video"
                            leftHighlight={{ value: "40M+", label: "người dùng" }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </ContentTrustSection>
        <ContentSection>
            <Stack width="100%" spacing={5} marginTop={4}>
                <Grid container size={12} textAlign="left" spacing={5}>
                    <Grid paddingRight={4} size={4}> <HeadingSection variant="h4">Khám phá hệ sinh thái kết nối, giải trí và tiện ích cho cuộc sống</HeadingSection></Grid>
                    <Grid size={4}>

                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/static/media/logo-zalo.d8547d8a.png"
                            title="Zalo"
                            subTitle="Ứng dụng liên lạc số 1 Việt Nam" />
                    </Grid>
                    <Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/static/media/logo-zing-mp3.f64af3c6.png"
                            title="Zing MP3"
                            subTitle="Nền tảng âm nhạc trực truyến hàng đầu" />
                    </Grid>

                </Grid>
                <Grid container size={12} spacing={5} textAlign="left">
                    <Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/static/media/logo-bao-moi.a8318a04.png"
                            title="Báo Mới"
                            subTitle="Nền tảng tin tức dẫn đầu" />
                    </Grid><Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/static/media/logo-kiki.d528c587.png"
                            title="Kiki Auto"
                            subTitle="Trợ lý trên xe phổ biến nhất" />
                    </Grid><Grid size={4}>
                        <IconAppCard
                            path="https://zalo-site.zadn.vn/_next/static/media/logo-zalo-video.5d7c7b34.png"
                            title="Zalo Video"
                            subTitle="Top nền tảng video ngắn" />
                    </Grid>

                </Grid>
            </Stack>
        </ContentSection>
        <ContentSection spacing={7}>
            <Container>
                <HeadingSection variant="h4">Những cập nhật nổi bật</HeadingSection>
                <SubHeadingSection variant="h6">Từ nhu cầu bản địa đến làn sóng công nghệ toàn cầu, Zalo không ngừng nâng cấp để luôn hữu ích, tin cậy và duy trì vị thế dẫn đầu.</SubHeadingSection>

            </Container>
            <Grid width="100%" alignItems="stretch" container spacing={5} size={12} >
                <Grid size={8.5}>
                    <Stack spacing={2}>
                        <BoxMediaNoRadius height={550}>
                            <Image
                                fill
                                sizes="(max-width: 900px) 100vw, 70vw"
                                src="https://zalo-site.zadn.vn/_next/static/media/zalo-sos.1f373bf5.png"
                                alt=""
                            />
                        </BoxMediaNoRadius>
                        <HeadingSection textAlign="left" variant="h5" >Bản đồ cứu hộ khẩn cấp trên Zalo SOS</HeadingSection>
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
                                    sizes="(max-width: 900px) 100vw, 30vw"
                                    src="https://zalo-site.zadn.vn/_next/static/media/zalo-ai-llm-vietnam.e3fee334.png"
                                    alt=""
                                />
                            </BoxMediaNoRadius>

                            <HeadingSection textAlign="left" variant="h5">
                                Zalo và hành trình làm chủ LLM tiếng Việt
                            </HeadingSection>
                        </Stack>
                    </Grid>

                    <Grid>
                        <Stack spacing={2}>
                            <BoxMediaNoRadius height={200}>
                                <Image
                                    fill
                                    sizes="(max-width: 900px) 100vw, 30vw"
                                    src="https://zalo-site.zadn.vn/_next/static/media/zalo-ai-assistant.f438edbe.png"
                                    alt=""
                                />
                            </BoxMediaNoRadius>

                            <HeadingSection textAlign="left" variant="h5">
                                Ứng dụng mới trên Zalo: Để mỗi công dân Việt đều có trợ lý ảo
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
