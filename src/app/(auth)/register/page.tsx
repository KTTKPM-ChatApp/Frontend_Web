"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { COUNTRIES, Country } from "../../constant";
import { useFormik } from "formik";

import {
    Page, Content, LogoWrap, Subtitle, Card,
    TabContainer, CardHeader,
    AuthHeader,
} from "../Auth.styles";
import { useAuthStore } from "@/src/common/store/useAuthStore";
import { ConfirmationResult } from "firebase/auth";
import { initialValues, validationSchemaRegisForm, validationSchemaRegisFull, } from "./validate";
import { authService } from "@/src/common/service/auth-service";
import { useTrans } from "@/src/common/utilities/hook/trans";
import { sendOtp, verifyOtp, setupRecaptcha, clearRecaptcha } from "@/src/common/firebase/phone-auth";
import FormRegis from "./component/FormRegis";

export type Step = "FORM" | "OTP" | "AFTER_OTP";

export default function RegisterPage() {
    const router = useRouter();
    const Trans = useTrans();
    const OTP_LENGTH = 6;
    const [country, setCountry] = React.useState<Country>(COUNTRIES[0]);
    const [phone, setPhone] = useState("");
    const [confirmPsw, setConfirmPsw] = useState("");
    const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
    const [otpArr, setOtpArr] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const otp = otpArr.join("");
    const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpMsg, setOtpMsg] = useState<string | null>(null);
    const [step, setStep] = useState<Step>("FORM");

    const {
        setLoadingAuth,
        setErrorAuth,
        setAuthData } = useAuthStore();

    const onlyNumber = phone.replace(/\D/g, "");
    const national = onlyNumber.startsWith("0") ? onlyNumber.slice(1) : onlyNumber;
    const phoneE164 = `${country.dial}${national}`;

    const validationSchema = React.useMemo(() => {
        if (step === "FORM" || step === "OTP") return validationSchemaRegisForm(Trans);
        if (step === "AFTER_OTP") return validationSchemaRegisFull(Trans);
    }, [step, Trans]);

    const formik = useFormik({
        initialValues,
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            setOtpMsg(null);
            setErrorAuth(null);

            if (!otpVerified || !values.firebaseIdToken) {
                setOtpMsg("Bạn cần xác thực trước khi đăng ký");
                return;
            }

            setLoadingAuth(true);
            try {
                const payload = {
                    firebaseIdToken: values.firebaseIdToken,
                    password: values.password,
                    fullName: values.fullName.trim(),
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    ...(values.email?.trim() ? { email: values.email.trim() } : {}),
                };

                const result = await authService.authRegister(payload);

                if (result?.ok && result?.payload?.data) {
                    router.push("/me");
                    setAuthData(result?.payload)
                    return;
                }
            } catch (error: any) {
                setErrorAuth(error?.response?.data?.message || "Đăng ký thất bại");
            } finally {
                setLoadingAuth(false);
            }
        }
    });

    const handlePhoneChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const onlyNumber = e.target.value.replace(/\D/g, "");
        setPhone(onlyNumber);
    };

    const actualSendOTP = async () => {
        setOtpMsg("Đang gửi OTP...");

        try {
            const c = await sendOtp(phoneE164);

            setConfirmation(c);
            setOtpSent(true);
            setOtpVerified(false);
            setOtpArr(Array(OTP_LENGTH).fill(""));
            await formik.setFieldValue("firebaseIdToken", "");
            setOtpMsg("Đã gửi OTP, vui lòng kiểm tra SMS");

            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 100);
        } catch (error: any) {
            console.error("Send OTP failed:", error);
            setOtpMsg(error?.message || "Gửi OTP thất bại!");
            setOtpSent(false);
        }
    };

    const handleSendOTP = React.useCallback(async () => {
        setOtpMsg(null);

        if (!phone || phone.length < 9) {
            setOtpMsg("Số điện thoại không hợp lệ");
            return;
        }

        try {
            await setupRecaptcha(
                "recaptcha-container",
                actualSendOTP,
                () => {
                    setOtpMsg("Captcha đã hết hạn. Vui lòng thử lại.");
                }
            );
        } catch (error: any) {
            setOtpMsg(error?.message || "Không thể khởi tạo captcha!");
        }
    }, [phone]);
    const handleVerifyOTP = async () => {
        setOtpMsg(null);

        if (!confirmation) {
            setOtpMsg("Vui lòng bấm xác nhận mã reCAPTCHA để nhận mã OTP!");
            return;
        }

        if (otp.length !== 6) {
            setOtpMsg("Vui lòng nhập đủ 6 số OTP");
            return;
        }

        try {
            const { firebaseIdToken } = await verifyOtp(confirmation, otp);
            await formik.setFieldValue("firebaseIdToken", firebaseIdToken);
            setOtpVerified(true);
            setOtpSent(false);
            setOtpMsg("Xác thực OTP thành công!");
        } catch (e: any) {
            const msg = e?.message || "";

            if (msg.includes("expired") || msg.includes("timeout") ||
                msg.includes("session-expired") || msg.includes("code-expired")) {
                setOtpMsg("OTP đã hết hạn. Vui lòng gửi lại mã mới.");
                setOtpSent(false);
                return;
            }

            setOtpMsg("OTP không đúng hoặc đã hết hạn");
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const next = [...otpArr];
        next[index] = value;
        setOtpArr(next);

        if (value && index < OTP_LENGTH - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otpArr[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        if (!paste) return;

        const arr = paste.split("");
        while (arr.length < OTP_LENGTH) arr.push("");

        setOtpArr(arr);
        otpRefs.current[Math.min(paste.length, OTP_LENGTH) - 1]?.focus();
    };

    useEffect(() => {
        return () => {
            clearRecaptcha();
        };
    }, []);

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
                            step={step}
                            setStep={setStep}
                            formik={formik}
                            confirmPsw={confirmPsw}
                            setConfirmPsw={setConfirmPsw}
                            country={country}
                            setCountry={setCountry}
                            phone={phone}
                            onPhoneChange={handlePhoneChange}
                            otp={{
                                otpSent,
                                otpVerified,
                                otpMsg,
                                otpArr,
                                otpLength: OTP_LENGTH,
                            }}
                            setOtpSent={setOtpSent}
                            setOtpVerified={setOtpVerified}
                            setOtpArr={setOtpArr}
                            setOtpMsg={setOtpMsg}
                            otpRefs={otpRefs}
                            onSendOtp={handleSendOTP}
                            onVerifyOtp={handleVerifyOTP}
                            onOtpChange={handleOtpChange}
                            onOtpKeyDown={handleOtpKeyDown}
                            onOtpPaste={handleOtpPaste}
                            onGoLogin={() => router.push("/login")}
                            phoneE164Label={phoneE164}
                        />
                    </TabContainer>
                </Card>
            </Content>
        </Page>
    );
}