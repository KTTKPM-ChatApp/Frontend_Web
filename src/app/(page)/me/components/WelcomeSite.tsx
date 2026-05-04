"use client";

import Image from "next/image";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTrans } from "@/src/common/utilities/hook/trans";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Slide {
    imageSrc: string;
    title: string;
    description: string;
}

interface WelcomeSiteProps {
    slides: Slide[];
}

const Root = styled(Box)({
    width: "100%",
    height: "100%",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
});

const Header = styled(Box)({
    width: "100%",
    textAlign: "center",
    paddingTop: 28,
    paddingBottom: 10,
});

const Title = styled(Typography)({
    fontSize: 22,
    fontWeight: 500,
    color: "#111",
});

const Subtitle = styled(Typography)({
    fontSize: 14,
    marginTop: 16,
    color: "#111",
});

const SliderWrap = styled(Box)({
    width: "100%",
    flex: 1,
    display: "flex",
    alignItems: "center",
});

const StyledSwiper = styled(Swiper)({
    width: "100%",
    height: 500,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",

    "& .swiper-wrapper": {
        height: "100%",
    },

    "& .swiper-slide": {
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 70,
        boxSizing: "border-box",
    },

    "& .swiper-pagination": {
        display: "flex",
        justifyContent: "center",
        gap: 12,
        bottom: 18,
    },

    "& .swiper-pagination-bullet": {
        width: 6,
        height: 6,
        background: "#C7CDD6",
        opacity: 1,
    },

    "& .swiper-pagination-bullet-active": {
        background: "#0573ff",
        transform: "scale(1.2)",
    },

    "& .swiper-button-prev, & .swiper-button-next": {
        width: 24,
        height: 24,
    },

    "& .swiper-button-prev:after, & .swiper-button-next:after": {
        fontSize: 12,
        fontWeight: 700,
    },
});

const SlideCenter = styled(Box)({
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
});

const SlideRoot = styled(Box)({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
});

const ImageWrap = styled(Box)({
    position: "relative",
    width: "min(520px, 70%)",
    aspectRatio: "16 / 9",
    margin: "0 auto",
});

const StyledImage = styled(Image)({
    objectFit: "contain",
});

const Content = styled(Box)({
    textAlign: "center",
    minHeight: 90,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
});

const SlideTitle = styled(Typography)({
    fontSize: 18,
    color: "#005AE0",
});

const SlideDescription = styled(Typography)({
    color: "#212121",
    overflow: "hidden",
    fontSize: 14,
});

export default function WelcomeSite({ slides }: WelcomeSiteProps) {
    const t = useTrans();
    const showNav = slides.length > 1;
    const showPagination = slides.length > 1;

    return (
        <Root>
            <Header>
                <Title>
                    <span dangerouslySetInnerHTML={{ __html: t("ME.WELCOME_TITLE") }} />
                </Title>

                <Subtitle>
                    {t("ME.WELCOME_SUBTITLE")}
                </Subtitle>
            </Header>

            <SliderWrap>
                <StyledSwiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={showNav}
                    pagination={showPagination ? { clickable: true } : false}
                    loop={slides.length > 1}
                    autoplay={
                        slides.length > 1
                            ? { delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }
                            : false
                    }
                >
                    {slides.map((s, idx) => (
                        <SwiperSlide key={idx}>
                            <SlideCenter>
                                <SlideRoot>
                                    <ImageWrap>
                                        <StyledImage
                                            src={s.imageSrc.trim()}
                                            alt={s.title}
                                            fill
                                            sizes="(max-width: 900px) 70vw, 520px"
                                            priority={idx === 0}
                                        />
                                    </ImageWrap>

                                    <Content>
                                        <SlideTitle>{s.title}</SlideTitle>
                                        <SlideDescription>
                                            {s.description}
                                        </SlideDescription>
                                    </Content>
                                </SlideRoot>
                            </SlideCenter>
                        </SwiperSlide>
                    ))}
                </StyledSwiper>
            </SliderWrap>
        </Root>
    );
}