"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";

import {
    Page, Content, LogoWrap, Subtitle, Card,
    AuthTextField, GridIcon, GridPswFrm, LoginButton,
    HelperTextAuth, AuthHeader,
} from "../Auth.styles";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { authService } from "@/src/common/service/auth-service";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import HttpsRoundedIcon from "@mui/icons-material/HttpsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import { Grid, Stack, Typography } from "@mui/material";

const initialValues = {
    username: "",
    email: "",
    password: "",
    displayName: "",
};

export default function RegisterPage() {
    const router = useRouter();

    const {
        setLoadingAuth,
        setErrorAuth,
        setAuthData,
        errorAuth,
        loadingAuth
    } = useAuthStore();

    const validationSchema = yup.object({
        username: yup
            .string()
            .min(3, "Username must be at least 3 characters")
            .required("Username is required"),
        email: yup
            .string()
            .email("Invalid email")
            .required("Email is required"),
        password: yup
            .string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
        displayName: yup
            .string()
            .min(2, "Display name must be at least 2 characters")
            .required("Display name is required"),
    });

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            setErrorAuth(null);
            setLoadingAuth(true);

            try {
                const payload = {
                    username: values.username.trim(),
                    email: values.email.trim(),
                    password: values.password,
                    displayName: values.displayName.trim(),
                };

                console.log('[FRONTEND] Registration payload:', payload);
                console.log('[FRONTEND] Payload JSON:', JSON.stringify(payload));

                const result = await authService.authRegister(payload);
                console.log('[FRONTEND] Registration result:', result);

                // Handle both successful registration (user object) and login (tokens)
                if (result?.ok && result?.payload) {
                    const payload = result.payload as any;
                    
                    // If response has user object (registration successful)
                    if (payload.user && !payload.tokens) {
                        console.log('[FRONTEND] Registration successful, user created');
                        setErrorAuth("Registration successful! Please login.");
                        setTimeout(() => router.push("/login"), 2000);
                        return;
                    }
                    
                    // If response has tokens (login successful)
                    if (payload.tokens && payload.tokens.accessToken) {
                        console.log('[FRONTEND] Login successful, tokens received');
                        if (typeof window !== "undefined") {
                            localStorage.setItem("accessToken", payload.tokens.accessToken);
                            localStorage.setItem("refreshToken", payload.tokens.refreshToken);
                            localStorage.setItem("currentUserId", payload.user.id);
                        }
                        setAuthData(payload);
                        router.replace("/me");
                        return;
                    }
                }

                setErrorAuth((result?.payload as any)?.message ?? "Registration failed");
            } catch (error: any) {
                console.error("Registration error:", error);
                setErrorAuth(
                    error?.message ||
                    error?.payload?.message ||
                    error?.response?.data?.message ||
                    "Registration failed"
                );
            } finally {
                setLoadingAuth(false);
            }
        },
    });

    return (
        <Page data-testid="register-page">
            <Content spacing={2}>
                <LogoWrap>
                    <Image
                        src="https://stc-zlogin.zdn.vn/images/zlogo.png"
                        alt="Register"
                        width={100}
                        height={40}
                        priority
                    />
                </LogoWrap>

                <Subtitle>
                    Create your account
                </Subtitle>

                <Card>
                    <form onSubmit={formik.handleSubmit} style={{ padding: "24px 72px 32px" }}>
                        <Stack gap={2}>
                            {/* USERNAME */}
                            <GridPswFrm container size={12}>
                                <GridIcon size={1}>
                                    <BadgeRoundedIcon color="action" sx={{ fontSize: 14 }} />
                                </GridIcon>
                                <Grid size={11}>
                                    <AuthTextField
                                        name="username"
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Username"
                                        type="text"
                                        fullWidth
                                        error={Boolean(formik.touched.username && formik.errors.username)}
                                        helperText={formik.touched.username ? formik.errors.username : ""}
                                    />
                                </Grid>
                            </GridPswFrm>

                            {/* EMAIL */}
                            <GridPswFrm container size={12}>
                                <GridIcon size={1}>
                                    <EmailRoundedIcon color="action" sx={{ fontSize: 14 }} />
                                </GridIcon>
                                <Grid size={11}>
                                    <AuthTextField
                                        name="email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Email"
                                        type="email"
                                        fullWidth
                                        error={Boolean(formik.touched.email && formik.errors.email)}
                                        helperText={formik.touched.email ? formik.errors.email : ""}
                                    />
                                </Grid>
                            </GridPswFrm>

                            {/* DISPLAY NAME */}
                            <GridPswFrm container size={12}>
                                <GridIcon size={1}>
                                    <BadgeRoundedIcon color="action" sx={{ fontSize: 14 }} />
                                </GridIcon>
                                <Grid size={11}>
                                    <AuthTextField
                                        name="displayName"
                                        value={formik.values.displayName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Display Name"
                                        type="text"
                                        fullWidth
                                        error={Boolean(formik.touched.displayName && formik.errors.displayName)}
                                        helperText={formik.touched.displayName ? formik.errors.displayName : ""}
                                    />
                                </Grid>
                            </GridPswFrm>

                            {/* PASSWORD */}
                            <GridPswFrm container size={12}>
                                <GridIcon size={1}>
                                    <HttpsRoundedIcon color="action" sx={{ fontSize: 14 }} />
                                </GridIcon>
                                <Grid size={11}>
                                    <AuthTextField
                                        name="password"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="Password"
                                        type="password"
                                        fullWidth
                                        error={Boolean(formik.touched.password && formik.errors.password)}
                                        helperText={formik.touched.password ? formik.errors.password : ""}
                                    />
                                </Grid>
                            </GridPswFrm>

                            {/* ERROR MESSAGE */}
                            {errorAuth && (
                                <Typography color="error" fontSize={13}>
                                    {errorAuth}
                                </Typography>
                            )}

                            {/* SUBMIT BUTTON */}
                            <LoginButton
                                type="submit"
                                disabled={loadingAuth}
                                fullWidth
                                sx={{ mt: 2, mb: 1 }}
                            >
                                {loadingAuth ? "Registering..." : "Register"}
                            </LoginButton>

                            {/* LOGIN LINK */}
                            <Typography variant="body2" color="text.secondary" align="center">
                                Already have an account?{" "}
                                <Typography
                                    component="span"
                                    variant="body2"
                                    color="primary"
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => router.push("/login")}
                                >
                                    Login
                                </Typography>
                            </Typography>
                        </Stack>
                    </form>
                </Card>
            </Content>
        </Page>
    );
}