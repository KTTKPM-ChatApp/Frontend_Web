"use client";

import * as React from "react";
import { Grid, Stack, Typography, MenuItem, Select } from "@mui/material";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import HttpsRoundedIcon from "@mui/icons-material/HttpsRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CakeIcon from '@mui/icons-material/Cake';
import { COUNTRIES, Country } from "../../../constant";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import TransgenderIcon from "@mui/icons-material/Transgender";
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import {
  PrefixSelect,
  CountryItem,
  CountryRow,
  CountryName,
  CountryDial,
  AuthTextField,
  GridPswFrm,
  GridIcon,
  LoginButton,
  Forgot,
  countryMenuProps,
  StyledGenderItem,
  StyledGenderSelect,
  StyledOtpInput,
  CaptchaWrapper,
  CaptchaBox,
} from "../../Auth.styles";
import { useEffect } from "react";
import { clearRecaptcha } from "@/src/common/firebase/phone-auth";
import { Step } from "../page";
import { FormikLike } from "@/src/common/interface/formik-interface";
interface OtpState {
  otpSent: boolean;
  otpVerified: boolean;
  otpMsg: string | null;
  otpArr: string[];
  otpLength: number;
}
export interface FormRegisProps {
  formik: FormikLike;
  confirmPsw: string;
  setConfirmPsw: (v: string) => void;
  country: Country;
  setCountry: (c: Country) => void;
  phone: string;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  step: Step;
  setStep: (s: Step) => void;
  otp: OtpState;
  setOtpSent: (v: boolean) => void;
  setOtpVerified: (v: boolean) => void;
  setOtpArr: (arr: string[]) => void;
  setOtpMsg: (msg: string | null) => void;
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onSendOtp: () => Promise<void>;
  onVerifyOtp: () => Promise<void>;
  onOtpChange: (value: string, index: number) => void;
  onOtpKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onGoLogin: () => void;
  phoneE164Label?: string;
}

