import * as yup from "yup";

export const initialValues = {
    phone: "",
    password: "",
};

export const validationSchemaLogin = (Trans: (key: string) => string) => {
    return yup.object({
        phone: yup
            .string()
            .required(Trans("LOGIN.PHONE.REQUIRED"))
            .matches(/^\d{9,11}$/, Trans("VALIDATION.PHONE_INVALID") || "Số điện thoại không hợp lệ"),
        password: yup
            .string()
            .required(Trans("LOGIN.PASSWORD.REQUIRED")),
    });
};
