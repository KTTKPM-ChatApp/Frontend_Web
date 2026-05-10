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

export default function RegisterPage() {
    const router = useRouter();
    const Trans = useTrans();
    const [confirmPsw, setConfirmPsw] = useState("");

    const {
        setLoadingAuth,
        setErrorAuth,
        setAuthData } = useAuthStore();

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchemaRegisForm(Trans),
        onSubmit: async (values) => {
            console.log("Register form submitting with values:", JSON.stringify(values));
            setErrorAuth(null);
            setLoadingAuth(true);
            try {
                console.log("Calling authService.authRegister...");
                const result = await authService.authRegister(values);
                console.log("API call result:", result);
                const payload = result?.payload;
                console.log("Parsed payload:", payload);

                if (result?.ok && payload?.user) {
                    // Backend trả về user object trực tiếp, không có success field
                    setAuthData({
                        success: true,
                        data: {
                            accessToken: "", // Sẽ được set sau khi login
                            refreshToken: "",
                            user: payload.user
                        },
                        message: "Đăng ký thành công"
                    });
                    router.push("/me");
                } else {
                    setErrorAuth(payload?.message || Trans("COMMON.ERROR") || "lỗi API");
                }
            } catch (error) {
                console.log("Register error: ", error);
                setErrorAuth(Trans("COMMON.ERROR"));
            } finally {
                setLoadingAuth(false);
            }
        },
    });







    return (
        <Page>
            <Content spacing={2}>
                <LogoWrap>
                    <Image
                        src="https://stc-zlogin.zdn.vn/images/zlogo.png"
                        alt="Zalo Logo"
                        width={80}
                        height={35}
                        priority
                    />
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
                            confirmPsw={confirmPsw}
                            setConfirmPsw={setConfirmPsw}
                            onGoLogin={() => router.push("/login")}
                        />
                    </TabContainer>
                </Card>
            </Content>
        </Page>
    );
}