export default function FormRegis(props: FormRegisProps) {
  const {
    formik,
    confirmPsw,
    setConfirmPsw,
    country,
    setCountry,
    phone,
    onPhoneChange,
    step,
    setStep,
    otp,
    setOtpSent,
    setOtpVerified,
    setOtpArr,
    setOtpMsg,
    otpRefs,
    onSendOtp,
    onVerifyOtp,
    onOtpChange,
    onOtpKeyDown,
    onOtpPaste,
    onGoLogin,
  } = props;

  const captchaSetupRef = React.useRef(false);
  const { otpSent, otpVerified, otpMsg, otpArr, otpLength } = otp;
  const onSendOtpRef = React.useRef(onSendOtp);
  const setOtpMsgRef = React.useRef(setOtpMsg);
  React.useEffect(() => {
    onSendOtpRef.current = onSendOtp;
    setOtpMsgRef.current = setOtpMsg;
  }, [onSendOtp, setOtpMsg]);
  const resetOtpState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpArr(Array(otpLength).fill(""));
    setOtpMsg(null);
  };

  const handleRegisterClick = async () => {
    formik.setTouched?.({ email: true, password: true }, true);
    if (formik.validateForm) {
      const errs = await formik.validateForm();
      if (errs && Object.keys(errs).length > 0) {
        return;
      }
    } else {
      if (!formik.values.email || !formik.values.password) {
        return;
      }
    }

    if (!phone) {
      setOtpMsg("Vui lòng nhập số điện thoại.");
      return;
    }

    if (confirmPsw !== formik.values.password) {
      setOtpMsg("Mật khẩu nhập lại không khớp.");
      return;
    }

    setOtpMsg(null);
    setStep("OTP");
    resetOtpState();
    captchaSetupRef.current = false;
  };

  const handleVerifyClick = async () => {
    await onVerifyOtp();
  };

  useEffect(() => {
    if (step === "OTP" && otpVerified) {
      setStep("AFTER_OTP");
    }
  }, [step, otpVerified, setStep]);
  useEffect(() => {
    if (step !== "OTP" || otpVerified || captchaSetupRef.current) return;

    captchaSetupRef.current = true;

    const timer = setTimeout(async () => {
      try {
        await onSendOtpRef.current();
      } catch (e: any) {
        setOtpMsgRef.current("Không thể khởi tạo captcha. Vui lòng thử lại.");
        captchaSetupRef.current = false;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [step, otpVerified]);
  return (
    <Stack gap={2} sx={{ padding: "24px 72px 32px" }}>

      {/* ===== STEP 1: FORM ===== */}
      {step === "FORM" && (
        <>
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

          {/* PHONE */}
          <GridPswFrm size={12} container>
            <GridIcon size={1}>
              <PhoneIphoneRoundedIcon color="action" sx={{ fontSize: 14 }} />
            </GridIcon>

            <Grid size={2} display="flex" alignItems="stretch">
              <PrefixSelect
                value={country.code}
                MenuProps={countryMenuProps}
                renderValue={(value: any) => {
                  const c = COUNTRIES.find((x) => x.code === value);
                  return c ? c.dial : "";
                }}
                onChange={(e: any) => {
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
                value={phone}
                onChange={onPhoneChange}
                placeholder="Số điện thoại"
                fullWidth
                slotProps={{
                  htmlInput: { inputMode: "numeric", pattern: "[0-9]*" },
                }}
              />
            </Grid>
          </GridPswFrm>

          <form>
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
                  placeholder="Mật khẩu"
                  type="password"
                  fullWidth
                  error={Boolean(formik.touched.password && formik.errors.password)}
                  helperText={formik.touched.password ? formik.errors.password : ""}
                />
              </Grid>
            </GridPswFrm>

            {/* CONFIRM PASSWORD */}
            <GridPswFrm container size={12}>
              <GridIcon size={1}>
                <HttpsRoundedIcon color="action" sx={{ fontSize: 14 }} />
              </GridIcon>
              <Grid size={11}>
                <AuthTextField
                  value={confirmPsw}
                  onChange={(e: any) => setConfirmPsw(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  type="password"
                  fullWidth
                />
              </Grid>
            </GridPswFrm>
          </form>

          {otpMsg && (
            <Typography fontSize={13} color="error" textAlign="center">
              {otpMsg}
            </Typography>
          )}

          <LoginButton type="button" fullWidth sx={{ mt: 1 }} disabled={!phone} onClick={handleRegisterClick}>
            Đăng ký
          </LoginButton>

          <Forgot onClick={onGoLogin}>Đã có tài khoản? Đăng nhập</Forgot>
        </>
      )}

      {/* ===== STEP 2: OTP ===== */}
      {step === "OTP" && !otpVerified && (
        <>
          <Typography variant="h6" textAlign="center" mb={1}>
            Xác thực OTP
          </Typography>
          <Typography variant="body2" textAlign="center" mb={2}>
            Mã OTP sẽ được gửi tới: {country.dial} {phone}
          </Typography>

          {!otpSent && (
            <CaptchaWrapper>
              <CaptchaBox id="recaptcha-container" />
            </CaptchaWrapper>
          )}

          {otpMsg && (
            <Typography
              color={otpMsg.includes("thành công") || otpMsg.includes("Đã gửi") ? "success.main" : "error"}
              variant="body2"
              textAlign="center"
              mt={1}
              mb={1}
            >
              {otpMsg}
            </Typography>
          )}

          {otpSent ? (
            <>
              <Stack direction="row" spacing={1} justifyContent="center" mb={2}>
                {otpArr.map((digit, i) => (
                  <StyledOtpInput
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    value={digit}
                    onChange={(e) => onOtpChange(e.target.value, i)}
                    onKeyDown={(e) => onOtpKeyDown(e, i)}
                    onPaste={onOtpPaste}
                    maxLength={1}
                    inputMode="numeric"
                    disabled={otpVerified}
                  />
                ))}
              </Stack>

              <LoginButton fullWidth onClick={handleVerifyClick}>
                Xác thực OTP
              </LoginButton>

              <Stack direction="row" spacing={3} justifyContent="space-between">
                <Typography
                  variant="body2"
                  sx={{
                    color: "#0190f3",
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={async () => {
                    try {
                      setOtpMsg(null);
                      resetOtpState();
                      captchaSetupRef.current = false;
                      clearRecaptcha();

                      setTimeout(async () => {
                        try {
                          await onSendOtp();
                        } catch (e) {
                          setOtpMsg("Gửi lại OTP thất bại.");
                        }
                      }, 200);
                    } catch (e) {
                      setOtpMsg("Gửi lại OTP thất bại.");
                    }
                  }}
                >
                  Gửi lại OTP
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{
                    "&:hover": {
                      textDecoration: "underline",
                      cursor: "pointer"
                    },
                  }}
                  onClick={() => {
                    resetOtpState();
                    captchaSetupRef.current = false;
                    clearRecaptcha();
                    setStep("FORM");
                  }}
                >
                  Quay lại
                </Typography>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="body2" textAlign="center" color="text.secondary" mt={1}>
                Vui lòng xác thực reCAPTCHA ở trên để nhận OTP
              </Typography>
              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
                sx={{
                  color: "#0190f3",
                  cursor: "pointer",
                  fontWeight: 600,
                  mt: 2,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={() => {
                  resetOtpState();
                  captchaSetupRef.current = false;
                  clearRecaptcha();
                  setStep("FORM");
                }}
              >
                Quay lại
              </Typography>
            </>
          )}
        </>
      )}
      {step === "AFTER_OTP" && otpVerified && (
        <>
          <Typography fontWeight={600} textAlign="center">
            Hoàn tất thông tin
          </Typography>
          {/* name */}
          <GridPswFrm container size={12}>
            <GridIcon size={1}>
              <BadgeRoundedIcon color="action" sx={{ fontSize: 14 }} />
            </GridIcon>
            <Grid size={11}>
              <AuthTextField
                name="fullName"
                placeholder="Tên Hiển Thị"
                value={formik.values.fullName ?? ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                error={Boolean(formik.touched.fullName && formik.errors.fullName)}
                helperText={formik.touched.fullName ? formik.errors.fullName : ""}
              />
            </Grid>
          </GridPswFrm>
          {/* DOB */}
          <GridPswFrm container size={12}>
            <GridIcon size={1}>
              <CakeIcon color="action" sx={{ fontSize: 14 }} />
            </GridIcon>
            <Grid size={11}>
              <AuthTextField
                name="dateOfBirth"
                value={formik.values.dateOfBirth ?? ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                type="date"
                fullWidth
                error={Boolean(formik.touched.dateOfBirth && formik.errors.dateOfBirth)}
                helperText={formik.touched.dateOfBirth ? formik.errors.dateOfBirth : ""}
              />
            </Grid>
          </GridPswFrm>

          {/* GENDER */}
          <StyledGenderSelect
            name="gender"
            value={formik.values.gender ?? ""}
            onChange={formik.handleChange as any}
            fullWidth
            displayEmpty
            renderValue={(value) => {
              if (!value) return "Chọn giới tính";

              if (value === "male")
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MaleIcon fontSize="small" sx={{ color: "#1976D2" }} />
                    <Typography fontSize={14}>Nam</Typography>
                  </Stack>
                );

              if (value === "female")
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FemaleIcon fontSize="small" sx={{ color: "#E91E63" }} />
                    <Typography fontSize={14}>Nữ</Typography>
                  </Stack>
                );

              return (
                <Stack direction="row" spacing={1} alignItems="center">
                  <TransgenderIcon fontSize="small" sx={{ color: "#9C27B0" }} />
                  <Typography fontSize={14}>Khác</Typography>
                </Stack>
              );
            }}
          >
            <StyledGenderItem value="" disabled>
              Chọn giới tính
            </StyledGenderItem>

            <StyledGenderItem value="male">
              <Stack direction="row" spacing={1} alignItems="center">
                <MaleIcon fontSize="small" sx={{ color: "#1976D2" }} />
                <Typography fontSize={14}>Nam</Typography>
              </Stack>
            </StyledGenderItem>

            <StyledGenderItem value="female">
              <Stack direction="row" spacing={1} alignItems="center">
                <FemaleIcon fontSize="small" sx={{ color: "#E91E63" }} />
                <Typography fontSize={14}>Nữ</Typography>
              </Stack>
            </StyledGenderItem>

            <StyledGenderItem value="other">
              <Stack direction="row" spacing={1} alignItems="center">
                <TransgenderIcon fontSize="small" sx={{ color: "#9C27B0" }} />
                <Typography fontSize={14}>Khác</Typography>
              </Stack>
            </StyledGenderItem>
          </StyledGenderSelect>

          <form onSubmit={formik.handleSubmit}>
            <LoginButton type="submit" fullWidth sx={{ mt: 1 }}>
              Hoàn tất đăng ký
            </LoginButton>
          </form>

        </>
      )}
    </Stack>
  );
}