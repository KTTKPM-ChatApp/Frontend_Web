"use client";

import * as React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    Card,
    Content,
    LogoWrap,
    Page,
    Subtitle,
} from "../Auth.styles";

import FormLogin from "./component/FormLogin";
import { useFormik } from "formik";
import { initialValues, validationSchemaLogin } from "./validate";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { authService } from "@/src/common/service/auth-service";
import { IAuthResponse } from "@/src/common/interface/auth-interface";

export default function LoginPage() {
    const Trans = useTrans();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    const loadingAuth = useAuthStore((s) => s.loadingAuth);
    const setLoadingAuth = useAuthStore((s) => s.setLoadingAuth);
    const errorAuth = useAuthStore((s) => s.errorAuth);
    const setErrorAuth = useAuthStore((s) => s.setErrorAuth);
    const setAuthData = useAuthStore((s) => s.setAuthData);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchemaLogin(Trans),
        enableReinitialize: false,
        onSubmit: async (values) => {
            console.log("Form submitting with values:", JSON.stringify(values));
            setErrorAuth(null);
            setLoadingAuth(true);

            try {
                console.log("Calling authService.authLogin...");
                const result = await authService.authLogin({
                    email: values.email.trim(),
                    password: values.password,
                });
                console.log("API call result:", result);

                const authData = result?.payload as IAuthResponse;
                console.log("Parsed authData:", authData);

                if (result?.ok && authData?.accessToken) {
                    if (typeof window !== "undefined") {
                        localStorage.setItem("accessToken", authData.accessToken);
                        localStorage.setItem("refreshToken", authData.refreshToken);
                        localStorage.setItem("currentUserId", authData.user.id);
                    }

                    // Format response để match với store expectation
                    const formattedResponse = {
                        success: true,
                        data: authData
                    };
                    setAuthData(formattedResponse);
                    router.replace("/me");
                    return;
                }

                setErrorAuth(result?.payload?.message ?? "Đăng nhập thất bại");
            } catch (error: any) {
                console.error("Login error:", error);
                setErrorAuth(
                    error?.message ||
                    error?.payload?.message ||
                    error?.response?.data?.message ||
                    "Lỗi hệ thống"
                );
            } finally {
                setLoadingAuth(false);
            }
        },
    });

    if (!mounted) {
        return null;
    }

    return (
        <Page data-testid="login-page" suppressHydrationWarning>
            <Content spacing={2}>
                <LogoWrap>
                    <Image
                        src="https://stc-zlogin.zdn.vn/images/zlogo.png"
                        alt="Zalo Logo"
                        width={100}
                        height={40}
                        priority
                    />
                </LogoWrap>

                <Subtitle>
                    {"Đăng nhập tài khoản Zalo\nđể kết nối với ứng dụng Zalo Web"}
                </Subtitle>

                <Card>
                    <FormLogin
                        formik={formik}
                        loading={loadingAuth}
                        errorMsg={errorAuth}
                        onGoRegister={() => router.push("/register")}
                    />
                </Card>
            </Content>
        </Page>
    );
}