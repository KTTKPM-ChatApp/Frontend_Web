"use client";

import { Country } from "../../../constant";
import { FormikLike } from "@/src/common/interface/formik-interface";
import LoginPasswordTab, { LoginFormValues } from "./LogginPswTab";
import LoginQrTab from "./LogginQRTab";


export interface FormLoginProps {
    tab: string;
    country: Country;
    setCountry: (c: Country) => void;

    formik: FormikLike<LoginFormValues>;

    loading?: boolean;
    errorMsg?: string | null;
    onGoRegister: () => void;
}

export default function FormLogin(props: FormLoginProps) {
    const { country, setCountry, formik, loading, errorMsg, onGoRegister, tab } = props;
    return (
        <>{tab === "loginQR" ? <LoginQrTab /> : <LoginPasswordTab
            country={country}
            setCountry={setCountry}
            formik={formik}
            loading={loading}
            errorMsg={errorMsg}
            onGoRegister={onGoRegister}
        />}


        </>
    );
}
