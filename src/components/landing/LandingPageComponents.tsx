// LANDING PAGE COMPONENTS - UI ONLY (No Logic/Handlers)
// ================================================

// HOME TAB COMPONENT
// ==================
import { Button, Card, CardContent, CardMedia, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Image from "next/image";

// Styled Components
export const ContentSection = styled(Stack)({
    alignItems: 'center',
    textAlign: 'center',
    padding: "24px"
});

export const HeadingSection = styled(Typography)({
    color: '#292929',
    alignItems: 'center',
    justifyItems: 'center',
});

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
});

export const CardContentStyled = styled(CardContent)({
    textAlign: "center",
    paddingTop: "16px"
});

export const ImageTextSection = styled(Box)({
    paddingTop: "24px"
});

export const ImageTitle = styled(Typography)({
    marginBottom: "0px"
});

export const ImageSubTitle = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    paddingTop: "16px"
}));

const ContentTrustSection = styled(ContentSection)({
    backgroundColor: "#F6F7F9",
    minHeight: "300px",
    padding: "114px 24px"
});

const BoxMediaNoRadius = styled(BoxMedia)({
    borderRadius: "0px",
    minHeight: "auto",
});

export const CardMediaStyled = styled(CardMedia)({
    borderRadius: "8px",
});

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

