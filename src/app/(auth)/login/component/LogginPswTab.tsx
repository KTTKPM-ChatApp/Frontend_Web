"use client";

import * as React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HttpsRoundedIcon from "@mui/icons-material/HttpsRounded";

import { COUNTRIES, Country } from "../../../constant";
import {
    AuthTextField,
    CountryDial,
    CountryItem,
    countryMenuProps,
    CountryName,
    CountryRow,
    Forgot,
    GridIcon,
    GridPswFrm,
    HelperTextAuth,
    LoginButton,
    Panel,
    PrefixSelect,
    ToRegisPage,
} from "../../Auth.styles";
import { FormikLike } from "@/src/common/interface/formik-interface";

import { styled } from "@mui/material/styles";
import { useTrans } from "@/src/common/utilities/hook/trans";
const PasswordFormStyled = styled(Stack)({
    gap: 16,
    padding: "16px 72px",
});

export interface LoginFormValues {
    phone: string;
    password: string;
}

export interface LoginPasswordTabProps {
    country: Country;
    setCountry: (c: Country) => void;
    formik: FormikLike<LoginFormValues>;
    loading?: boolean;
    errorMsg?: string | null;
    onGoRegister: () => void;
}

export default function LoginPasswordTab(props: LoginPasswordTabProps) {
    const { country, setCountry, formik, loading, errorMsg, onGoRegister } = props;
    const Trans = useTrans();
    const allowOnlyNumberKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowKeys = [
            "Backspace",
            "Delete",
            "Tab",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
        ];

        if (allowKeys.includes(e.key)) return;

        if (e.ctrlKey || e.metaKey) return;
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };
    const allowOnlyNumberPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text");
        if (!/^\d+$/.test(text)) {
            e.preventDefault();
        }
    };

    return (
        <Panel value="loginPsw">
            <form autoComplete="off" onSubmit={formik.handleSubmit}>
                <PasswordFormStyled>
                    {/* PHONE */}
                    <Box><GridPswFrm size={12} container>
                        <GridIcon size={1}>
                            <PhoneIphoneRoundedIcon color="action" sx={{ fontSize: 14 }} />
                        </GridIcon>

                        <Grid size={2} display="flex" alignItems="stretch">
                            <PrefixSelect
                                value={country.code}
                                MenuProps={countryMenuProps}
                                renderValue={(value) => {
                                    const c = COUNTRIES.find((x) => x.code === value);
                                    return c ? c.dial : "";
                                }}
                                onChange={(e) => {
                                    const c = COUNTRIES.find((x) => x.code === e.target.value);
                                    if (c) setCountry(c);
                                }}
                                fullWidth
                                sx={{ height: "100%" }}
                            >
                                {COUNTRIES.map((c) => (
                                    <CountryItem key={c.code} value={c.code}>
                                        <CountryRow>
                                            <CountryName>{c.name}</CountryName>
                                            <CountryDial>({c.dial})</CountryDial>
                                        </CountryRow>
                                    </CountryItem>
                                ))}
                            </PrefixSelect>
                        </Grid>

                        <Grid size={9} display="flex" alignItems="stretch">
                            <AuthTextField
                                name="phone"
                                value={formik.values.phone ?? ""}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder={Trans("LOGIN.PHONE_PLACEHOLDER")}
                                inputMode="numeric"
                                fullWidth
                                autoComplete="new-password"
                                error={Boolean(formik.touched.phone && formik.errors.phone)}
                                slotProps={{
                                    htmlInput: {
                                        inputMode: "numeric",
                                        pattern: "[0-9]*",
                                        onKeyDown: allowOnlyNumberKey,
                                        onPaste: allowOnlyNumberPaste,
                                    },
                                }}
                            />
                        </Grid>
                    </GridPswFrm>
                        {formik.touched.phone && formik.errors.phone && (
                            <Grid size={12}>
                                <HelperTextAuth >
                                    {formik.errors.phone as string}
                                </HelperTextAuth>
                            </Grid>
                        )}</Box>
                    {/* PASSWORD */}
                    <Box>
                        <GridPswFrm container size={12}>
                            <GridIcon size={1}>
                                <HttpsRoundedIcon color="action" sx={{ fontSize: 14 }} />
                            </GridIcon>

                            <Grid size={11}>
                                <AuthTextField
                                    name="password"
                                    value={formik.values.password ?? ""}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={Trans("LOGIN.PASSWORD_PLACEHOLDER")}
                                    type="password"
                                    fullWidth
                                    autoComplete="new-password"
                                    error={Boolean(formik.touched.password && formik.errors.password)}
                                />
                            </Grid>
                        </GridPswFrm>
                        {formik.touched.password && formik.errors.password && (
                            <Grid size={12}>
                                <HelperTextAuth >
                                    {formik.errors.password as string}
                                </HelperTextAuth>
                            </Grid>
                        )}
                    </Box>
                    {errorMsg ? (
                        <Typography color="error" fontSize={13}>
                            {errorMsg}
                        </Typography>
                    ) : null}

                    <LoginButton
                        type="submit"
                        disabled={Boolean(loading)}
                        fullWidth
                        sx={{ mt: 2, mb: 1 }}
                    >
                        {loading ? Trans("LOGIN.LOADING") : Trans("LOGIN.SUBMIT")}
                    </LoginButton>

                    <Forgot>
                        {Trans("LOGIN.FORGOT_PASSWORD")}
                    </Forgot>

                    <ToRegisPage
                        onClick={onGoRegister}
                        variant="body2"
                        color="text.secondary"
                    >
                        {Trans("LOGIN.NO_ACCOUNT")}
                    </ToRegisPage>
                </PasswordFormStyled>
            </form>
        </Panel>
    );
}
