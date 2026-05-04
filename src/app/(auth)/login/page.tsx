"use client";

import * as React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TabContext } from "@mui/lab";
import { COUNTRIES, Country } from "../../constant";
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
    const [tab, setTab] = useState("loginQR");
    const [country, setCountry] = useState<Country>(COUNTRIES[0]);

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
                const raw = String(values.phone || "").replace(/\D/g, "");
                let phoneFinal = raw;

                if (raw === "0901111111") {
                    phoneFinal = raw;
                } else if (raw.length === 10 && raw.startsWith("0")) {
                    phoneFinal = `+84${raw.slice(1)}`;
                } else if (raw.length === 9) {
                    phoneFinal = `+84${raw}`;
                }

                const result = await authService.authLogin({
                    phone: phoneFinal,
                    password: values.password,
                });

                const payload = result?.payload;
                
                console.log("[LOGIN] result.ok:", result?.ok);
                console.log("[LOGIN] payload.success:", payload?.success);
                console.log("[LOGIN] payload.data:", payload?.data);
                console.log("[LOGIN] payload.data.tokens:", payload?.data?.tokens);
                console.log("[LOGIN] accessToken:", payload?.data?.tokens?.accessToken);

                if (result?.ok && payload?.success && payload?.data?.tokens?.accessToken) {
                    if (typeof window !== "undefined") {
                        localStorage.setItem("accessToken", payload.data.tokens.accessToken);
                        localStorage.setItem("refreshToken", payload.data.tokens.refreshToken);
                        localStorage.setItem("currentUserId", payload.data.user.id);
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
                                    <TabItem label={Trans("LOGIN.QR_TAB")} value="loginQR" />
                                    <TabItem label={Trans("LOGIN.PASSWORD_TAB")} value="loginPsw" />
                                </Tabs>
                            </CardHeader>

                            <FormLogin
                                tab={tab}
                                country={country}
                                setCountry={setCountry}
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