// HomeTab Component UI Structure
export const HomeTabUI = {
  layout: (
    <Stack gap={7} data-testid="home-tab">
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
                        Kết nối <span style={{ color: "#2563eb" }}>Internet</span>,<br />
                        Thay đổi <span style={{ color: "#14b8a6" }}>cuộc sống</span> Việt Nam
                    </Typography>

                    <SubHeadingSection variant="h6">
                        Zalo là nền tảng giao tiếp và kết nối cộng đồng hàng đầu Việt Nam, 
                        mang đến những trải nghiệm tốt nhất cho người dùng.
                    </SubHeadingSection>

                </Stack>
                <RegisButton onClick={() => {}}>Bắt đầu ngay</RegisButton>

            </Container>
            <StackVideo>
                <video width="100%" src="https://zalo-site.zadn.vn/videos/home-vi.mp4" autoPlay muted loop playsInline />
            </StackVideo>
        </ContentSection>
        
        <ContentSection data-testid="home-tab-effort-section" spacing={5}>
            <Box>
                <HeadingSection variant="h4">Nỗ lực vì người dùng</HeadingSection>
                <SubHeadingSection variant="h6">
                    Chúng tôi luôn nỗ lực để mang đến những sản phẩm và dịch vụ tốt nhất
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
                                    Sản phẩm & Dịch vụ
                                </ImageTitle>
                                <ImageSubTitle variant="body1">
                                    Đa dạng các sản phẩm và dịch vụ phục vụ mọi nhu cầu của người dùng
                                </ImageSubTitle>
                            </ImageTextSection>
                        </CardContentStyled>
                    </CardImageSection>
                </Grid>

                {/* Card 2 */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <CardImageSection >
                        <CardMediaStyled>
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
                                    Công nghệ AI
                                </ImageTitle>
                                <ImageSubTitle variant="body1" >
                                    Ứng dụng trí tuệ nhân tạo để nâng cao trải nghiệm người dùng
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
                                    Tác động & Trách nhiệm
                                </ImageTitle>
                                <ImageSubTitle variant="body1" >
                                    Cam kết đóng góp tích cực cho xã hội và cộng đồng
                                </ImageSubTitle>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </Grid>
            </Grid>
        </ContentSection>

        <ContentTrustSection spacing={5} data-testid="home-tab-trust-section" >
            <Box pb={3}>
                <HeadingSection variant="h4">Sự tin tưởng của người dùng</HeadingSection>
                <Container maxWidth="md" >
                    <SubHeadingSection variant="h6">
                        Hàng triệu người dùng tin tưởng và sử dụng các dịch vụ của chúng tôi mỗi ngày
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
                        {/* StatCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                            <Typography variant="h5" gutterBottom>Zalo</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Ứng dụng giao tiếp hàng đầu Việt Nam
                            </Typography>
                            <Stack direction="row" spacing={3}>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary">2B+</Typography>
                                    <Typography variant="caption">Tin nhắn mỗi ngày</Typography>
                                </Box>
                                <Box textAlign="center">
                                    <Typography variant="h4" color="primary">79M+</Typography>
                                    <Typography variant="caption">Người dùng</Typography>
                                </Box>
                            </Stack>
                        </Box>
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
                        {/* StatCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
                            <Typography variant="h5" gutterBottom>Kiki</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Trợ lý AI thông minh
                            </Typography>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary">1M+</Typography>
                                <Typography variant="caption">Lượt cài đặt</Typography>
                            </Box>
                        </Box>
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
                        {/* StatCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, height: "100%" }}>
                            <Typography variant="h5" gutterBottom>Zalo Video</Typography>
                            <Box textAlign="center">
                                <Typography variant="h4" color="primary">40M+</Typography>
                                <Typography variant="caption">Người dùng</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </ContentTrustSection>

        <ContentSection>
            <Stack width="100%" spacing={5} marginTop={4}>
                <Grid container size={12} textAlign="left" spacing={5}>
                    <Grid paddingRight={4} size={4}> 
                        <HeadingSection variant="h4">Hệ sinh thái</HeadingSection>
                    </Grid>
                    <Grid size={4}>
                        {/* IconAppCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
                            <Box sx={{ width: 60, height: 60, mx: "auto", mb: 2 }}>
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-zalo.d8547d8a.png&w=640&q=75"
                                    alt="Zalo"
                                    fill
                                />
                            </Box>
                            <Typography variant="h6" gutterBottom>Zalo</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ứng dụng giao tiếp hàng đầu
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid size={4}>
                        {/* IconAppCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
                            <Box sx={{ width: 60, height: 60, mx: "auto", mb: 2 }}>
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-zing-mp3.f64af3c6.png&w=640&q=75"
                                    alt="Zing MP3"
                                    fill
                                />
                            </Box>
                            <Typography variant="h6" gutterBottom>Zing MP3</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Nền tảng âm nhạc trực tuyến
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                
                <Grid container size={12} spacing={5} textAlign="left">
                    <Grid size={4}>
                        {/* IconAppCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
                            <Box sx={{ width: 60, height: 60, mx: "auto", mb: 2 }}>
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-bao-moi.a8318a04.png&w=640&q=75"
                                    alt="Báo Mới"
                                    fill
                                />
                            </Box>
                            <Typography variant="h6" gutterBottom>Báo Mới</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ứng dụng đọc báo hàng đầu
                            </Typography>
                        </Box>
                    </Grid>
                    
                    <Grid size={4}>
                        {/* IconAppCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
                            <Box sx={{ width: 60, height: 60, mx: "auto", mb: 2 }}>
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-kiki.d528c587.png&w=640&q=75"
                                    alt="Kiki"
                                    fill
                                />
                            </Box>
                            <Typography variant="h6" gutterBottom>Kiki</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Trợ lý AI thông minh
                            </Typography>
                        </Box>
                    </Grid>
                    
                    <Grid size={4}>
                        {/* IconAppCard component placeholder */}
                        <Box sx={{ p: 3, border: "1px solid #e0e0e0", borderRadius: 2, textAlign: "center" }}>
                            <Box sx={{ width: 60, height: 60, mx: "auto", mb: 2 }}>
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-zalo-video.5d7c7b34.png&w=640&q=75"
                                    alt="Zalo Video"
                                    fill
                                />
                            </Box>
                            <Typography variant="h6" gutterBottom>Zalo Video</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Nền tảng video trực tuyến
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Stack>
        </ContentSection>

        <ContentSection spacing={7}>
            <Container>
                <HeadingSection variant="h4">Cập nhật mới nhất</HeadingSection>
                <SubHeadingSection variant="h6">Luôn cập nhật những tính năng mới nhất để phục vụ người dùng</SubHeadingSection>
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
                        <HeadingSection textAlign="left" variant="h5" >Zalo SOS</HeadingSection>
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
                                Zalo LLM
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
                                Zalo Assistant
                            </HeadingSection>
                        </Stack>
                    </Grid>
                </Grid>
            </Grid>
        </ContentSection>
    </Stack>
  )
};

// PRODUCT TAB COMPONENT
// =====================

const GridMedia = styled(Grid)({
    border: "1px solid #F4F4F5",
    borderTopLeftRadius: "8px",
    borderTopRightRadius: "8px",
});

const ImaggTitleLeft = styled(ImageTitle)({
    textAlign: "left",
});

const ImaggSubTitleLeft = styled(ImageSubTitle)({
    textAlign: "left",
});

// ProductTab Component UI Structure
export const ProductTabUI = {
  layout: (
    <Stack gap={7} data-testid="product-tab">
        <ContentSection >
            <Container maxWidth="lg">
                <Stack alignItems={'center'} spacing={2}>
                    <HeadingSection variant="h3">Sản phẩm của chúng tôi</HeadingSection>

                    <SubHeadingSection padding="0px 80px" variant="body1">
                        Khám phá các sản phẩm và dịch vụ đa dạng trong hệ sinh thái Zalo
                    </SubHeadingSection>

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
                                    Ứng dụng giao tiếp và kết nối hàng đầu Việt Nam
                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContentStyled>
                    </CardImageSection>
                </GridMedia>

                {/* Card 2 */}
                <GridMedia size={4}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-zing-mp3.8c320140.png&w=1920&q=75"
                                    alt="Zing MP3"
                                    fill
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
                                    Nền tảng âm nhạc trực tuyến với kho nhạc khổng lồ
                                </ImaggSubTitleLeft>
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
                                    Zalo Video
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Nền tảng xem và chia sẻ video trực tuyến
                                </ImaggSubTitleLeft>
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
                                    alt="Báo Mới"
                                    fill
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
                                    Ứng dụng đọc báo và tin tức hàng đầu Việt Nam
                                </ImaggSubTitleLeft>
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
                                    Trợ lý AI thông minh giúp bạn trong mọi công việc
                                </ImaggSubTitleLeft>
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
                                    alt="Laban Key"
                                    fill
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
                                    Bộ gõ tiếng Việt thông minh và chính xác
                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
            </Grid>
        </ContentSection>

        <ContentSection spacing={14}>
            <HeadingSection letterSpacing={1} variant="h3">Giải pháp doanh nghiệp</HeadingSection>
            <Grid width="100%" container size={12} spacing={5} justifyContent="center">
                <GridMedia size={6}>
                    <CardImageSection >
                        <CardMediaStyled>
                            <BoxMedia >
                                <Image
                                    src="https://zalo-site.zadn.vn/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fthumb-zalo-bussiness.538799e3.png&w=3840&q=75"
                                    alt="Zalo Business"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>
                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Zalo Business
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Giải pháp giao tiếp và marketing cho doanh nghiệp
                                </ImaggSubTitleLeft>
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
                                    alt="Zalo Business"
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </BoxMedia>
                        </CardMediaStyled>
                        <CardContent>
                            <ImageTextSection>
                                <ImaggTitleLeft variant="h5" gutterBottom>
                                    Zalo OA
                                </ImaggTitleLeft>
                                <ImaggSubTitleLeft variant="body1" >
                                    Tài khoản Official cho doanh nghiệp và tổ chức
                                </ImaggSubTitleLeft>
                            </ImageTextSection>
                        </CardContent>
                    </CardImageSection>
                </GridMedia>
            </Grid>
        </ContentSection>
    </Stack>
  )
};
