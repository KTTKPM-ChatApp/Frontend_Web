"use client";

import * as React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TabContext } from "@mui/lab";
import { useRouter } from "next/navigation";

import {
    Card,
    CardHeader,
    Content,
    LogoWrap,
    Page,
    Subtitle,
    TabContainer,
    TabItem,
    Tabs,
} from "../Auth.styles";

import FormLogin from "./component/FormLogin";
import { useFormik } from "formik";
import { initialValues, validationSchemaLogin } from "./validate";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { authService } from "@/src/common/service/auth-service";

export default function LoginPage() {
    const Trans = useTrans();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);
    const [tab, setTab] = useState("loginPsw");

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
            setErrorAuth(null);
            setLoadingAuth(true);

            try {
                const result = await authService.authLogin({
                    email: values.email,
                    password: values.password,
                });

                console.log("[LOGIN] result.ok:", result?.ok);
                console.log("[LOGIN] result:", result);

                const payload = result?.payload as any;
                
                if (result?.ok && payload?.accessToken) {
                    console.log('[LOGIN] Login successful, tokens received');
                    if (typeof window !== "undefined") {
                        localStorage.setItem("accessToken", payload.accessToken);
                        localStorage.setItem("refreshToken", payload.refreshToken);
                        localStorage.setItem("currentUserId", payload.user.id);
                    }

                    setAuthData(payload);
                    router.replace("/me");
                    return;
                }

                setErrorAuth(payload?.message ?? Trans("LOGIN.FAILED"));
            } catch (error: any) {
                console.error("Login error:", error);
                setErrorAuth(
                    error?.message ||
                    error?.payload?.message ||
                    error?.response?.data?.message ||
                    Trans("COMMON.SYSTEM_ERROR")
                );
            } finally {
                setLoadingAuth(false);
            }
        },
    });

    const handleChangeTab = (_event: React.SyntheticEvent, newTab: string) => {
        setTab(newTab);
    };

    if (!mounted) {
        return null;
    }

    return (
        <Page data-testid="login-page" suppressHydrationWarning>
            <Content spacing={2}>
                <LogoWrap>
                    <Image
                        src="https://stc-zlogin.zdn.vn/images/zlogo.png"
                        alt={Trans("LOGIN.LOGO_ALT")}
                        width={100}
                        height={40}
                        priority
                    />
                </LogoWrap>

                <Subtitle>
                    {Trans("LOGIN.SUBTITLE")}
                </Subtitle>

                <Card>
                    <TabContext value={tab}>
                        <TabContainer>
                            <CardHeader>
                                <Tabs onChange={handleChangeTab} aria-label="login tabs">
                                    <TabItem label={Trans("LOGIN.PASSWORD_TAB")} value="loginPsw" />
                                </Tabs>
                            </CardHeader>

                            <FormLogin
                                tab={tab}
                                formik={formik}
                                loading={loadingAuth}
                                errorMsg={errorAuth}
                                onGoRegister={() => router.push("/register")}
                            />
                        </TabContainer>
                    </TabContext>
                </Card>
            </Content>
        </Page>
    );
}