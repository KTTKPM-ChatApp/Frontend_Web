"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFormik } from "formik";

import {
    Page, Content, LogoWrap, Subtitle, Card,
    TabContainer, CardHeader,
    AuthHeader,
} from "../Auth.styles";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { initialValues, validationSchemaRegisForm } from "./validate";
import { authService } from "@/src/common/service/auth-service";
import { useTrans } from "@/src/common/utilities/hook/trans";
import FormRegis from "./component/FormRegis";
import { IRegisterResponse } from "@/src/common/interface/auth-interface";
import { IconButton } from "@mui/material";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import { useTranslation } from "react-i18next";

export default function RegisterPage() {
    const router = useRouter();
    const Trans = useTrans();
    const { i18n } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLanguageToggle = () => {
        const newLang = i18n.language === 'vi' ? 'en' : 'vi';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const {
        setLoadingAuth,
        setErrorAuth,
        setAuthData } = useAuthStore();

    const errorAuth = useAuthStore((s) => s.errorAuth);

    const mapErrorMessage = (msg: string | undefined): string => {
        if (!msg) return Trans("COMMON.ERROR");
        if (msg.includes("Email already in use")) return "Email đã được sử dụng";
        if (msg.includes("Username already taken")) return "Username đã được sử dụng";
        if (msg.includes("hệ thống")) return msg;
        return msg;
    };

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchemaRegisForm(Trans),
        onSubmit: async (values) => {
            setErrorAuth(null);
            setLoadingAuth(true);
            try {
                const { confirmPsw, ...registerData } = values;
                const result = await authService.authRegister({
                    ...registerData,
                    dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined
                });
                const payload = result?.payload;

                if (result?.ok && payload?.user) {
                    if (typeof window !== "undefined" && payload.accessToken && payload.refreshToken) {
                        localStorage.setItem("accessToken", payload.accessToken);
                        localStorage.setItem("refreshToken", payload.refreshToken);
                        localStorage.setItem("currentUserId", payload.user.id);
                    }
                    setAuthData({
                        success: true,
                        data: {
                            accessToken: payload.accessToken || "",
                            refreshToken: payload.refreshToken || "",
                            user: payload.user
                        },
                        message: "Đăng ký thành công"
                    });
                    router.push("/me");
                } else {
                    setErrorAuth(mapErrorMessage(payload?.message));
                }
            } catch (error) {
                setErrorAuth(Trans("COMMON.ERROR"));
            } finally {
                setLoadingAuth(false);
            }
        },
    });






    if (!mounted) {
        return null;
    }

    return (
        <Page suppressHydrationWarning>
            <Content spacing={2}>
                <LogoWrap>
                    <Image
                        src="https://stc-zlogin.zdn.vn/images/zlogo.png"
                        alt="Zalo Logo"
                        width={80}
                        height={35}
                        priority
                    />
                    <IconButton onClick={handleLanguageToggle}>
                        <LanguageOutlinedIcon />
                    </IconButton>
                </LogoWrap>

                <Subtitle>
                    {"Tạo tài khoản Zalo\nđể kết nối với ứng dụng Zalo Web"}
                </Subtitle>

                <Card>
                    <TabContainer>
                        <CardHeader>
                            <AuthHeader>
                                Đăng ký tài khoản
                            </AuthHeader>
                        </CardHeader>

                        <FormRegis
                            formik={formik}
                            onGoLogin={() => router.push("/login")}
                            errorMsg={errorAuth}
                        />
                    </TabContainer>
                </Card>
            </Content>
        </Page>
    );
}