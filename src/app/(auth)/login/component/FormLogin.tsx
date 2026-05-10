"use client";

import { FormikLike } from "@/src/common/interface/formik-interface";
import LoginPasswordTab, { LoginFormValues } from "./LogginPswTab";


export interface FormLoginProps {
    formik: FormikLike<LoginFormValues>;

    loading?: boolean;
    errorMsg?: string | null;
    onGoRegister: () => void;
}

export default function FormLogin(props: FormLoginProps) {
    const { formik, loading, errorMsg, onGoRegister } = props;
    return (
        <LoginPasswordTab
            formik={formik}
            loading={loading}
            errorMsg={errorMsg}
            onGoRegister={onGoRegister}
        />
    );
}
